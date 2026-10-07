import { articleIdParam, newsroomRoute } from '@/lib/newsroom/handler'
import { publishArticle } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Publisher only. DB update + cache revalidation — never social posting.
export const POST = newsroomRoute({ operation: 'publish', role: 'publisher', write: true }, async ({ params, service, actor, body }) => {
  const id = articleIdParam(params)
  const r = await publishArticle(service, actor, id, body)
  return { data: r.article, articleId: id, changedFields: r.changedFields, revalidate: r.revalidate }
})
