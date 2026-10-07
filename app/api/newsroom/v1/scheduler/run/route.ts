import { newsroomRoute } from '@/lib/newsroom/handler'
import { runScheduler } from '@/lib/newsroom/scheduler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Signed; actor `system:scheduler` or a publisher. Revalidation happens inside runScheduler. */
export const POST = newsroomRoute({ operation: 'scheduler_run', role: 'scheduler', write: true }, async ({ deps, actor, requestId }) => {
  const r = await runScheduler(deps, actor.id, requestId)
  return { data: { published: r.published, skipped: r.skipped, count: r.published.length } }
})
