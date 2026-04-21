import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { awards } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(awards)
      .orderBy(desc(awards.year), desc(awards.ceremonyDate))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      awardShow: string; year: number; category: string; winner?: string
      nominees?: string; ceremonyDate?: string; status?: string; description?: string
    }
    if (!body.awardShow || !body.year || !body.category) {
      return NextResponse.json({ error: 'awardShow, year, category required' }, { status: 400 })
    }
    const [result] = await db.insert(awards).values({
      awardShow:    body.awardShow,
      year:         body.year,
      category:     body.category,
      winner:       body.winner || null,
      nominees:     body.nominees || null,
      ceremonyDate: body.ceremonyDate ? new Date(body.ceremonyDate) : null,
      status:       (body.status as typeof awards.$inferInsert['status']) ?? 'upcoming',
      description:  body.description || null,
    }).$returningId()
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
