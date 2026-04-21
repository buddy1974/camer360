import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { birthdays } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await req.json() as Partial<{
      name: string; birthMonth: number; birthDay: number; birthYear: number
      category: string; country: string; imageUrl: string; celebSlug: string
    }>
    await db.update(birthdays).set({
      ...(body.name        && { name:       body.name }),
      ...(body.birthMonth  && { birthMonth: body.birthMonth }),
      ...(body.birthDay    && { birthDay:   body.birthDay }),
      ...(body.birthYear !== undefined  && { birthYear: body.birthYear || null }),
      ...(body.category !== undefined   && { category:  body.category || null }),
      ...(body.country !== undefined    && { country:   body.country || null }),
      ...(body.imageUrl !== undefined   && { imageUrl:  body.imageUrl || null }),
      ...(body.celebSlug !== undefined  && { celebSlug: body.celebSlug || null }),
    }).where(eq(birthdays.id, numId))
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
    await db.delete(birthdays).where(eq(birthdays.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
