import { articleIdParam, newsroomRoute } from '@/lib/newsroom/handler'
import { scheduleArticle } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Publisher only. { scheduledAt, expectedVersion } → status 'scheduled'.
export const POST = newsroomRoute({ operation: 'schedule', role: 'publisher', write: true }, async ({ params, service, actor, body }) => {
  const id = articleIdParam(params)
  const r = await scheduleArticle(service, actor, id, body)
  return { data: r.article, articleId: id, changedFields: r.changedFields, revalidate: r.revalidate }
})
