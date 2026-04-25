import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(musicDrops).orderBy(desc(musicDrops.releaseDate))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      artist: string; title: string; releaseDate: string; type?: string
      streamUrl?: string; coverUrl?: string; description?: string; country?: string
      spotifyId?: string; appleUrl?: string; audiomackUrl?: string
      boomplayUrl?: string; youtubeUrl?: string; chartPosition?: number
    }
    if (!body.artist || !body.title || !body.releaseDate) {
      return NextResponse.json({ error: 'artist, title, releaseDate required' }, { status: 400 })
    }
    const [result] = await db.insert(musicDrops).values({
      artist:        body.artist,
      title:         body.title,
      releaseDate:   new Date(body.releaseDate),
      type:          body.type || 'single',
      streamUrl:     body.streamUrl     || null,
      coverUrl:      body.coverUrl      || null,
      description:   body.description   || null,
      country:       body.country       || null,
      spotifyId:     body.spotifyId     || null,
      appleUrl:      body.appleUrl      || null,
      audiomackUrl:  body.audiomackUrl  || null,
      boomplayUrl:   body.boomplayUrl   || null,
      youtubeUrl:    body.youtubeUrl    || null,
      chartPosition: body.chartPosition ?? null,
    }).$returningId()
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
