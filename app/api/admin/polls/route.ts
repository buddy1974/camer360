import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { polls } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(polls).orderBy(desc(polls.createdAt)).limit(100)
    return NextResponse.json(rows)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { question?: string; options?: string[]; articleId?: number }
  if (!body.question?.trim() || !Array.isArray(body.options) || body.options.length < 2) {
    return NextResponse.json({ error: 'question and at least 2 options required' }, { status: 400 })
  }
  try {
    const result = await db.insert(polls).values({
      question:  body.question.trim(),
      options:   JSON.stringify(body.options.map((o: string) => o.trim()).filter(Boolean)),
      articleId: body.articleId ?? null,
    }).$returningId()
    return NextResponse.json({ ok: true, id: result[0].id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
