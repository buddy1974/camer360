import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { makeStore, OWNER_ID } from './helpers'
import {
  createDraft, updateArticle, publishArticle, unpublishArticle, scheduleArticle, unscheduleArticle,
  publishDue, listArticles, loadArticle, computeVersion, type ServiceDeps,
} from '@/lib/newsroom/articles'
import { resolveActor, type Actor } from '@/lib/newsroom/permissions'
import { NewsroomError } from '@/lib/newsroom/http'
import type { MemoryStore } from '@/lib/newsroom/store-memory'

const T0 = new Date('2026-10-07T10:00:00.000Z')
const SITE = 'https://www.camer360.test'

async function actor(store: MemoryStore, id: string): Promise<Actor> {
  return resolveActor(`telegram:${id}`, store, new Set([OWNER_ID]))
}

function deps(store: MemoryStore, now = T0): ServiceDeps {
  return { store, now, siteUrl: SITE }
}

async function rejectsCode(p: Promise<unknown>, code: string, msg?: string) {
  await assert.rejects(p, (e: unknown) => e instanceof NewsroomError && e.code === code, msg)
}

const draftInput = (extra: Record<string, unknown> = {}) => ({
  title: 'Locko drops a new single', body: '<p>Hello <strong>world</strong></p>', categoryId: 9, ...extra,
})

describe('createDraft', () => {
  test('always creates a draft, whatever the input', async () => {
    const store = makeStore()
    const r = await createDraft(deps(store), await actor(store, '222'),
      draftInput({ status: 'published', publishedAt: '2020-01-01T00:00:00Z', slug: 'hijack', isFeatured: true }))
    assert.equal(r.article.status, 'draft')
    assert.equal(r.article.publishedAt, null)
    assert.equal(r.article.slug, 'locko-drops-a-new-single')
    assert.equal(r.article.isFeatured, false)
    assert.equal(r.article.url, null)
    assert.equal(r.article.createdViaNewsroom, true)
    assert.equal(store.origins.get(r.article.id), '222')
    assert.match(r.article.version, /^[0-9a-f]{16}$/)
  })

  test('body is sanitised', async () => {
    const store = makeStore()
    const r = await createDraft(deps(store), await actor(store, '222'),
      draftInput({ body: '<p onclick="x()">Hi</p><img src="https://x.test/a.jpg" onerror="steal()"><script>alert(1)</script>' }))
    assert.ok(!/onclick|onerror|alert\(1\)/.test(r.article.body), r.article.body)
    assert.match(r.article.body, /<p>Hi<\/p>/)
  })

  test('category is required and must exist — no fallback', async () => {
    const store = makeStore()
    const a = await actor(store, '222')
    await rejectsCode(createDraft(deps(store), a, { title: 't', body: '<p>b</p>' }), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, draftInput({ categoryId: 4242 })), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, { title: 't', body: '<p>b</p>', categorySlug: 'politics' }), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, draftInput({ categoryId: 9, categorySlug: 'music' })), 'VALIDATION')
    assert.equal(store.articles.size, 0)
    const bySlug = await createDraft(deps(store), a, { title: 't', body: '<p>b</p>', categorySlug: 'music' })
    assert.equal(bySlug.article.categoryId, 10)
    assert.equal(bySlug.article.categorySlug, 'music')
  })

  test('title/body required; author must exist', async () => {
    const store = makeStore()
    const a = await actor(store, '222')
    await rejectsCode(createDraft(deps(store), a, { body: '<p>b</p>', categoryId: 9 }), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, { title: 'x', categoryId: 9 }), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, draftInput({ authorId: 99 })), 'VALIDATION')
    await rejectsCode(createDraft(deps(store), a, draftInput({ title: 'x'.repeat(321) })), 'VALIDATION')
  })

  test('slug collisions get -2, -3', async () => {
    const store = makeStore()
    const a = await actor(store, '222')
    store.seedArticle({ slug: 'same-title', title: 'Same title', categoryId: 9 })
    const r2 = await createDraft(deps(store), a, draftInput({ title: 'Same Title' }))
    const r3 = await createDraft(deps(store), a, draftInput({ title: 'Same  title!' }))
    assert.equal(r2.article.slug, 'same-title-2')
    assert.equal(r3.article.slug, 'same-title-3')
  })

  test('aiAssisted → ai_generated=1, ai_reviewed=0', async () => {
    const store = makeStore()
    const r = await createDraft(deps(store), await actor(store, '222'), draftInput({ aiAssisted: true }))
    const row = store.articles.get(r.article.id)!
    assert.equal(row.aiGenerated, true)
    assert.equal(row.aiReviewed, false)
    assert.equal(r.article.aiGenerated, true)
  })
})

