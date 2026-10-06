import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import './env'

describe('article update allowlist', () => {
  test('non-allowlisted / system fields are dropped', async () => {
    const { pickArticleUpdate } = await import('@/lib/articles/update-fields')
    const r = pickArticleUpdate({
      title: 'Corrected headline',
      id: 999, publishedAt: '2001-01-01', createdAt: '2001-01-01', legacyId: 1, legacyUrl: '/x',
      legacyHits: 5, aiGenerated: false, aiReviewed: true, lang: 'fr', scheduledAt: '2030-01-01',
    })
    assert.ok(r.ok)
    if (!r.ok) return
    assert.deepEqual(r.update, { title: 'Corrected headline' })
    for (const k of ['id', 'publishedAt', 'createdAt', 'aiGenerated', 'aiReviewed', 'lang']) {
      assert.ok(r.dropped.includes(k), `${k} should be dropped`)
    }
  })

  test('legitimate editor payload is preserved', async () => {
    const { pickArticleUpdate } = await import('@/lib/articles/update-fields')
    const payload = {
      title: 't', slug: 's', excerpt: 'e', categoryId: 3,
      featuredImage: 'https://media.example/y.webp', status: 'published',
      isBreaking: false, isFeatured: true, metaTitle: 'm', metaDesc: 'd', authorId: 4, country: 'CM',
    }
    const r = pickArticleUpdate(payload)
    assert.ok(r.ok)
    if (r.ok) {
      assert.deepEqual(r.update, payload)
      assert.deepEqual(r.dropped, [])
    }
  })

  test('list-page statuses (published / unpublished / draft) are accepted, junk is rejected', async () => {
    const { pickArticleUpdate } = await import('@/lib/articles/update-fields')
    for (const status of ['published', 'unpublished', 'draft', 'archived']) {
      assert.equal(pickArticleUpdate({ status }).ok, true, status)
    }
    assert.equal(pickArticleUpdate({ status: 'hacked' }).ok, false)
  })

  test('body HTML is sanitised, embeds survive', async () => {
    const { pickArticleUpdate } = await import('@/lib/articles/update-fields')
    const r = pickArticleUpdate({
      body: '<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)>' +
        '<iframe src="https://www.youtube.com/embed/abc"></iframe>',
    })
    assert.ok(r.ok)
    if (r.ok) {
      const html = String(r.update.body)
      assert.doesNotMatch(html, /alert|onerror/i)
      assert.match(html, /<p>ok<\/p>/)
      assert.match(html, /youtube\.com\/embed\/abc/)
    }
  })
})

describe('published_at is not reset by editing a published article', () => {
  test('editing an already-published article keeps its original date', async () => {
    const { publishedAtForTransition } = await import('@/lib/articles/update-fields')
    assert.equal(publishedAtForTransition('published', 'published', new Date()), undefined)
  })
  test('first publication establishes published_at', async () => {
    const { publishedAtForTransition } = await import('@/lib/articles/update-fields')
    const now = new Date('2026-10-06T12:00:00Z')
    assert.equal(publishedAtForTransition('draft', 'published', now), now)
    assert.equal(publishedAtForTransition('unpublished', 'published', now), now)
  })
  test('non-publishing edits never set it', async () => {
    const { publishedAtForTransition } = await import('@/lib/articles/update-fields')
    assert.equal(publishedAtForTransition('published', 'draft', new Date()), undefined)
    assert.equal(publishedAtForTransition('draft', undefined, new Date()), undefined)
  })
  test('PUT route uses the transition rule and drops client-supplied publishedAt', () => {
    const src = readFileSync('app/api/admin/articles/[id]/route.ts', 'utf8')
    assert.match(src, /publishedAtForTransition\(existing\?\.status, body\.status/)
    assert.doesNotMatch(src, /updateData\.publishedAt\s*\|\|/)
  })
  test('bulk publish only stamps rows that are not yet published', () => {
    const src = readFileSync('app/api/admin/articles/route.ts', 'utf8')
    assert.match(src, /ne\(articles\.status, 'published'\)/)
    // status updates go through bulkWhere(); only the bulk DELETE still filters by plain id list
    assert.doesNotMatch(src, /set\(patchSet\([^)]*\)\)\.where\(inArray\(/)
    assert.equal((src.match(/\.where\(bulkWhere\(/g) ?? []).length, 2)
  })
  test('AI Enhance does not change the slug of an existing article', () => {
    const src = readFileSync('components/admin/ArticleEditor/index.tsx', 'utf8')
    assert.match(src, /if \(!isEdit\) setSlug\(slugify\(data\.title\)\)/)
  })
})

describe('machine-created article HTML is sanitised like admin content', () => {
  test('n8n/articles route sanitises the body before insert', () => {
    const src = readFileSync('app/api/n8n/articles/route.ts', 'utf8')
    assert.match(src, /body:\s+sanitizeArticleBody\(articleBody as string\)/)
  })
  test('sanitizer strips script payloads typical of scraped content', async () => {
    const { sanitizeArticleBody } = await import('@/lib/sanitize')
    const out = sanitizeArticleBody('<p>news</p><script>fetch("//evil")</script><a href="javascript:x()">l</a>')
    assert.doesNotMatch(out, /evil|javascript:/)
  })
})
