import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { richList } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(richList).orderBy(asc(richList.rank))
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      rank: number; name: string; country: string; industry?: string
      netWorthM: number; changeDir?: string
    }
    if (!body.name || !body.country || !body.rank || !body.netWorthM) {
      return NextResponse.json({ error: 'rank, name, country, netWorthM required' }, { status: 400 })
    }
    const [result] = await db.insert(richList).values({
      rank:       body.rank,
      name:       body.name,
      country:    body.country,
      industry:   body.industry || null,
      netWorthM:  body.netWorthM,
      changeDir:  body.changeDir || 'stable',
    }).$returningId()
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
