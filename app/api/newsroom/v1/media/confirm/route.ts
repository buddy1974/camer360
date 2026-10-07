import { newsroomRoute } from '@/lib/newsroom/handler'
import { confirmUpload } from '@/lib/newsroom/media'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const POST = newsroomRoute({ operation: 'media_confirm', role: 'contributor', write: true }, async ({ service, actor, body, deps }) => {
  const r = await confirmUpload(service, await deps.media(), actor, body)
  return { status: 201, data: r.data, articleId: r.articleId, changedFields: r.changedFields, revalidate: r.revalidate }
})