describe('updateArticle', () => {
  test('PATCH allowlist rejects unknown and system fields with 422', async () => {
    const store = makeStore()
    const a = await actor(store, '333')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    for (const field of ['foo', 'slug', 'status', 'publishedAt', 'id', 'aiGenerated', 'isFeatured', 'createdAt', 'country']) {
      await rejectsCode(updateArticle(deps(store), a, article.id, { expectedVersion: article.version, title: 'ok', [field]: 'x' }), 'VALIDATION', field)
    }
    assert.equal(store.articles.get(article.id)!.title, 'Locko drops a new single')
  })

  test('expectedVersion required; mismatch → 409 VERSION_CONFLICT', async () => {
    const store = makeStore()
    const a = await actor(store, '333')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    await rejectsCode(updateArticle(deps(store), a, article.id, { title: 'x' }), 'VALIDATION')
    await rejectsCode(updateArticle(deps(store), a, article.id, { expectedVersion: '0000000000000000', title: 'x' }), 'VERSION_CONFLICT')
    const ok = await updateArticle(deps(store, new Date(T0.getTime() + 5000)), a, article.id, { expectedVersion: article.version, title: 'New title' })
    assert.equal(ok.article.title, 'New title')
    assert.notEqual(ok.article.version, article.version)
    assert.equal(ok.article.slug, article.slug, 'slug never changes')
    // the old version is now stale
    await rejectsCode(updateArticle(deps(store), a, article.id, { expectedVersion: article.version, title: 'again' }), 'VERSION_CONFLICT')
  })

  test('a CMS edit in between invalidates the version', async () => {
    const store = makeStore()
    const a = await actor(store, '333')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const row = store.articles.get(article.id)!
    store.articles.set(article.id, { ...row, body: '<p>edited in CMS</p>', updatedAt: new Date(T0.getTime() + 1000) })
    await rejectsCode(updateArticle(deps(store), a, article.id, { expectedVersion: article.version, title: 'x' }), 'VERSION_CONFLICT')
  })

  test('role matrix: contributor own draft vs other draft, published, viewer', async () => {
    const store = makeStore()
    const own = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const cms = store.seedArticle({ slug: 'cms-draft', title: 'CMS draft', categoryId: 9 })
    const pub = await createDraft(deps(store), await actor(store, '222'), draftInput({ title: 'Will be published' }))
    const published = await publishArticle(deps(store), await actor(store, '444'), pub.article.id, { expectedVersion: pub.article.version })

    const contributor = await actor(store, '222')
    const otherContributor = await actor(store, '223')
    const editor = await actor(store, '333')
    const viewer = await actor(store, '111')

    const r = await updateArticle(deps(store), contributor, own.article.id, { expectedVersion: own.article.version, excerpt: 'mine' })
    assert.equal(r.article.excerpt, 'mine')
    await rejectsCode(updateArticle(deps(store), otherContributor, own.article.id, { expectedVersion: r.article.version, excerpt: 'x' }), 'FORBIDDEN')
    await rejectsCode(updateArticle(deps(store), contributor, cms.id, { expectedVersion: computeVersion(cms), excerpt: 'x' }), 'FORBIDDEN')
    await rejectsCode(updateArticle(deps(store), contributor, published.article.id, { expectedVersion: published.article.version, excerpt: 'x' }), 'FORBIDDEN')
    await rejectsCode(updateArticle(deps(store), viewer, own.article.id, { expectedVersion: r.article.version, excerpt: 'x' }), 'FORBIDDEN')

    const e1 = await updateArticle(deps(store), editor, cms.id, { expectedVersion: computeVersion(cms), excerpt: 'by editor' })
    assert.equal(e1.article.excerpt, 'by editor')
    const e2 = await updateArticle(deps(store), editor, published.article.id, { expectedVersion: published.article.version, excerpt: 'live fix' })
    assert.equal(e2.article.excerpt, 'live fix')
    assert.equal(e2.revalidate.length, 1, 'editing a published article revalidates')
  })

  test('contributors and editors cannot publish', async () => {
    const store = makeStore()
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    for (const id of ['222', '333', '111']) {
      await rejectsCode(publishArticle(deps(store), await actor(store, id), article.id, { expectedVersion: article.version }), 'FORBIDDEN', id)
    }
  })
})

