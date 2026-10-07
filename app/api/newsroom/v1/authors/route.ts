import { newsroomRoute } from '@/lib/newsroom/handler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = newsroomRoute({ operation: 'authors', role: 'viewer', write: false }, async ({ deps }) => ({
  data: (await deps.store.listAuthors()).map(a => ({ id: a.id, slug: a.slug, name: a.name })),
}))
