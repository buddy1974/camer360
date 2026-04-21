import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { couples } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(couples).orderBy(desc(couples.updatedAt))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name1: string; name2: string; status?: string; since?: string
      imageUrl?: string; description?: string; country?: string
    }
    if (!body.name1 || !body.name2) {
      return NextResponse.json({ error: 'name1 and name2 required' }, { status: 400 })
    }
    const [result] = await db.insert(couples).values({
      name1:       body.name1,
      name2:       body.name2,
      status:      (body.status as typeof couples.$inferInsert['status']) ?? 'dating',
      since:       body.since ? new Date(body.since) : null,
      imageUrl:    body.imageUrl || null,
      description: body.description || null,
      country:     body.country || null,
    }).$returningId()
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
