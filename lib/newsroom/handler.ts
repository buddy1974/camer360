/**
 * Route wrapper for /api/newsroom/v1/*:
 *   enabled → raw body → verify signature/nonce → grant/role → writes enabled
 *   → idempotency (POST/PATCH) → run → audit → response (+ revalidation).
 *
 * Dependencies (store, media runtime, revalidation, clock) are resolved lazily
 * and can be replaced in tests via setNewsroomDeps — no database or R2 needed.
 */
import { randomUUID } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { getNewsroomConfig, siteUrl, type NewsroomConfig } from './config'
import { NewsroomError, errorResponse, jsonResponse, successBody } from './http'
import { verifySignedRequest, echoableRequestId, HEADERS } from './verify'
import { resolveActor, assertRouteRole, type Actor, type RouteRole } from './permissions'
import { beginIdempotent, finishIdempotent } from './idempotency'
import { auditResultFor, writeAudit } from './audit'
import type { NewsroomStore } from './store'
import type { MediaRuntime } from './media'
import type { RevalidateTarget, ServiceDeps } from './articles'

export const MAX_BODY_BYTES = 6 * 1024 * 1024 // 4 MB decoded media as base64 + JSON envelope

export interface NewsroomDeps {
  store: NewsroomStore
  media: () => Promise<MediaRuntime>
  revalidate: (targets: RevalidateTarget[]) => void | Promise<void>
  now: () => Date
}

let overrides: Partial<NewsroomDeps> | null = null
let defaultStore: NewsroomStore | null = null

/** Test hook: replace any dependency (pass null to restore defaults). */
export function setNewsroomDeps(d: Partial<NewsroomDeps> | null): void {
  overrides = d
}

export async function getNewsroomDeps(): Promise<NewsroomDeps> {
  const store = overrides?.store ?? (defaultStore ??= new (await import('./store-mysql')).MysqlStore())
  return {
    store,
    media: overrides?.media ?? (async () => (await import('./media-runtime')).createMediaRuntime()),
    revalidate: overrides?.revalidate ?? (async (t) => (await import('./revalidate')).revalidateArticles(t)),
    now: overrides?.now ?? (() => new Date()),
  }
}

export interface RouteCtx {
  req: NextRequest
  url: URL
  params: Record<string, string>
  actor: Actor
  requestId: string
  idempotencyKey: string | null
  body: unknown
  rawBody: string
  deps: NewsroomDeps
  service: ServiceDeps
  config: NewsroomConfig
}

export interface RouteResult {
  status?: number
  data: unknown
  articleId?: number | null
  changedFields?: string[]
  revalidate?: RevalidateTarget[]
}

export interface RouteOptions {
  /** audit operation name, e.g. 'create_draft' */
  operation: string
  role: RouteRole
  write: boolean
}

type SegmentCtx = { params: Promise<Record<string, string>> }

export function logInternal(operation: string, requestId: string, err: unknown): void {
  const e = err as { name?: string; code?: string; message?: string; sql?: string; sqlMessage?: string; cause?: { sql?: string; code?: string } } | null
  const isDb = !!(e?.sql || e?.sqlMessage || e?.cause?.sql || e?.cause?.code)
  // DB errors may embed SQL (and thus content) — log only their code.
  const detail = isDb ? `db:${e?.code ?? e?.cause?.code ?? 'error'}` : `${e?.name ?? 'Error'}: ${(e?.message ?? '').slice(0, 160)}`
  console.error(`[newsroom] ${operation} ${requestId} failed — ${detail}`)
}

