/**
 * Newsroom API v1 request verification (contract §2).
 *
 * The canonical string MUST stay byte-identical to the TM signer
 * (newsroom-control-plane/lib/signing.ts). Any change is a protocol change.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { NewsroomError } from './http'
import type { NewsroomStore } from './store'

export const SIGNATURE_VERSION = 'v1'
export const TIMESTAMP_TOLERANCE_SECONDS = 300
/** Nonces are remembered for ≥ 10 minutes (> 2 × the timestamp window). */
export const NONCE_TTL_SECONDS = 15 * 60
export const MAX_IDEMPOTENCY_KEY_LENGTH = 200

export const HEADERS = {
  timestamp: 'x-newsroom-timestamp',
  nonce: 'x-newsroom-nonce',
  requestId: 'x-newsroom-request-id',
  actor: 'x-newsroom-actor',
  idempotencyKey: 'x-newsroom-idempotency-key',
  signature: 'x-newsroom-signature',
} as const

export const SCHEDULER_ACTOR = 'system:scheduler'

export interface SignatureInput {
  method: string
  /** pathname plus raw query string exactly as received */
  pathWithQuery: string
  /** raw request body ('' for none) */
  body: string | Uint8Array
  timestamp: number
  nonce: string
  actor: string
  requestId: string
  idempotencyKey?: string | null
}

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex')
}

/** RFC 3986 strict percent-encoding (encodeURIComponent leaves !'()* unescaped). */
function strictEncode(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function formDecode(s: string): string {
  try { return decodeURIComponent(s.replace(/\+/g, ' ')) } catch { return s }
}

/**
 * Canonical path + query (contract §2). The query is parsed as application/x-www-form-urlencoded
 * ('+' and '%20' are both a space), pairs are sorted by name then value, and re-encoded with
 * strict RFC 3986 encoding. Proxies that re-encode equivalent query bytes (e.g. %20 → '+')
 * therefore cannot break verification, while every name and value stays signed.
 */
export function canonicalPathWithQuery(pathWithQuery: string): string {
  const i = pathWithQuery.indexOf('?')
  if (i === -1) return pathWithQuery
  const path = pathWithQuery.slice(0, i)
  const pairs = pathWithQuery.slice(i + 1).split('&').filter(Boolean).map((part) => {
    const eq = part.indexOf('=')
    return eq === -1 ? [formDecode(part), ''] : [formDecode(part.slice(0, eq)), formDecode(part.slice(eq + 1))]
  })
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
  return pairs.length ? `${path}?${pairs.map(([k, v]) => `${strictEncode(k)}=${strictEncode(v)}`).join('&')}` : path
}

export function canonicalString(input: SignatureInput): string {
  return [
    SIGNATURE_VERSION,
    input.method.toUpperCase(),
    canonicalPathWithQuery(input.pathWithQuery),
    sha256Hex(input.body),
    String(input.timestamp),
    input.nonce,
    input.actor,
    input.requestId,
    input.idempotencyKey ?? '',
  ].join('\n')
}

export function computeSignature(secret: string, input: SignatureInput): string {
  return `${SIGNATURE_VERSION}=` + createHmac('sha256', secret).update(canonicalString(input)).digest('hex')
}

/** Constant-time comparison (hash both sides so length does not leak). */
export function signaturesEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb) && a.length === b.length
}

const TIMESTAMP_RE = /^\d{1,12}$/
const NONCE_RE = /^[0-9a-f]{32}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ACTOR_RE = /^telegram:\d{1,20}$/
const SIGNATURE_RE = /^v1=[0-9a-f]{64}$/
const IDEM_RE = /^[\x21-\x7e]{1,200}$/ // printable ASCII, no spaces

export interface SignedHeaders {
  timestamp: number
  nonce: string
  requestId: string
  actor: string
  idempotencyKey: string | null
  signature: string
}

export function isWriteMethod(method: string): boolean {
  const m = method.toUpperCase()
  return m === 'POST' || m === 'PATCH' || m === 'PUT' || m === 'DELETE'
}

