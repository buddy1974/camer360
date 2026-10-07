import { articleIdParam, newsroomRoute } from '@/lib/newsroom/handler'
import { loadArticle, updateArticle } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = newsroomRoute({ operation: 'get_article', role: 'viewer', write: false }, async ({ params, service }) => ({
  data: await loadArticle(service, articleIdParam(params)),
}))

/** Contributor (own draft/unpublished only) or editor+. Never touches slug/status/published_at. */
export const PATCH = newsroomRoute({ operation: 'update_article', role: 'contributor', write: true }, async ({ params, service, actor, body }) => {
  const id = articleIdParam(params)
  const r = await updateArticle(service, actor, id, body)
  return { data: r.article, articleId: id, changedFields: r.changedFields, revalidate: r.revalidate }
})
