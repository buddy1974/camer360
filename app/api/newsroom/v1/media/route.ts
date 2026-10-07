import { newsroomRoute } from '@/lib/newsroom/handler'
import { uploadDirect } from '@/lib/newsroom/media'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const POST = newsroomRoute({ operation: 'media_upload', role: 'contributor', write: true }, async ({ service, actor, body, deps }) => {
  const r = await uploadDirect(service, await deps.media(), actor, body)
  return { status: 201, data: r.data, articleId: r.articleId, changedFields: r.changedFields, revalidate: r.revalidate }
})
