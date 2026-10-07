import { newsroomRoute } from '@/lib/newsroom/handler'
import { createDraft, listArticles } from '@/lib/newsroom/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = newsroomRoute({ operation: 'list_articles', role: 'viewer', write: false }, async ({ url, service }) => {
  const get = (k: string) => url.searchParams.get(k) ?? undefined
  return {
    data: await listArticles(service, {
      q: get('q'), status: get('status'), category: get('category'),
      since: get('since'), until: get('until'), limit: get('limit'),
    }),
  }
})

/** Always creates a draft, whatever the input says. */
export const POST = newsroomRoute({ operation: 'create_draft', role: 'contributor', write: true }, async ({ service, actor, body }) => {
  const r = await createDraft(service, actor, body)
  return { status: 201, data: r.article, articleId: r.article.id, changedFields: r.changedFields }
})
