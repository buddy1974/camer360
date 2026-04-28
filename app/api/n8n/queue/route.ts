import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { ingestedContent } from '@/lib/db/schema'
import { eq, and, lt, inArray, asc } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

// GET /api/n8n/queue?limit=5 — fetch pending items for AI enhancement
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 5), 20)

  // Auto-recover: reset items stuck in 'processing' for >30 min back to 'pending'.
  // Happens when n8n fails mid-workflow and never calls PATCH to mark completion.
  const staleThreshold = new Date(Date.now() - 30 * 60 * 1000)
  await db
    .update(ingestedContent)
    .set({ status: 'pending' })
    .where(and(
      eq(ingestedContent.status, 'processing'),
      lt(ingestedContent.ingestedAt, staleThreshold),
    ))

  const rows = await db
    .select()
    .from(ingestedContent)
    .where(eq(ingestedContent.status, 'pending'))
    .orderBy(asc(ingestedContent.ingestedAt))
    .limit(limit)

  // Mark as processing to prevent double-pick
  if (rows.length > 0) {
    const ids = rows.map(r => r.id)
    await db
      .update(ingestedContent)
      .set({ status: 'processing' })
      .where(inArray(ingestedContent.id, ids))
  }

  return NextResponse.json(rows)
}

// PATCH /api/n8n/queue — mark items as processed or rejected
export async function PATCH(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, reject_reason, article_id } = await req.json() as {
    id: number; status: string; reject_reason?: string; article_id?: number
  }

  if (!id || !['processed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await db
    .update(ingestedContent)
    .set({
      status:       status as 'processed' | 'rejected',
      rejectReason: reject_reason ?? null,
      ccArticleId:  article_id   ?? null,
    })
    .where(eq(ingestedContent.id, id))

  return NextResponse.json({ ok: true })
}
