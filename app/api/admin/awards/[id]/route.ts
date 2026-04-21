import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { awards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await req.json() as Partial<{
      awardShow: string; year: number; category: string; winner: string
      nominees: string; ceremonyDate: string; status: string; description: string
    }>
    await db.update(awards).set({
      ...(body.awardShow   && { awardShow:   body.awardShow }),
      ...(body.year        && { year:        body.year }),
      ...(body.category    && { category:    body.category }),
      ...(body.winner !== undefined      && { winner:       body.winner || null }),
      ...(body.nominees !== undefined    && { nominees:     body.nominees || null }),
      ...(body.ceremonyDate !== undefined && { ceremonyDate: body.ceremonyDate ? new Date(body.ceremonyDate) : null }),
      ...(body.status      && { status:      body.status as typeof awards.$inferInsert['status'] }),
      ...(body.description !== undefined && { description:  body.description || null }),
    }).where(eq(awards.id, numId))
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
    await db.delete(awards).where(eq(awards.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
