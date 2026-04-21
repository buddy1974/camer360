import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articleReactions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const VALID_REACTIONS = ['🔥', '😍', '😂', '👀', '💅', '💔']

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const articleId = parseInt(id)
  if (isNaN(articleId)) return NextResponse.json([])

  try {
    const rows = await db
      .select({
        reaction: articleReactions.reaction,
        count:    sql<number>`count(*)`,
      })
      .from(articleReactions)
      .where(eq(articleReactions.articleId, articleId))
      .groupBy(articleReactions.reaction)

    return NextResponse.json(rows)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const articleId = parseInt(id)
  if (isNaN(articleId)) return NextResponse.json({ ok: false }, { status: 400 })

  const { reaction } = await req.json() as { reaction: string }
  if (!VALID_REACTIONS.includes(reaction)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    await db.insert(articleReactions).values({ articleId, reaction })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
