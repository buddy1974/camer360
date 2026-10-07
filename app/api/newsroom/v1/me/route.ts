import { newsroomRoute } from '@/lib/newsroom/handler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = newsroomRoute({ operation: 'me', role: 'viewer', write: false }, async ({ actor, config }) => ({
  data: {
    actor: actor.id,
    role: actor.kind === 'telegram' ? actor.role : 'system',
    publication: config.publication,
  },
}))
