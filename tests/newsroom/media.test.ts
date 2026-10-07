import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { ACTORS, installHarness, json, makeStore, mockMedia, OWNER_ID, params, signedRequest } from './helpers'
import { createDraft, publishArticle, type ServiceDeps } from '@/lib/newsroom/articles'
import { uploadDirect, presignUpload, confirmUpload, MAX_DIRECT_BYTES } from '@/lib/newsroom/media'
import { resolveActor } from '@/lib/newsroom/permissions'
import { NewsroomError } from '@/lib/newsroom/http'
import type { MemoryStore } from '@/lib/newsroom/store-memory'
import * as mediaRoute from '@/app/api/newsroom/v1/media/route'

const T0 = new Date('2026-10-07T10:00:00.000Z')
const deps = (store: MemoryStore, now = T0): ServiceDeps => ({ store, now, siteUrl: 'https://www.camer360.test' })
const actor = (store: MemoryStore, id: string) => resolveActor(`telegram:${id}`, store, new Set([OWNER_ID]))
const img = (n = 100) => Buffer.concat([Buffer.from('IMG!'), Buffer.alloc(n)]) // the mock processor's "image"
const b64 = (b: Buffer) => b.toString('base64')

async function rejectsCode(p: Promise<unknown>, code: string, msg?: string) {
  await assert.rejects(p, (e: unknown) => e instanceof NewsroomError && e.code === code, msg)
}

function setup() {
  const store = makeStore()
  const uploads = new Map<string, { body: Buffer; contentType: string }>()
  return { store, uploads, rt: mockMedia(uploads) }
}

describe('POST /media limits and types', () => {
  test('rejects > 4 MB decoded, disallowed types, bad base64', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const big = Buffer.alloc(MAX_DIRECT_BYTES + 1)
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'a.jpg', contentType: 'image/jpeg', dataBase64: b64(big) }), 'VALIDATION', 'too big')
    for (const contentType of ['image/svg+xml', 'text/html', 'application/x-msdownload', '']) {
      await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'a', contentType, dataBase64: b64(img()) }), 'VALIDATION', contentType)
    }
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'a.jpg', contentType: 'image/jpeg', dataBase64: '***' }), 'VALIDATION')
    await rejectsCode(uploadDirect(deps(store), rt, c, { contentType: 'image/jpeg', dataBase64: b64(img()) }), 'VALIDATION')
    assert.equal(uploads.size, 0)
    assert.equal(store.media.length, 0)
  })

  test('exactly 4 MB is accepted', async () => {
    const { store, rt } = setup()
    const r = await uploadDirect(deps(store), rt, await actor(store, '222'),
      { filename: 'doc.pdf', contentType: 'application/pdf', dataBase64: b64(Buffer.alloc(MAX_DIRECT_BYTES)) })
    assert.equal(r.data.sizeBytes, MAX_DIRECT_BYTES)
  })

  test('images are converted to WebP under newsroom/<uuid>.webp and recorded in media', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const { article } = await createDraft(deps(store), c, { title: 'Pic story', body: '<p>x</p>', categoryId: 9 })
    const r = await uploadDirect(deps(store), rt, c, { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: article.id, alt: 'Stage' })
    assert.equal(r.data.contentType, 'image/webp')
    assert.match(r.data.url, /^https:\/\/cdn\.camer360\.test\/newsroom\/[0-9a-f-]{36}\.webp$/)
    assert.equal(r.data.width, 800)
    const key = [...uploads.keys()][0]
    assert.equal(uploads.get(key)!.contentType, 'image/webp')
    assert.deepEqual(store.media[0], { id: 1, r2Key: key, cdnUrl: r.data.url, mimeType: 'image/webp', width: 800, height: 600, sizeBytes: r.data.sizeBytes, alt: 'Stage', articleId: article.id })
    assert.equal(r.data.article?.featuredImage, null, 'inline media does not change the article')
  })

  test('non-images are stored raw; unreadable image → 422', async () => {
    const { store, rt } = setup()
    const c = await actor(store, '222')
    const pdf = await uploadDirect(deps(store), rt, c, { filename: 'doc.pdf', contentType: 'application/pdf', dataBase64: b64(Buffer.from('%PDF-1.4 test')) })
    assert.match(pdf.data.url, /\/newsroom\/[0-9a-f-]{36}\.pdf$/)
    assert.equal(pdf.data.contentType, 'application/pdf')
    assert.equal(pdf.data.width, null)
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'x.png', contentType: 'image/png', dataBase64: b64(Buffer.from('not an image')) }), 'VALIDATION')
  })

  test('role=featured sets featured_image/image_alt, version-checked', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const { article } = await createDraft(deps(store), c, { title: 'Feat', body: '<p>x</p>', categoryId: 9 })
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: article.id, role: 'featured' }), 'VALIDATION', 'expectedVersion required')
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: article.id, role: 'featured', expectedVersion: 'stale' }), 'VERSION_CONFLICT')
    await rejectsCode(uploadDirect(deps(store), rt, c, { filename: 'd.pdf', contentType: 'application/pdf', dataBase64: b64(img()), articleId: article.id, role: 'featured', expectedVersion: article.version }), 'VALIDATION', 'featured must be an image')
    assert.equal(uploads.size, 0, 'nothing uploaded before the checks pass')

    const r = await uploadDirect(deps(store, new Date(T0.getTime() + 1000)), rt, c, {
      filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: article.id,
      role: 'featured', alt: 'Hero', expectedVersion: article.version,
    })
    assert.equal(r.data.article?.featuredImage, r.data.url)
    assert.equal(r.data.article?.imageAlt, 'Hero')
    assert.notEqual(r.data.article?.version, article.version)
    assert.ok(r.changedFields.includes('featuredImage'))
  })

  test('media permissions: contributor own draft only; editor any', async () => {
    const { store, rt } = setup()
    const own = await createDraft(deps(store), await actor(store, '222'), { title: 'Mine', body: '<p>x</p>', categoryId: 9 })
    const other = await actor(store, '223')
    await rejectsCode(uploadDirect(deps(store), rt, other, { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: own.article.id }), 'FORBIDDEN')
    const pub = await publishArticle(deps(store), await actor(store, '444'), own.article.id, { expectedVersion: own.article.version })
    await rejectsCode(uploadDirect(deps(store), rt, await actor(store, '222'), { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: pub.article.id }), 'FORBIDDEN', 'own but published')
    const ok = await uploadDirect(deps(store), rt, await actor(store, '333'), { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: own.article.id })
    assert.equal(ok.articleId, own.article.id)
    await rejectsCode(uploadDirect(deps(store), rt, await actor(store, '223'), { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()), articleId: 424242 }), 'NOT_FOUND')
  })

  test('viewer is rejected at the route (403) and the denial is audited', async () => {
    const h = installHarness()
    const res = await mediaRoute.POST(signedRequest({ method: 'POST', path: '/api/newsroom/v1/media', actor: ACTORS.viewer,
      body: { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()) } }), params())
    assert.equal(res.status, 403)
    assert.equal(h.store.audit.at(-1)?.result, 'denied')
    const ok = await mediaRoute.POST(signedRequest({ method: 'POST', path: '/api/newsroom/v1/media', actor: ACTORS.contributor,
      body: { filename: 'p.jpg', contentType: 'image/jpeg', dataBase64: b64(img()) } }), params())
    assert.equal(ok.status, 201)
    assert.equal((await json(ok)).data.contentType, 'image/webp')
  })
})

