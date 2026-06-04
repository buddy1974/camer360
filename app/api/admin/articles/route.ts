import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles, categories, authors, articleHits } from '@/lib/db/schema'
import { desc, eq, like, sql, and, inArray } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { postArticleToSocial } from '@/server/lib/social'
import { sanitizeArticleBody } from '@/lib/sanitize'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit   = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20')), 500)
  const offset  = (page - 1) * limit
  const search  = searchParams.get('q') || ''
  const catSlug = searchParams.get('category') || ''
  const status  = searchParams.get('status') || ''

  const conditions = [
    search  ? like(articles.title, `%${search}%`)                                    : undefined,
    catSlug ? eq(categories.slug, catSlug)                                            : undefined,
    status  ? eq(articles.status, status as 'draft' | 'published' | 'archived')      : undefined,
  ].filter(Boolean) as Parameters<typeof and>

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id:          articles.id,
      title:       articles.title,
      slug:        articles.slug,
      status:      articles.status,
      publishedAt: articles.publishedAt,
      category:    categories.name,
      catSlug:     categories.slug,
      hits:        articleHits.hits,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .leftJoin(articleHits, eq(articleHits.articleId, articles.id))
    .where(where)
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)

  return NextResponse.json({ articles: rows, total: Number(count), page, limit })
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  const isAutomation = !!(apiKey && apiKey === (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY))
  if (!isAutomation) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    const admin = token ? await verifyToken(token) : null
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as {
    title: string; slug: string; body: string; excerpt?: string
    categoryId: number; featuredImage?: string; status: string
    metaTitle?: string; metaDesc?: string; isBreaking?: boolean; isFeatured?: boolean
    authorId?: number | null; country?: string | null
  }

  const BLOCKED_IMAGE_HOSTS = [
    'fbcdn.net', 'scontent.', 'encrypted-tbn0.gstatic.com',
    'gstatic.com', 'images.euronews.com', 'euronews.com',
  ]
  const isBadImage = (url?: string) =>
    !!url && BLOCKED_IMAGE_HOSTS.some(h => url.includes(h))
  if (isBadImage(body.featuredImage)) body.featuredImage = undefined

  if (isAutomation) {
    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(and(eq(articles.title, body.title), eq(articles.status, 'draft')))
      .limit(1)
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'duplicate_title', id: existing.id, message: 'Draft with this title already exists -- skipped' },
        { status: 409 }
      )
    }
  }

  const effectiveStatus = isAutomation ? 'draft' : (body.status as 'draft' | 'published')

  const now = new Date()
  const result = await db.insert(articles).values({
    title:         body.title,
    slug:          body.slug,
    body:          sanitizeArticleBody(body.body || ''),
    excerpt:       body.excerpt || null,
    categoryId:    body.categoryId,
    featuredImage: body.featuredImage || null,
    status:        effectiveStatus,
    isBreaking:    body.isBreaking || false,
    isFeatured:    body.isFeatured || false,
    metaTitle:     body.metaTitle || null,
    metaDesc:      body.metaDesc || null,
    authorId:      body.authorId || null,
    country:       body.country || null,
    publishedAt:   effectiveStatus === 'published' ? now : null,
    createdAt:     now,
    updatedAt:     now,
  }).$returningId()

  const newId = result[0].id

  revalidateTag('articles', {})

  if (effectiveStatus === 'published') {
    const cat = await db.select({ slug: categories.slug, name: categories.name })
      .from(categories).where(eq(categories.id, body.categoryId)).limit(1)
    if (cat[0]) {
      postArticleToSocial({
        id:            newId,
        title:         body.title,
        slug:          body.slug,
        excerpt:       body.excerpt,
        featuredImage: body.featuredImage,
        category:      cat[0],
      }).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true, id: newId })
}

type BulkStatus = 'draft' | 'published' | 'unpublished' | 'archived'

function patchSet(s: BulkStatus, now: Date) {
  return s === 'published'
    ? ({ status: s, updatedAt: now, publishedAt: now } as const)
    : ({ status: s, updatedAt: now } as const)
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const admin = token ? await verifyToken(token) : null
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    ids?: number[]; status?: BulkStatus
    fromStatus?: BulkStatus; toStatus?: BulkStatus
  }
  const now = new Date()

  if (body.ids && body.ids.length > 0 && body.status) {
    await db.update(articles).set(patchSet(body.status, now)).where(inArray(articles.id, body.ids))
    revalidateTag('articles', {})
    return NextResponse.json({ ok: true, updated: body.ids.length })
  }

  if (body.fromStatus && body.toStatus) {
    const rows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.status, body.fromStatus))
    const ids = rows.map(r => r.id)
    if (ids.length > 0) {
      await db.update(articles).set(patchSet(body.toStatus, now)).where(inArray(articles.id, ids))
      revalidateTag('articles', {})
    }
    return NextResponse.json({ ok: true, updated: ids.length })
  }

  return NextResponse.json({ error: 'Provide ids+status or fromStatus+toStatus' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const admin = token ? await verifyToken(token) : null
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { ids?: number[]; status?: string }

  if (body.ids && body.ids.length > 0) {
    await db.delete(articles).where(inArray(articles.id, body.ids))
    revalidateTag('articles', {})
    return NextResponse.json({ ok: true, deleted: body.ids.length })
  }

  if (body.status && ['draft', 'archived'].includes(body.status)) {
    const rows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.status, body.status as 'draft' | 'archived'))
    const ids = rows.map(r => r.id)
    if (ids.length > 0) {
      await db.delete(articles).where(inArray(articles.id, ids))
      revalidateTag('articles', {})
    }
    return NextResponse.json({ ok: true, deleted: ids.length })
  }

  return NextResponse.json({ error: 'Provide ids[] or status field' }, { status: 400 })
}
