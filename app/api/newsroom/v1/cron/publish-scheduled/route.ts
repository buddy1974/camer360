import { randomUUID } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { safeEqual } from '@/lib/auth/safe-compare'
import { getNewsroomConfig } from '@/lib/newsroom/config'
import { getNewsroomDeps, logInternal } from '@/lib/newsroom/handler'
import { NewsroomError, errorResponse, jsonResponse, successBody } from '@/lib/newsroom/http'
import { runScheduler } from '@/lib/newsroom/scheduler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Vercel Cron backstop (vercel.json, daily). Vercel sends
 * `Authorization: Bearer ${CRON_SECRET}`. 503 when CRON_SECRET is unset.
 */
export async function GET(req: NextRequest) {
  const requestId = randomUUID()
  const secret = process.env.CRON_SECRET
  if (!secret) return errorResponse(new NewsroomError('API_NOT_CONFIGURED', 'CRON_SECRET is not configured'), requestId)
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!safeEqual(token, secret)) return errorResponse(new NewsroomError('SIGNATURE_INVALID', 'Unauthorized'), requestId)

  const cfg = getNewsroomConfig()
  if (!cfg.enabled) return errorResponse(new NewsroomError('API_DISABLED', 'Newsroom API is disabled'), requestId)
  if (!cfg.writesEnabled) return errorResponse(new NewsroomError('WRITES_DISABLED', 'Newsroom writes are disabled'), requestId)

  try {
    const r = await runScheduler(await getNewsroomDeps(), 'system:cron', requestId)
    return jsonResponse(successBody({ published: r.published, skipped: r.skipped, count: r.published.length }, requestId), 200)
  } catch (err) {
    logInternal('cron_publish_scheduled', requestId, err)
    return errorResponse(new NewsroomError('INTERNAL', 'Internal error'), requestId)
  }
}
