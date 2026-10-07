/**
 * Scheduled publishing, shared by the signed `/scheduler/run` endpoint and the
 * `CRON_SECRET`-protected Vercel cron backstop. Publishes only; never posts to
 * social networks.
 */
import { publishDue, type PublishDueResult } from './articles'
import { writeAudit } from './audit'
import { siteUrl } from './config'
import type { NewsroomDeps } from './handler'
import { IDEMPOTENCY_RETENTION_DAYS } from './idempotency'

export async function runScheduler(deps: NewsroomDeps, actor: string, requestId: string): Promise<PublishDueResult> {
  const now = deps.now()
  try {
    await deps.store.pruneExpired(now, new Date(now.getTime() - IDEMPOTENCY_RETENTION_DAYS * 86_400_000))
  } catch { /* housekeeping only */ }

  const result = await publishDue({ store: deps.store, now, siteUrl: siteUrl() })
  for (const p of result.published) {
    await writeAudit(deps.store, {
      requestId, actor, operation: 'publish_scheduled', articleId: p.id,
      changedFields: ['status', 'publishedAt'], idempotencyKey: null, result: 'ok', errorCode: null,
    })
  }
  if (result.revalidate.length) {
    try { await deps.revalidate(result.revalidate) } catch { /* ignore */ }
  }
  return result
}