/** A request id that is safe to echo back even when the request is rejected. */
export function echoableRequestId(raw: string | null | undefined): string | null {
  return raw && UUID_RE.test(raw) ? raw.toLowerCase() : null
}

/** Step 2: every required header present and well-formed, else SIGNATURE_INVALID. */
export function parseSignedHeaders(headers: Headers, method: string): SignedHeaders {
  const get = (h: string) => headers.get(h)?.trim() ?? ''
  const timestamp = get(HEADERS.timestamp)
  const nonce = get(HEADERS.nonce)
  const requestId = get(HEADERS.requestId)
  const actor = get(HEADERS.actor)
  const signature = get(HEADERS.signature)
  const idem = headers.get(HEADERS.idempotencyKey)
  const bad = (what: string) => new NewsroomError('SIGNATURE_INVALID', `Missing or malformed ${what}`)

  if (!TIMESTAMP_RE.test(timestamp)) throw bad(HEADERS.timestamp)
  if (!NONCE_RE.test(nonce)) throw bad(HEADERS.nonce)
  if (!UUID_RE.test(requestId)) throw bad(HEADERS.requestId)
  if (!ACTOR_RE.test(actor) && actor !== SCHEDULER_ACTOR) throw bad(HEADERS.actor)
  if (!SIGNATURE_RE.test(signature)) throw bad(HEADERS.signature)
  if (idem !== null && idem !== '' && !IDEM_RE.test(idem)) throw bad(HEADERS.idempotencyKey)
  if (isWriteMethod(method) && !idem) throw bad(HEADERS.idempotencyKey)

  return {
    timestamp: Number(timestamp),
    nonce,
    requestId,
    actor,
    idempotencyKey: idem ? idem : null,
    signature,
  }
}

/** Step 3: |now − timestamp| ≤ 300 s. */
export function timestampFresh(timestamp: number, nowMs: number): boolean {
  return Math.abs(Math.floor(nowMs / 1000) - timestamp) <= TIMESTAMP_TOLERANCE_SECONDS
}

/** `pathname?rawQuery` as received (or just pathname). */
export function pathWithQueryOf(url: string): string {
  // Avoid URL normalisation of the query: take the raw text after the origin.
  const afterScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i, '')
  const noHash = afterScheme.split('#')[0] || '/'
  const q = noHash.indexOf('?')
  if (q === -1) return noHash
  const path = noHash.slice(0, q)
  const query = noHash.slice(q + 1)
  return query ? `${path}?${query}` : path
}

export interface VerifiedRequest extends SignedHeaders {
  pathWithQuery: string
}

/**
 * Steps 2–5 of the verification order. Throws NewsroomError on failure.
 * The nonce is only consumed (stored) once the signature is valid, so
 * unsigned traffic never reaches the database.
 */
export async function verifySignedRequest(
  req: { method: string; url: string; headers: Headers },
  rawBody: string,
  store: Pick<NewsroomStore, 'consumeNonce'>,
  secret: string,
  now: Date = new Date(),
): Promise<VerifiedRequest> {
  const parsed = parseSignedHeaders(req.headers, req.method)
  if (!timestampFresh(parsed.timestamp, now.getTime())) {
    throw new NewsroomError('TIMESTAMP_EXPIRED', 'Request timestamp outside the allowed window')
  }
  const pathWithQuery = pathWithQueryOf(req.url)
  const expected = computeSignature(secret, {
    method: req.method,
    pathWithQuery,
    body: rawBody,
    timestamp: parsed.timestamp,
    nonce: parsed.nonce,
    actor: parsed.actor,
    requestId: parsed.requestId,
    idempotencyKey: parsed.idempotencyKey,
  })
  if (!signaturesEqual(parsed.signature, expected)) {
    throw new NewsroomError('SIGNATURE_INVALID', 'Signature does not match')
  }
  const expiresAt = new Date(now.getTime() + NONCE_TTL_SECONDS * 1000)
  const fresh = await store.consumeNonce(parsed.nonce, expiresAt, now)
  if (!fresh) throw new NewsroomError('NONCE_REPLAY', 'Nonce already used')
  return { ...parsed, pathWithQuery }
}
