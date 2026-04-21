import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { richList } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = await req.json() as Partial<{
      rank: number; name: string; country: string; industry: string
      netWorthM: number; changeDir: string
    }>
    await db.update(richList).set({
      ...(body.rank      !== undefined && { rank:      body.rank }),
      ...(body.name      && { name:      body.name }),
      ...(body.country   && { country:   body.country }),
      ...(body.industry  !== undefined && { industry:  body.industry || null }),
      ...(body.netWorthM !== undefined && { netWorthM: body.netWorthM }),
      ...(body.changeDir && { changeDir: body.changeDir }),
    }).where(eq(richList.id, numId))
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
    await db.delete(richList).where(eq(richList.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
