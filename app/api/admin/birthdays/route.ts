import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { birthdays } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(birthdays)
      .orderBy(asc(birthdays.birthMonth), asc(birthdays.birthDay))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string; birthMonth: number; birthDay: number; birthYear?: number
      category?: string; country?: string; imageUrl?: string; celebSlug?: string
    }
    if (!body.name || !body.birthMonth || !body.birthDay) {
      return NextResponse.json({ error: 'name, birthMonth, birthDay required' }, { status: 400 })
    }
    const [result] = await db.insert(birthdays).values({
      name:       body.name,
      birthMonth: body.birthMonth,
      birthDay:   body.birthDay,
      birthYear:  body.birthYear || null,
      category:   body.category || null,
      country:    body.country || null,
      imageUrl:   body.imageUrl || null,
      celebSlug:  body.celebSlug || null,
    }).$returningId()
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
