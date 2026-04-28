export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { ingestedContent } from '@/lib/db/schema'
import { socialQueue } from '@/lib/db/schema/social'
import { articles } from '@/lib/db/schema/articles'
import { eq, and, lt, notInArray, desc, sql } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

/**
 * GET /api/n8n/health
 * Comprehensive system health check for the automation pipeline.
 * Returns queue stats, env var presence, Facebook activity, stuck item count.
 *
 * Add ?reset=1 to also reset any stuck 'processing' items back to 'pending'.
 */
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doReset = req.nextUrl.searchParams.get('reset') === '1'
  const issues: string[] = []
  const report: Record<string, unknown> = { timestamp: new Date().toISOString() }

  // ── 1. Environment variable presence ─────────────────────────────────────
  const effectiveKey = process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'] ?? ''
  report.env = {
    AUTOMATION_API_KEY:              !!process.env['AUTOMATION_API_KEY'],
    NEXT_PUBLIC_AUTOMATION_API_KEY:  !!process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'],
    authKeyLength:                   effectiveKey.length,
    usingPublicFallback:             !process.env['AUTOMATION_API_KEY'] && !!process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'],
    OPENAI_API_KEY:                  !!process.env['OPENAI_API_KEY'],
    ANTHROPIC_API_KEY:               !!process.env['ANTHROPIC_API_KEY'],
    DB_HOST:                         !!process.env['DB_HOST'],
    DB_USER:                         !!process.env['DB_USER'],
    DB_PASSWORD:                     !!process.env['DB_PASSWORD'],
    DB_NAME:                         !!process.env['DB_NAME'],
    YOUTUBE_API_KEY:                 !!process.env['YOUTUBE_API_KEY'],
    YOUTUBE_REFRESH_TOKEN:           !!process.env['YOUTUBE_REFRESH_TOKEN'],
    YOUTUBE_CHANNEL_ID:              !!process.env['YOUTUBE_CHANNEL_ID'],
  }

  if (effectiveKey.length === 0) {
    issues.push('CRITICAL: AUTOMATION_API_KEY is not set — every n8n API call will return 401')
  } else if (effectiveKey.length < 16) {
    issues.push(`WARNING: Auth key is only ${effectiveKey.length} chars — verify it matches the key stored in n8n credentials`)
  }
  if (!process.env['AUTOMATION_API_KEY'] && process.env['NEXT_PUBLIC_AUTOMATION_API_KEY']) {
    issues.push('WARNING: Using NEXT_PUBLIC_AUTOMATION_API_KEY as fallback — this key is exposed in client bundle; set AUTOMATION_API_KEY instead')
  }
  if (!process.env['OPENAI_API_KEY']) {
    issues.push('CRITICAL: OPENAI_API_KEY not set — /api/n8n/claude will return 500')
  }

  // ── 2. DB connectivity + ingestion queue stats ────────────────────────────
  let resetCount = 0
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)

    // Optionally reset stuck items
    if (doReset) {
      const result = await db
        .update(ingestedContent)
        .set({ status: 'pending' })
        .where(and(
          eq(ingestedContent.status, 'processing'),
          lt(ingestedContent.ingestedAt, thirtyMinAgo),
        ))
      resetCount = (result as any)?.rowsAffected ?? 0
    }

    const [stats] = await db.select({
      pending:    sql<number>`SUM(CASE WHEN ${ingestedContent.status} = 'pending'    THEN 1 ELSE 0 END)`,
      processing: sql<number>`SUM(CASE WHEN ${ingestedContent.status} = 'processing' THEN 1 ELSE 0 END)`,
      processed:  sql<number>`SUM(CASE WHEN ${ingestedContent.status} = 'processed'  THEN 1 ELSE 0 END)`,
      rejected:   sql<number>`SUM(CASE WHEN ${ingestedContent.status} = 'rejected'   THEN 1 ELSE 0 END)`,
      total:      sql<number>`COUNT(*)`,
    }).from(ingestedContent)

    const [stuckRow] = await db
      .select({ n: sql<number>`COUNT(*)` })
      .from(ingestedContent)
      .where(and(
        eq(ingestedContent.status, 'processing'),
        lt(ingestedContent.ingestedAt, thirtyMinAgo),
      ))

    const stuck = Number(stuckRow?.n ?? 0)
    report.db = 'connected'
    report.queue = { ...stats, stuckProcessing: stuck, resetCount }

    if (stuck > 0 && !doReset) {
      issues.push(`WARNING: ${stuck} item(s) stuck in 'processing' >30 min — add ?reset=1 to fix, or next queue GET will auto-reset them`)
    }
    if (doReset && resetCount > 0) {
      issues.push(`INFO: Reset ${resetCount} stuck item(s) back to 'pending'`)
    }
    if (Number(stats.pending ?? 0) === 0 && Number(stats.processing ?? 0) === 0) {
      issues.push('INFO: Queue has no pending or processing items — nothing for n8n to pick up until new RSS content is ingested')
    }
  } catch (err: any) {
    report.db = `ERROR: ${err.message}`
    report.queue = null
    issues.push(`CRITICAL: DB connection failed — "${err.message}" — check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Vercel env vars`)
  }

  // ── 3. Facebook social queue stats ───────────────────────────────────────
  try {
    const [fbSent] = await db
      .select({ n: sql<number>`COUNT(*)` })
      .from(socialQueue)
      .where(and(eq(socialQueue.platform, 'facebook'), eq(socialQueue.status, 'sent')))

    const [fbFailed] = await db
      .select({ n: sql<number>`COUNT(*)` })
      .from(socialQueue)
      .where(and(eq(socialQueue.platform, 'facebook'), eq(socialQueue.status, 'failed')))

    const [lastPost] = await db
      .select({ sentAt: socialQueue.sentAt, error: socialQueue.error })
      .from(socialQueue)
      .where(eq(socialQueue.platform, 'facebook'))
      .orderBy(desc(socialQueue.id))
      .limit(1)

    const [lastFail] = await db
      .select({ error: socialQueue.error })
      .from(socialQueue)
      .where(and(eq(socialQueue.platform, 'facebook'), eq(socialQueue.status, 'failed')))
      .orderBy(desc(socialQueue.id))
      .limit(1)

    report.facebook = {
      totalSent:      Number(fbSent?.n ?? 0),
      totalFailed:    Number(fbFailed?.n ?? 0),
      lastActivity:   lastPost?.sentAt ?? null,
      lastFailReason: lastFail?.error ?? null,
    }

    if (Number(fbFailed?.n ?? 0) > 0) {
      issues.push(`WARNING: ${fbFailed.n} Facebook post(s) failed — last error: "${lastFail?.error ?? 'unknown'}" — likely expired page token`)
    }
  } catch (err: any) {
    report.facebook = `ERROR: ${err.message}`
    issues.push(`Facebook queue check failed: ${err.message}`)
  }

  // ── 4. Published articles backlog (not yet posted to Facebook) ────────────
  try {
    const sentRows = await db
      .select({ articleId: socialQueue.articleId })
      .from(socialQueue)
      .where(and(eq(socialQueue.platform, 'facebook'), eq(socialQueue.status, 'sent')))

    const sentIds = sentRows.map(r => r.articleId).filter((id): id is number => id != null)

    const [totalRow] = await db
      .select({ n: sql<number>`COUNT(*)` })
      .from(articles)
      .where(eq(articles.status, 'published'))

    const total = Number(totalRow?.n ?? 0)

    let unposted = total
    if (sentIds.length > 0) {
      const [unpostedRow] = await db
        .select({ n: sql<number>`COUNT(*)` })
        .from(articles)
        .where(and(eq(articles.status, 'published'), notInArray(articles.id, sentIds)))
      unposted = Number(unpostedRow?.n ?? 0)
    }

    report.articles = { totalPublished: total, notYetPostedToFacebook: unposted }
  } catch (err: any) {
    report.articles = `ERROR: ${err.message}`
  }

  const criticalCount = issues.filter(i => i.startsWith('CRITICAL')).length
  return NextResponse.json({
    ok: criticalCount === 0,
    criticalIssues: criticalCount,
    issues,
    ...report,
  })
}