describe('presign + confirm', () => {
  test('presign validates type/size and returns a PUT URL', async () => {
    const { store, rt } = setup()
    const c = await actor(store, '222')
    await rejectsCode(presignUpload(deps(store), rt, c, { filename: 'v.exe', contentType: 'application/octet-stream', sizeBytes: 10 }), 'VALIDATION')
    await rejectsCode(presignUpload(deps(store), rt, c, { filename: 'v.mp4', contentType: 'video/mp4', sizeBytes: 500 * 1024 * 1024 }), 'VALIDATION')
    await rejectsCode(presignUpload(deps(store), rt, await actor(store, '111'), { filename: 'v.mp4', contentType: 'video/mp4', sizeBytes: 1000 }), 'FORBIDDEN')
    const p = await presignUpload(deps(store), rt, c, { filename: 'v.mp4', contentType: 'video/mp4', sizeBytes: 1000 })
    assert.match(p.key, /^newsroom\/[0-9a-f-]{36}\.mp4$/)
    assert.equal(p.method, 'PUT')
    assert.deepEqual(p.headers, { 'content-type': 'video/mp4' })
    assert.equal(p.expiresAt, new Date(T0.getTime() + 15 * 60_000).toISOString())
  })

  test('confirm checks the object exists (HeadObject) and records it', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const p = await presignUpload(deps(store), rt, c, { filename: 'v.mp4', contentType: 'video/mp4', sizeBytes: 1000 })
    await rejectsCode(confirmUpload(deps(store), rt, c, { key: p.key }), 'NOT_FOUND')
    await rejectsCode(confirmUpload(deps(store), rt, c, { key: '../etc/passwd' }), 'VALIDATION')
    uploads.set(p.key, { body: Buffer.alloc(1000), contentType: 'video/mp4' })
    const r = await confirmUpload(deps(store), rt, c, { key: p.key })
    assert.equal(r.data.url, `https://cdn.camer360.test/${p.key}`)
    assert.equal(store.media.length, 1)
  })

  test('confirmed images are re-encoded to WebP and the raw upload removed', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const p = await presignUpload(deps(store), rt, c, { filename: 'big.jpg', contentType: 'image/jpeg', sizeBytes: 8_000_000 })
    uploads.set(p.key, { body: img(5000), contentType: 'image/jpeg' })
    const r = await confirmUpload(deps(store), rt, c, { key: p.key })
    assert.equal(r.data.contentType, 'image/webp')
    assert.ok(!uploads.has(p.key))
    assert.equal(uploads.size, 1)
  })

  test('content-type mismatch on confirm → 422 and the object is removed', async () => {
    const { store, uploads, rt } = setup()
    const c = await actor(store, '222')
    const p = await presignUpload(deps(store), rt, c, { filename: 'a.pdf', contentType: 'application/pdf', sizeBytes: 100 })
    uploads.set(p.key, { body: Buffer.alloc(100), contentType: 'text/html' })
    await rejectsCode(confirmUpload(deps(store), rt, c, { key: p.key }), 'VALIDATION')
    assert.ok(!uploads.has(p.key))
  })
})

describe('production image pipeline (sharp, no R2 call)', () => {
  test('re-encodes to WebP and caps width at 1200 px like the CMS upload', async () => {
    const sharp = (await import('sharp')).default
    const png = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#c00' } }).png().toBuffer()
    const { createMediaRuntime } = await import('@/lib/newsroom/media-runtime')
    const out = await createMediaRuntime().processImage(png)
    assert.equal(out.width, 1200)
    assert.equal(out.height, 600)
    assert.equal(out.data.subarray(8, 12).toString('latin1'), 'WEBP')
  })
})
