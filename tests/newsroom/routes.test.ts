import { test, describe, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { ACTORS, installHarness, json, params, resetEnv, signedRequest, TEST_SECRET, type Harness } from './helpers'
import { setNewsroomDeps } from '@/lib/newsroom/handler'
import { HEADERS } from '@/lib/newsroom/verify'

import * as health from '@/app/api/newsroom/v1/health/route'
import * as me from '@/app/api/newsroom/v1/me/route'
import * as categories from '@/app/api/newsroom/v1/categories/route'
import * as authors from '@/app/api/newsroom/v1/authors/route'
import * as articles from '@/app/api/newsroom/v1/articles/route'
import * as article from '@/app/api/newsroom/v1/articles/[id]/route'
import * as publish from '@/app/api/newsroom/v1/articles/[id]/publish/route'
import * as schedule from '@/app/api/newsroom/v1/articles/[id]/schedule/route'
import * as scheduler from '@/app/api/newsroom/v1/scheduler/run/route'
import * as cron from '@/app/api/newsroom/v1/cron/publish-scheduled/route'

let h: Harness
beforeEach(() => { h = installHarness() })
after(() => { setNewsroomDeps(null); resetEnv() })

const ARTICLES = '/api/newsroom/v1/articles'
const draftBody = { title: 'Salatiel live in Douala', body: '<p>Concert</p>', categoryId: 9 }

async function create(actor: string = ACTORS.contributor, body: unknown = draftBody, idempotencyKey?: string) {
  return articles.POST(signedRequest({ method: 'POST', path: ARTICLES, body, actor, idempotencyKey }), params())
}

describe('unsigned / invalid requests are rejected before any DB access', () => {
  test('GET /health works unsigned and reports flags only', async () => {
    const res = await health.GET()
    assert.equal(res.status, 200)
    const b = await json(res)
    assert.deepEqual(b.data, { status: 'ok', enabled: true, writesEnabled: true, configured: true, publication: 'camer360' })
    assert.ok(!JSON.stringify(b).includes(TEST_SECRET))
    assert.equal(h.store.calls, 0)
  })

  test('unsigned request → 401 SIGNATURE_INVALID, no store access', async () => {
    for (const [mod, method, path] of [[me, 'GET', '/api/newsroom/v1/me'], [articles, 'POST', ARTICLES], [articles, 'GET', ARTICLES]] as const) {
      const req = new NextRequest(new URL(path, 'https://www.camer360.test'), {
        method, body: method === 'POST' ? JSON.stringify(draftBody) : undefined,
      })
      const res = await (mod as unknown as Record<string, (r: NextRequest, p: unknown) => Promise<Response>>)[method](req, params())
      assert.equal(res.status, 401, `${method} ${path}`)
      assert.equal((await json(res)).error?.code, 'SIGNATURE_INVALID')
    }
    assert.equal(h.store.calls, 0)
  })

  test('wrong secret / tampered body → 401, no store access', async () => {
    const bad = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', secret: 'wrong-secret' }), params())
    assert.equal(bad.status, 401)
    const tampered = signedRequest({ method: 'POST', path: ARTICLES, body: draftBody, actor: ACTORS.contributor })
    const forged = new NextRequest(tampered.url, { method: 'POST', headers: tampered.headers, body: JSON.stringify({ ...draftBody, title: 'forged' }) })
    const res = await articles.POST(forged, params())
    assert.equal(res.status, 401)
    assert.equal(h.store.calls, 0)
  })

  test('expired timestamp → 401 TIMESTAMP_EXPIRED, no store access', async () => {
    const res = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', timestamp: Math.floor(Date.now() / 1000) - 600 }), params())
    assert.equal(res.status, 401)
    assert.equal((await json(res)).error?.code, 'TIMESTAMP_EXPIRED')
    assert.equal(h.store.calls, 0)
  })

  test('nonce replay → 401 NONCE_REPLAY', async () => {
    const nonce = 'abcdefabcdefabcdefabcdefabcdef01'
    const first = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', nonce }), params())
    assert.equal(first.status, 200)
    const again = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', nonce }), params())
    assert.equal(again.status, 401)
    assert.equal((await json(again)).error?.code, 'NONCE_REPLAY')
  })

  test('missing idempotency key on POST → 401 SIGNATURE_INVALID', async () => {
    const res = await articles.POST(signedRequest({ method: 'POST', path: ARTICLES, body: draftBody, idempotencyKey: null }), params())
    assert.equal(res.status, 401)
  })
})

describe('kill switches and configuration', () => {
  test('API disabled → 503 API_DISABLED on every signed endpoint', async () => {
    process.env.NEWSROOM_API_ENABLED = 'false'
    const res = await me.GET(signedRequest({ path: '/api/newsroom/v1/me' }), params())
    assert.equal(res.status, 503)
    assert.equal((await json(res)).error?.code, 'API_DISABLED')
    const hb = await json(await health.GET())
    assert.equal(hb.data.enabled, false)
    assert.equal(h.store.calls, 0)
  })

  test('missing secret → 503 API_NOT_CONFIGURED', async () => {
    delete process.env.NEWSROOM_SIGNING_SECRET
    const res = await me.GET(signedRequest({ path: '/api/newsroom/v1/me' }), params())
    assert.equal(res.status, 503)
    assert.equal((await json(res)).error?.code, 'API_NOT_CONFIGURED')
  })

  test('writes disabled → 503 WRITES_DISABLED for writes, reads still work, denial audited', async () => {
    process.env.NEWSROOM_WRITES_ENABLED = 'false'
    const w = await create()
    assert.equal(w.status, 503)
    assert.equal((await json(w)).error?.code, 'WRITES_DISABLED')
    assert.equal(h.store.articles.size, 0)
    const r = await categories.GET(signedRequest({ path: '/api/newsroom/v1/categories', actor: ACTORS.viewer }), params())
    assert.equal(r.status, 200)
    assert.equal(h.store.audit.at(-1)?.result, 'denied')
    assert.equal(h.store.audit.at(-1)?.errorCode, 'WRITES_DISABLED')
  })
})

describe('actors and roles', () => {
  test('unknown actor and inactive grant → 403 ACTOR_UNKNOWN', async () => {
    for (const actor of [ACTORS.unknown, ACTORS.inactive]) {
      const res = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', actor }), params())
      assert.equal(res.status, 403, actor)
      assert.equal((await json(res)).error?.code, 'ACTOR_UNKNOWN')
    }
  })

  test('/me reports role; owner bootstrap id is publisher', async () => {
    const v = await json(await me.GET(signedRequest({ path: '/api/newsroom/v1/me', actor: ACTORS.viewer }), params()))
    assert.deepEqual(v.data, { actor: ACTORS.viewer, role: 'viewer', publication: 'camer360' })
    const o = await json(await me.GET(signedRequest({ path: '/api/newsroom/v1/me', actor: ACTORS.owner }), params()))
    assert.equal(o.data.role, 'publisher')
  })

  test('viewer cannot create; denial is audited', async () => {
    const res = await create(ACTORS.viewer)
    assert.equal(res.status, 403)
    assert.equal((await json(res)).error?.code, 'FORBIDDEN')
    const row = h.store.audit.at(-1)!
    assert.equal(row.result, 'denied')
    assert.equal(row.operation, 'create_draft')
    assert.equal(row.actor, ACTORS.viewer)
  })

  test('contributor cannot publish (403); publisher can', async () => {
    const created = await json(await create())
    const id = String(created.data.id)
    const path = `${ARTICLES}/${id}/publish`
    const denied = await publish.POST(signedRequest({ method: 'POST', path, body: { expectedVersion: created.data.version }, actor: ACTORS.contributor }), params({ id }))
    assert.equal(denied.status, 403)
    const ok = await publish.POST(signedRequest({ method: 'POST', path, body: { expectedVersion: created.data.version }, actor: ACTORS.publisher }), params({ id }))
    assert.equal(ok.status, 200)
    const b = await json(ok)
    assert.equal(b.data.status, 'published')
    assert.match(b.data.url, /^https:\/\/www\.camer360\.test\/celebrities\/salatiel-live-in-douala$/)
    assert.equal(h.revalidated.length, 1, 'publish revalidates caches')
  })

  test('system:scheduler may only run the scheduler', async () => {
    const res = await me.GET(signedRequest({ path: '/api/newsroom/v1/me', actor: ACTORS.scheduler }), params())
    assert.equal(res.status, 403)
    const run = await scheduler.POST(signedRequest({ method: 'POST', path: '/api/newsroom/v1/scheduler/run', body: {}, actor: ACTORS.scheduler }), params())
    assert.equal(run.status, 200)
    const viaContributor = await scheduler.POST(signedRequest({ method: 'POST', path: '/api/newsroom/v1/scheduler/run', body: {}, actor: ACTORS.contributor }), params())
    assert.equal(viaContributor.status, 403)
  })
})

describe('create, read, idempotency, audit', () => {
  test('POST creates a draft (201) and audits field names only', async () => {
    const res = await create(ACTORS.contributor, { ...draftBody, status: 'published' })
    assert.equal(res.status, 201)
    const b = await json(res)
    assert.equal(b.ok, true)
    assert.equal(b.data.status, 'draft')
    assert.equal(res.headers.get('x-newsroom-request-id'), b.requestId)
    const row = h.store.audit.at(-1)!
    assert.equal(row.result, 'ok')
    assert.equal(row.articleId, b.data.id)
    assert.ok(row.changedFields?.includes('title'))
    assert.ok(!JSON.stringify(row).includes('Concert'), 'article body never audited')
  })

  test('idempotent replay returns the stored response without a second insert', async () => {
    const key = 'tm:op:replay-test'
    const first = await create(ACTORS.contributor, draftBody, key)
    assert.equal(first.status, 201)
    const second = await create(ACTORS.contributor, draftBody, key)
    assert.equal(second.status, 200)
    assert.equal(second.headers.get('x-newsroom-idempotent-replay'), 'true')
    assert.equal((await json(second)).data.id, (await json(first)).data.id)
    assert.equal(h.store.articles.size, 1)
  })

  test('same key, different request → 409 IDEMPOTENCY_MISMATCH', async () => {
    const key = 'tm:op:mismatch-test'
    await create(ACTORS.contributor, draftBody, key)
    const res = await create(ACTORS.contributor, { ...draftBody, title: 'Something else' }, key)
    assert.equal(res.status, 409)
    assert.equal((await json(res)).error?.code, 'IDEMPOTENCY_MISMATCH')
    assert.equal(h.store.articles.size, 1)
  })

  test('failed write releases the key so a corrected retry is not a mismatch', async () => {
    const key = 'tm:op:retry-test'
    const bad = await create(ACTORS.contributor, { ...draftBody, categoryId: 4242 }, key)
    assert.equal(bad.status, 422)
    assert.equal(h.store.audit.at(-1)?.result, 'error')
    assert.equal(h.store.audit.at(-1)?.errorCode, 'VALIDATION')
    const again = await create(ACTORS.contributor, { ...draftBody, categoryId: 4242 }, key)
    assert.equal(again.status, 422)
  })

  test('GET list with a signed query string; GET by id; 404', async () => {
    await create()
    const list = await articles.GET(signedRequest({ path: `${ARTICLES}?status=draft&limit=5`, actor: ACTORS.viewer }), params())
    assert.equal(list.status, 200)
    const items = (await json(list)).data
    assert.equal(items.length, 1)
    const id = String(items[0].id)
    const one = await article.GET(signedRequest({ path: `${ARTICLES}/${id}`, actor: ACTORS.viewer }), params({ id }))
    assert.equal((await json(one)).data.body, '<p>Concert</p>')
    const missing = await article.GET(signedRequest({ path: `${ARTICLES}/999999`, actor: ACTORS.viewer }), params({ id: '999999' }))
    assert.equal(missing.status, 404)
    const authorsRes = await json(await authors.GET(signedRequest({ path: '/api/newsroom/v1/authors', actor: ACTORS.viewer }), params()))
    assert.deepEqual(authorsRes.data, [{ id: 1, slug: 'desk', name: 'Camer360 Desk' }])
  })

  test('PATCH unknown field → 422 via route; invalid JSON → 400', async () => {
    const created = (await json(await create())).data
    const id = String(created.id)
    const res = await article.PATCH(signedRequest({ method: 'PATCH', path: `${ARTICLES}/${id}`, body: { expectedVersion: created.version, status: 'published' }, actor: ACTORS.editor }), params({ id }))
    assert.equal(res.status, 422)
    assert.equal((await json(res)).error?.fields?.status, 'not patchable')
    const bad = await article.PATCH(signedRequest({ method: 'PATCH', path: `${ARTICLES}/${id}`, rawBody: '{not json', actor: ACTORS.editor }), params({ id }))
    assert.equal(bad.status, 400)
  })

  test('schedule via route is audited, then the scheduler publishes it when due', async () => {
    const created = (await json(await create())).data
    const id = String(created.id)
    const at = new Date(Date.now() + 120_000).toISOString()
    const s = await schedule.POST(signedRequest({ method: 'POST', path: `${ARTICLES}/${id}/schedule`, body: { expectedVersion: created.version, scheduledAt: at }, actor: ACTORS.publisher }), params({ id }))
    assert.equal(s.status, 200)
    assert.equal(h.store.audit.at(-1)?.operation, 'schedule')
    setNewsroomDeps({ store: h.store, revalidate: (t) => { h.revalidated.push(t) }, now: () => new Date(Date.now() + 600_000) })
    // The signature window is checked against the injected clock, so sign with it too.
    const run = await scheduler.POST(signedRequest({ method: 'POST', path: '/api/newsroom/v1/scheduler/run', body: {}, actor: ACTORS.scheduler, timestamp: Math.floor((Date.now() + 600_000) / 1000) }), params())
    assert.equal(run.status, 200)
    const b = await json(run)
    assert.equal(b.data.count, 1)
    assert.equal(h.store.articles.get(created.id)!.status, 'published')
    assert.equal(h.store.articles.get(created.id)!.publishedAt!.toISOString(), new Date(Math.floor(Date.parse(at) / 1000) * 1000).toISOString())
  })
})

describe('cron backstop', () => {
  const cronReq = (auth?: string) => new NextRequest(new URL('/api/newsroom/v1/cron/publish-scheduled', 'https://www.camer360.test'),
    { headers: auth ? { authorization: auth } : {} })

  test('CRON_SECRET unset → 503; wrong bearer → 401; right bearer → 200', async () => {
    assert.equal((await cron.GET(cronReq('Bearer anything'))).status, 503)
    process.env.CRON_SECRET = 'cron-test-secret-0123456789'
    assert.equal((await cron.GET(cronReq())).status, 401)
    assert.equal((await cron.GET(cronReq('Bearer wrong'))).status, 401)
    assert.equal(h.store.calls, 0)
    const ok = await cron.GET(cronReq('Bearer cron-test-secret-0123456789'))
    assert.equal(ok.status, 200)
    assert.equal((await json(ok)).data.count, 0)
  })
})

describe('newsroom never triggers social posting', () => {
  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p, out)
      else if (/\.ts$/.test(name)) out.push(p)
    }
    return out
  }
  test('no social/IndexNow/Facebook code paths in lib/newsroom or app/api/newsroom', () => {
    const files = [...walk(join(process.cwd(), 'lib', 'newsroom')), ...walk(join(process.cwd(), 'app', 'api', 'newsroom'))]
    assert.ok(files.length > 10)
    const offenders = files.filter(f => {
      const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      return /postArticleToSocial|socialQueue|social_queue|indexnow|graph\.facebook|server\/lib\/social/i.test(src)
    })
    assert.deepEqual(offenders, [])
  })

  test('signature header name constants match the contract', () => {
    assert.equal(HEADERS.signature, 'x-newsroom-signature')
    assert.equal(HEADERS.idempotencyKey, 'x-newsroom-idempotency-key')
  })
})
