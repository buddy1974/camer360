import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema/articles'
import { categories } from '@/lib/db/schema/categories'
import { socialQueue } from '@/lib/db/schema/social'
import { eq, and, notInArray } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

// GET /api/n8n/social/youtube?limit=5 — published articles not yet posted to YouTube
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 5), 20)

  const sentRows = await db
    .select({ articleId: socialQueue.articleId })
    .from(socialQueue)
    .where(and(eq(socialQueue.platform, 'youtube'), eq(socialQueue.status, 'sent')))

  const sentIds = sentRows.map(r => r.articleId).filter((id): id is number => id != null)
  const baseCondition = eq(articles.status, 'published')
  const whereClause = sentIds.length > 0
    ? and(baseCondition, notInArray(articles.id, sentIds))
    : baseCondition

  const rows = await db
    .select({
      id:            articles.id,
      title:         articles.title,
      excerpt:       articles.excerpt,
      slug:          articles.slug,
      featuredImage: articles.featuredImage,
      publishedAt:   articles.publishedAt,
      categorySlug:  categories.slug,
    })
    .from(articles)
    .innerJoin(categories, eq(categories.id, articles.categoryId))
    .where(whereClause)
    .orderBy(articles.publishedAt)
    .limit(limit)

  return NextResponse.json(rows)
}

// PATCH /api/n8n/social/youtube — record result after posting attempt
export async function PATCH(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { article_id, status, platform_post_id, error: errMsg } = await req.json()

  if (!article_id || !['sent', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await db.insert(socialQueue).values({
    articleId:      article_id,
    platform:       'youtube',
    status:         status as 'sent' | 'failed',
    platformPostId: platform_post_id ?? null,
    error:          errMsg ?? null,
    sentAt:         status === 'sent' ? new Date() : null,
  })

  return NextResponse.json({ ok: true })
}