describe('state transitions', () => {
  test('publish sets published_at once; later PATCH preserves it', async () => {
    const store = makeStore()
    const publisher = await actor(store, '444')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const t1 = new Date(T0.getTime() + 60_000)
    const p = await publishArticle(deps(store, t1), publisher, article.id, { expectedVersion: article.version })
    assert.equal(p.article.status, 'published')
    assert.equal(p.article.publishedAt, '2026-10-07T10:01:00.000Z')
    assert.equal(p.article.url, `${SITE}/celebrities/${article.slug}`)
    assert.equal(p.revalidate.length, 1)

    const t2 = new Date(T0.getTime() + 3_600_000)
    const e = await updateArticle(deps(store, t2), await actor(store, '333'), article.id, { expectedVersion: p.article.version, title: 'Edited later' })
    assert.equal(e.article.publishedAt, '2026-10-07T10:01:00.000Z')
    assert.equal(e.article.status, 'published')

    await rejectsCode(publishArticle(deps(store, t2), publisher, article.id, { expectedVersion: e.article.version }), 'INVALID_STATE')
  })

  test('unpublish → unpublished (published_at kept); republish restamps', async () => {
    const store = makeStore()
    const publisher = await actor(store, '444')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const p = await publishArticle(deps(store, new Date(T0.getTime() + 1000)), publisher, article.id, { expectedVersion: article.version })
    const u = await unpublishArticle(deps(store, new Date(T0.getTime() + 2000)), publisher, article.id, { expectedVersion: p.article.version })
    assert.equal(u.article.status, 'unpublished')
    assert.equal(u.article.publishedAt, p.article.publishedAt)
    assert.equal(u.article.url, null)
    assert.equal(u.revalidate.length, 1, 'unpublish revalidates the public page')
    await rejectsCode(unpublishArticle(deps(store), publisher, article.id, { expectedVersion: u.article.version }), 'INVALID_STATE')

    const r = await publishArticle(deps(store, new Date(T0.getTime() + 9000)), publisher, article.id, { expectedVersion: u.article.version })
    assert.equal(r.article.status, 'published')
    assert.equal(r.article.publishedAt, '2026-10-07T10:00:09.000Z')
  })

  test('schedule requires ≥ now + 60 s and a draft/unpublished article; unschedule → draft', async () => {
    const store = makeStore()
    const publisher = await actor(store, '444')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    await rejectsCode(scheduleArticle(deps(store), publisher, article.id, { expectedVersion: article.version, scheduledAt: new Date(T0.getTime() + 30_000).toISOString() }), 'VALIDATION')
    await rejectsCode(scheduleArticle(deps(store), publisher, article.id, { expectedVersion: article.version, scheduledAt: 'tomorrow' }), 'VALIDATION')
    await rejectsCode(scheduleArticle(deps(store), publisher, article.id, { expectedVersion: article.version }), 'VALIDATION')

    const at = new Date(T0.getTime() + 3_600_000).toISOString()
    const s = await scheduleArticle(deps(store), publisher, article.id, { expectedVersion: article.version, scheduledAt: at })
    assert.equal(s.article.status, 'scheduled')
    assert.equal(s.article.scheduledAt, at)
    assert.equal(s.article.publishedAt, null)
    await rejectsCode(scheduleArticle(deps(store), publisher, article.id, { expectedVersion: s.article.version, scheduledAt: at }), 'INVALID_STATE')

    const un = await unscheduleArticle(deps(store), publisher, article.id, { expectedVersion: s.article.version })
    assert.equal(un.article.status, 'draft')
    assert.equal(un.article.scheduledAt, null)
    await rejectsCode(unscheduleArticle(deps(store), publisher, article.id, { expectedVersion: un.article.version }), 'INVALID_STATE')
  })

  test('cannot schedule a published article', async () => {
    const store = makeStore()
    const publisher = await actor(store, '444')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const p = await publishArticle(deps(store), publisher, article.id, { expectedVersion: article.version })
    await rejectsCode(scheduleArticle(deps(store), publisher, article.id, { expectedVersion: p.article.version, scheduledAt: new Date(T0.getTime() + 3_600_000).toISOString() }), 'INVALID_STATE')
  })

  test('publishDue publishes due newsroom-scheduled articles at their scheduled time only', async () => {
    const store = makeStore()
    const publisher = await actor(store, '444')
    const a = await createDraft(deps(store), await actor(store, '222'), draftInput({ title: 'Due soon' }))
    const b = await createDraft(deps(store), await actor(store, '222'), draftInput({ title: 'Due later' }))
    const at1 = new Date(T0.getTime() + 120_000)
    const at2 = new Date(T0.getTime() + 7_200_000)
    await scheduleArticle(deps(store), publisher, a.article.id, { expectedVersion: a.article.version, scheduledAt: at1.toISOString() })
    await scheduleArticle(deps(store), publisher, b.article.id, { expectedVersion: b.article.version, scheduledAt: at2.toISOString() })
    for (const id of [a.article.id, b.article.id]) {
      await store.appendAudit({ requestId: 'r', actor: 'telegram:444', operation: 'schedule', articleId: id, changedFields: null, idempotencyKey: null, result: 'ok', errorCode: null })
    }
    // A CMS-only 'scheduled' row (never scheduled via the newsroom) is left alone.
    const cms = store.seedArticle({ slug: 'cms-sched', title: 'CMS scheduled', categoryId: 9, status: 'scheduled', scheduledAt: new Date(T0.getTime() - 86_400_000) })

    const run1 = await publishDue(deps(store, new Date(T0.getTime() + 600_000)))
    assert.deepEqual(run1.published.map(p => p.id), [a.article.id])
    assert.equal(run1.published[0].publishedAt, at1.toISOString())
    const rowA = store.articles.get(a.article.id)!
    assert.equal(rowA.status, 'published')
    assert.equal(rowA.publishedAt!.toISOString(), at1.toISOString())
    assert.equal(store.articles.get(b.article.id)!.status, 'scheduled')
    assert.equal(store.articles.get(cms.id)!.status, 'scheduled')

    const run2 = await publishDue(deps(store, new Date(T0.getTime() + 600_000)))
    assert.equal(run2.published.length, 0, 'idempotent')
  })
})

