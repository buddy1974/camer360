import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = await req.json() as Partial<{
      artist: string; title: string; releaseDate: string; type: string
      streamUrl: string; coverUrl: string; description: string; country: string
    }>
    await db.update(musicDrops).set({
      ...(body.artist      && { artist:      body.artist }),
      ...(body.title       && { title:       body.title }),
      ...(body.releaseDate && { releaseDate: new Date(body.releaseDate) }),
      ...(body.type        && { type:        body.type }),
      ...(body.streamUrl !== undefined && { streamUrl:   body.streamUrl || null }),
      ...(body.coverUrl  !== undefined && { coverUrl:    body.coverUrl || null }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.country   !== undefined && { country:     body.country || null }),
    }).where(eq(musicDrops.id, numId))
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
    await db.delete(musicDrops).where(eq(musicDrops.id, numId))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
