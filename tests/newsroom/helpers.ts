/**
 * Shared fixtures for the Newsroom API tests. Importing this module forces a
 * dummy DB environment (via tests/security/env) and newsroom test settings,
 * and every test injects an in-memory store — no database, no R2.
 */
import '../security/env'
import { randomBytes, randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { MemoryStore } from '@/lib/newsroom/store-memory'
import { setNewsroomDeps } from '@/lib/newsroom/handler'
import { computeSignature, HEADERS } from '@/lib/newsroom/verify'
import type { MediaRuntime } from '@/lib/newsroom/media'
import type { RevalidateTarget } from '@/lib/newsroom/articles'

export const TEST_SECRET = 'newsroom-test-secret-not-real-0123456789'
export const OWNER_ID = '999000999'

export function resetEnv() {
  process.env.NEWSROOM_API_ENABLED = 'true'
  delete process.env.NEWSROOM_WRITES_ENABLED
  process.env.NEWSROOM_SIGNING_SECRET = TEST_SECRET
  process.env.NEWSROOM_OWNER_TELEGRAM_IDS = OWNER_ID
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.camer360.test'
  delete process.env.CRON_SECRET
}
resetEnv()

export const ACTORS = {
  viewer: 'telegram:111',
  contributor: 'telegram:222',
  contributor2: 'telegram:223',
  editor: 'telegram:333',
  publisher: 'telegram:444',
  inactive: 'telegram:555',
  unknown: 'telegram:777',
  owner: `telegram:${OWNER_ID}`,
  scheduler: 'system:scheduler',
} as const

export function makeStore(): MemoryStore {
  return new MemoryStore({
    categories: [
      { id: 9, slug: 'celebrities', name: 'Celebrities' },
      { id: 10, slug: 'music', name: 'Music' },
    ],
    authors: [{ id: 1, slug: 'desk', name: 'Camer360 Desk' }],
    grants: [
      { telegramUserId: '111', role: 'viewer', active: true, displayName: 'Viewer' },
      { telegramUserId: '222', role: 'contributor', active: true, displayName: 'Contrib' },
      { telegramUserId: '223', role: 'contributor', active: true, displayName: 'Contrib 2' },
      { telegramUserId: '333', role: 'editor', active: true, displayName: 'Editor' },
      { telegramUserId: '444', role: 'publisher', active: true, displayName: 'Publisher' },
      { telegramUserId: '555', role: 'publisher', active: false, displayName: 'Revoked' },
    ],
  })
}

export interface Harness {
  store: MemoryStore
  revalidated: RevalidateTarget[][]
  uploads: Map<string, { body: Buffer; contentType: string }>
}

export function mockMedia(uploads: Harness['uploads']): MediaRuntime {
  return {
    storage: {
      async put(key, body, contentType) { uploads.set(key, { body, contentType }) },
      async head(key) { const u = uploads.get(key); return u ? { contentType: u.contentType, size: u.body.length } : null },
      async get(key) { const u = uploads.get(key); if (!u) throw new Error('missing'); return u.body },
      async delete(key) { uploads.delete(key) },
      async presignPut(key) { return `https://r2.test/presigned/${key}?sig=x` },
      publicUrl(key) { return `https://cdn.camer360.test/${key}` },
    },
    async processImage(input) {
      if (input.subarray(0, 4).toString('latin1') !== 'IMG!') throw new Error('not an image')
      return { data: Buffer.from('WEBP' + input.length), width: 800, height: 600 }
    },
  }
}

export function installHarness(): Harness {
  resetEnv()
  const h: Harness = { store: makeStore(), revalidated: [], uploads: new Map() }
  setNewsroomDeps({
    store: h.store,
    media: async () => mockMedia(h.uploads),
    revalidate: (t) => { h.revalidated.push(t) },
  })
  return h
}

export interface SignOpts {
  method?: string
  path: string
  body?: unknown
  rawBody?: string
  actor?: string
  idempotencyKey?: string | null
  secret?: string
  timestamp?: number
  nonce?: string
  requestId?: string
  tamper?: (h: Headers) => void
}

export function signedRequest(o: SignOpts): NextRequest {
  const method = (o.method ?? 'GET').toUpperCase()
  const raw = o.rawBody ?? (o.body === undefined ? '' : JSON.stringify(o.body))
  const timestamp = o.timestamp ?? Math.floor(Date.now() / 1000)
  const nonce = o.nonce ?? randomBytes(16).toString('hex')
  const requestId = o.requestId ?? randomUUID()
  const actor = o.actor ?? ACTORS.publisher
  const isWrite = method === 'POST' || method === 'PATCH'
  const idem = o.idempotencyKey === undefined ? (isWrite ? `test:${randomUUID()}` : null) : o.idempotencyKey
  const headers = new Headers({ 'content-type': 'application/json' })
  headers.set(HEADERS.timestamp, String(timestamp))
  headers.set(HEADERS.nonce, nonce)
  headers.set(HEADERS.requestId, requestId)
  headers.set(HEADERS.actor, actor)
  if (idem) headers.set(HEADERS.idempotencyKey, idem)
  headers.set(HEADERS.signature, computeSignature(o.secret ?? TEST_SECRET, {
    method, pathWithQuery: o.path, body: raw, timestamp, nonce, actor, requestId, idempotencyKey: idem,
  }))
  o.tamper?.(headers)
  return new NextRequest(new URL(o.path, 'https://www.camer360.test'), {
    method, headers, body: raw === '' ? undefined : raw,
  })
}

export const params = (p: Record<string, string> = {}) => ({ params: Promise.resolve(p) })

export async function json(res: Response): Promise<{ ok: boolean; data?: any; error?: { code: string; message: string; fields?: Record<string, string> }; requestId: string }> { // eslint-disable-line @typescript-eslint/no-explicit-any
  return res.json()
}
