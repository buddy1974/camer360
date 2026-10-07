import { articleIdParam, newsroomRoute } from '@/lib/newsroom/handler'
import { unscheduleArticle } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Publisher only. scheduled → draft.
export const POST = newsroomRoute({ operation: 'unschedule', role: 'publisher', write: true }, async ({ params, service, actor, body }) => {
  const id = articleIdParam(params)
  const r = await unscheduleArticle(service, actor, id, body)
  return { data: r.article, articleId: id, changedFields: r.changedFields, revalidate: r.revalidate }
})
