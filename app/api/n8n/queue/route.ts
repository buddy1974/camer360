import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { ingestedContent } from '@/lib/db/schema'
import { eq, and, lt, inArray, asc, sql } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

// GET /api/n8n/queue?limit=3 — fetch pending items for AI enhancement
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Default 3 (not 5) — smaller batch reduces partial-failure blast radius
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 3), 20)
  const staleThreshold = new Date(Date.now() - 30 * 60 * 1000)

  // Auto-recover: reset items stuck in 'processing' for >30 min back to 'pending'.
  // Uses processingStartedAt if available (accurate), falls back to ingestedAt (legacy).
  // Increments retry_count so chronically-failing items can be identified.
  try {
    await db
      .update(ingestedContent)
      .set({
        status:    'pending',
        retryCount: sql`COALESCE(retry_count, 0) + 1`,
      })
      .where(and(
        eq(ingestedContent.status, 'processing'),
        sql`COALESCE(${ingestedContent.processingStartedAt}, ${ingestedContent.ingestedAt}) < ${staleThreshold}`,
      ))
  } catch {
    // Resilience columns not yet migrated — fall back to ingestedAt only
    await db
      .update(ingestedContent)
      .set({ status: 'pending' })
      .where(and(
        eq(ingestedContent.status, 'processing'),
        lt(ingestedContent.ingestedAt, staleThreshold),
      ))
  }

  const rows = await db
    .select()
    .from(ingestedContent)
    .where(eq(ingestedContent.status, 'pending'))
    .orderBy(asc(ingestedContent.ingestedAt))
    .limit(limit)

  // Mark as processing + record exact start time for accurate stuck detection
  if (rows.length > 0) {
    const ids = rows.map(r => r.id)
    try {
      await db
        .update(ingestedContent)
        .set({ status: 'processing', processingStartedAt: new Date() })
        .where(inArray(ingestedContent.id, ids))
    } catch {
      // processingStartedAt column not yet migrated — status-only update
      await db
        .update(ingestedContent)
        .set({ status: 'processing' })
        .where(inArray(ingestedContent.id, ids))
    }
  }

  // Return items with status reflected as 'processing' (accurate post-update state).
  // Strip internal resilience columns so the n8n workflow sees the same shape it was built against.
  const payload = rows.map(({ retryCount: _r, lastError: _l, processingStartedAt: _p, ...rest }) => ({
    ...rest,
    status: 'processing' as const,
  }))

  return NextResponse.json(payload)
}

// PATCH /api/n8n/queue — mark items as processed or rejected
export async function PATCH(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, reject_reason, article_id, error: lastErr } = await req.json() as {
    id: number
    status: string
    reject_reason?: string
    article_id?: number
    error?: string
  }

  if (!id || !['processed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    await db
      .update(ingestedContent)
      .set({
        status:       status as 'processed' | 'rejected',
        rejectReason: reject_reason ?? null,
        ccArticleId:  article_id   ?? null,
        lastError:    lastErr       ?? null,
      })
      .where(eq(ingestedContent.id, id))
  } catch {
    // lastError column not yet migrated — update without it
    await db
      .update(ingestedContent)
      .set({
        status:       status as 'processed' | 'rejected',
        rejectReason: reject_reason ?? null,
        ccArticleId:  article_id   ?? null,
      })
      .where(eq(ingestedContent.id, id))
  }

  return NextResponse.json({ ok: true })
}
