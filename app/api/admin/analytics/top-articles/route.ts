import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { articles, categories, articleHits } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const rows = await db
      .select({
        id:           articles.id,
        title:        articles.title,
        slug:         articles.slug,
        categorySlug: categories.slug,
        publishedAt:  articles.publishedAt,
        hits:         articleHits.hits,
      })
      .from(articleHits)
      .innerJoin(articles,    eq(articleHits.articleId, articles.id))
      .innerJoin(categories,  eq(articles.categoryId,   categories.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articleHits.hits))
      .limit(50)

    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
