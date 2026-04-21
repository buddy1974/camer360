import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { polls, pollVotes } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

async function getPollData(pollId: number) {
  const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1)
  if (!poll) return null

  const options: string[] = JSON.parse(poll.options)

  const voteCounts = await db
    .select({ optionIdx: pollVotes.optionIdx, count: sql<number>`count(*)` })
    .from(pollVotes)
    .where(eq(pollVotes.pollId, pollId))
    .groupBy(pollVotes.optionIdx)

  const votes  = options.map((_, i) => Number(voteCounts.find(v => v.optionIdx === i)?.count ?? 0))
  const total  = votes.reduce((a, b) => a + b, 0)
  return { id: poll.id, question: poll.question, options, votes, total }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pollId = Number(id)
  if (isNaN(pollId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const data = await getPollData(pollId)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pollId = Number(id)
  if (isNaN(pollId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await req.json() as { optionIdx?: number }
  const optionIdx = Number(body.optionIdx)
  if (isNaN(optionIdx) || optionIdx < 0) {
    return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
  }

  try {
    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1)
    if (!poll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const options: string[] = JSON.parse(poll.options)
    if (optionIdx >= options.length) {
      return NextResponse.json({ error: 'Option out of range' }, { status: 400 })
    }

    await db.insert(pollVotes).values({ pollId, optionIdx })

    const data = await getPollData(pollId)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
