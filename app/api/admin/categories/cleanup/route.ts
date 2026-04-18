import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { categories, articles } from '@/lib/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

// CC-era slugs that don't belong on an entertainment magazine
const CC_SLUGS = [
  'politics', 'society', 'sportsnews', 'southern-cameroons',
  'health', 'business', 'anglophone-crisis', 'culture',
  'international', 'security', 'economy', 'education',
  'religion', 'environment', 'technology', 'opinion',
]

export async function POST() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find CC categories that have no articles
  const candidates = await db
    .select({
      id:    categories.id,
      slug:  categories.slug,
      count: sql<number>`COUNT(${articles.id})`,
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .where(inArray(categories.slug, CC_SLUGS))
    .groupBy(categories.id, categories.slug)

  const empty    = candidates.filter(c => Number(c.count) === 0)
  const occupied = candidates.filter(c => Number(c.count) > 0)

  if (empty.length > 0) {
    await db.delete(categories).where(
      inArray(categories.id, empty.map(c => c.id))
    )
  }

  return NextResponse.json({
    ok: true,
    deleted: empty.map(c => c.slug),
    skipped: occupied.map(c => ({ slug: c.slug, articles: Number(c.count) })),
    message: occupied.length > 0
      ? `${empty.length} removed. ${occupied.length} skipped (have articles — reassign first).`
      : `${empty.length} CC categories removed.`,
  })
}
