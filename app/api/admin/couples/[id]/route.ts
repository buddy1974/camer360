import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { couples } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await req.json() as Partial<{
      name1: string; name2: string; status: string; since: string
      imageUrl: string; description: string; country: string
    }>
    await db.update(couples).set({
      ...(body.name1       && { name1:       body.name1 }),
      ...(body.name2       && { name2:       body.name2 }),
      ...(body.status      && { status:      body.status as typeof couples.$inferInsert['status'] }),
      ...(body.since !== undefined && { since: body.since ? new Date(body.since) : null }),
      ...(body.imageUrl !== undefined    && { imageUrl:    body.imageUrl || null }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.country !== undefined     && { country:     body.country || null }),
    }).where(eq(couples.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await db.delete(couples).where(eq(couples.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
