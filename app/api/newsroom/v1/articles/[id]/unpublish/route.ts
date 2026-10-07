import { articleIdParam, newsroomRoute } from '@/lib/newsroom/handler'
import { unpublishArticle } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Publisher only. Camer360: published → 'unpublished' (published_at kept).
export const POST = newsroomRoute({ operation: 'unpublish', role: 'publisher', write: true }, async ({ params, service, actor, body }) => {
  const id = articleIdParam(params)
  const r = await unpublishArticle(service, actor, id, body)
  return { data: r.article, articleId: id, changedFields: r.changedFields, revalidate: r.revalidate }
})