export function newsroomRoute(opts: RouteOptions, run: (ctx: RouteCtx) => Promise<RouteResult>) {
  return async function handler(req: NextRequest, segment?: SegmentCtx): Promise<Response> {
    const cfg = getNewsroomConfig()
    let requestId = echoableRequestId(req.headers.get(HEADERS.requestId)) ?? randomUUID()

    if (!cfg.enabled) return errorResponse(new NewsroomError('API_DISABLED', 'Newsroom API is disabled'), requestId)
    if (!cfg.secret) return errorResponse(new NewsroomError('API_NOT_CONFIGURED', 'Newsroom API is not configured'), requestId)

    const declared = Number(req.headers.get('content-length') ?? '0')
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return errorResponse(new NewsroomError('BAD_REQUEST', 'Request body too large'), requestId)
    }
    let rawBody: string
    try {
      rawBody = await req.text()
    } catch {
      return errorResponse(new NewsroomError('BAD_REQUEST', 'Unreadable request body'), requestId)
    }
    if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
      return errorResponse(new NewsroomError('BAD_REQUEST', 'Request body too large'), requestId)
    }

    const deps = await getNewsroomDeps()
    const now = deps.now()

    // Steps 2–5: headers, timestamp, signature, nonce. Nothing touches the DB
    // until the signature is valid.
    let verified: Awaited<ReturnType<typeof verifySignedRequest>>
    try {
      verified = await verifySignedRequest(req, rawBody, deps.store, cfg.secret, now)
    } catch (err) {
      if (err instanceof NewsroomError) return errorResponse(err, requestId)
      logInternal(opts.operation, requestId, err)
      return errorResponse(new NewsroomError('INTERNAL', 'Internal error'), requestId)
    }
    requestId = verified.requestId

    const params = (segment ? await segment.params : {}) ?? {}
    const auditArticleId = params.id && /^\d+$/.test(params.id) ? Number(params.id) : null
    let reserved = false
    let audited = false
    const audit = async (result: { errorCode: string | null; articleId?: number | null; changedFields?: string[] }) => {
      if (!opts.write || audited) return
      audited = true
      await writeAudit(deps.store, {
        requestId,
        actor: verified.actor,
        operation: opts.operation,
        articleId: result.articleId ?? auditArticleId,
        changedFields: result.changedFields ?? null,
        idempotencyKey: verified.idempotencyKey,
        result: auditResultFor(result.errorCode),
        errorCode: result.errorCode,
      })
    }

    try {
      const actor = await resolveActor(verified.actor, deps.store, cfg.ownerIds)
      assertRouteRole(actor, opts.role)
      if (opts.write && !cfg.writesEnabled) throw new NewsroomError('WRITES_DISABLED', 'Newsroom writes are disabled')

      let body: unknown = undefined
      if (rawBody.trim() !== '') {
        try { body = JSON.parse(rawBody) } catch { throw new NewsroomError('BAD_REQUEST', 'Body is not valid JSON') }
      }

      if (opts.write) {
        const start = await beginIdempotent(deps.store, {
          key: verified.idempotencyKey!, actor: verified.actor, method: req.method,
          path: verified.pathWithQuery, rawBody, now,
        })
        if (start.kind === 'replay') {
          let replayBody: unknown = null
          try { replayBody = JSON.parse(start.bodyJson) } catch { /* keep null */ }
          if (replayBody && typeof replayBody === 'object') (replayBody as { requestId?: string }).requestId = requestId
          return jsonResponse(replayBody, start.status === 201 ? 200 : start.status, {
            'x-newsroom-request-id': requestId,
            'x-newsroom-idempotent-replay': 'true',
          })
        }
        reserved = true
      }

      const result = await run({
        req, url: new URL(req.url), params, actor, requestId,
        idempotencyKey: verified.idempotencyKey, body, rawBody, deps,
        service: { store: deps.store, now, siteUrl: siteUrl() },
        config: cfg,
      })
      const status = result.status ?? 200
      const envelope = successBody(result.data, requestId)
      const json = JSON.stringify(envelope)
      if (reserved) {
        await finishIdempotent(deps.store, verified.idempotencyKey!, verified.actor, status, json)
        reserved = false
      }
      await audit({ errorCode: null, articleId: result.articleId, changedFields: result.changedFields })
      if (result.revalidate?.length) {
        try { await deps.revalidate(result.revalidate) } catch { /* never fail a committed write */ }
      }
      return new Response(json, {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-newsroom-request-id': requestId },
      })
    } catch (err) {
      const nErr = err instanceof NewsroomError ? err : new NewsroomError('INTERNAL', 'Internal error')
      if (!(err instanceof NewsroomError)) logInternal(opts.operation, requestId, err)
      if (reserved) {
        await deps.store.releaseIdempotency(verified.idempotencyKey!, verified.actor).catch(() => {})
      }
      await audit({ errorCode: nErr.code })
      return errorResponse(nErr, requestId)
    }
  }
}

/** Parses the `[id]` route param; 404 for anything that is not a positive integer. */
export function articleIdParam(params: Record<string, string>): number {
  const raw = params.id ?? ''
  if (!/^\d{1,10}$/.test(raw) || Number(raw) <= 0) throw new NewsroomError('NOT_FOUND', 'Article not found')
  return Number(raw)
}
