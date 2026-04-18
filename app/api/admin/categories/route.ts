import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { categories, articles } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import slugify from 'slugify'

async function authCheck() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return !!payload
}

// GET /api/admin/categories
export async function GET() {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await db
      .select({
        id:    categories.id,
        slug:  categories.slug,
        name:  categories.name,
        count: sql<number>`COUNT(${articles.id})`,
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id, categories.slug, categories.name)
      .orderBy(categories.sortOrder, categories.name)

    return NextResponse.json(rows)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[categories GET]', msg)
    return NextResponse.json(
      { error: 'Database error', detail: msg, hint: 'Check DB env vars in Vercel dashboard' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories — create
export async function POST(req: NextRequest) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const slug = slugify(name, { lower: true, strict: true })
  const result = await db.insert(categories).values({ name, slug, description: description ?? '' }).$returningId()
  return NextResponse.json({ ok: true, id: result[0].id, slug })
}

// DELETE /api/admin/categories — delete by id (query param)
export async function DELETE(req: NextRequest) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.delete(categories).where(eq(categories.id, id))
  return NextResponse.json({ ok: true })
}
