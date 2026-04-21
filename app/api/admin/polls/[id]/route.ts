import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { polls, pollVotes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body   = await req.json() as { question?: string; options?: string[]; active?: boolean }
  try {
    const update: Partial<typeof polls.$inferInsert> = {}
    if (body.question)          update.question = body.question.trim()
    if (body.options)           update.options  = JSON.stringify(body.options)
    if (body.active !== undefined) update.active = body.active
    await db.update(polls).set(update).where(eq(polls.id, Number(id)))
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.delete(pollVotes).where(eq(pollVotes.pollId, Number(id)))
    await db.delete(polls).where(eq(polls.id, Number(id)))
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