describe('reads', () => {
  test('list newest first by updatedAt, filters, limit ≤ 50', async () => {
    const store = makeStore()
    const c = await actor(store, '222')
    for (let i = 0; i < 3; i++) await createDraft(deps(store, new Date(T0.getTime() + i * 1000)), c, draftInput({ title: `Item ${i}`, excerpt: i === 1 ? 'Biya speaks' : null }))
    const all = await listArticles(deps(store), {})
    assert.deepEqual(all.map(a => a.title), ['Item 2', 'Item 1', 'Item 0'])
    assert.equal((await listArticles(deps(store), { q: 'biya' }))[0].title, 'Item 1')
    assert.equal((await listArticles(deps(store), { status: 'published,scheduled' })).length, 0)
    assert.equal((await listArticles(deps(store), { status: 'draft', category: 'celebrities', limit: '2' })).length, 2)
    await assert.rejects(listArticles(deps(store), { status: 'live' }))
    await assert.rejects(listArticles(deps(store), { category: 'nope' }))
    await assert.rejects(listArticles(deps(store), { since: 'yesterday' }))
  })

  test('loadArticle → 404 for unknown id; dates are ISO UTC', async () => {
    const store = makeStore()
    await assert.rejects(loadArticle(deps(store), 1), (e: unknown) => e instanceof NewsroomError && e.code === 'NOT_FOUND')
    const { article } = await createDraft(deps(store), await actor(store, '222'), draftInput())
    const got = await loadArticle(deps(store), article.id)
    assert.equal(got.updatedAt, '2026-10-07T10:00:00.000Z')
    assert.equal(got.categoryName, 'Celebrities')
  })
})
