import { newsroomRoute } from '@/lib/newsroom/handler'
import { presignUpload } from '@/lib/newsroom/media'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const POST = newsroomRoute({ operation: 'media_presign', role: 'contributor', write: true }, async ({ service, actor, body, deps }) => ({
  data: await presignUpload(service, await deps.media(), actor, body),
}))
