import { newsroomRoute } from '@/lib/newsroom/handler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = newsroomRoute({ operation: 'categories', role: 'viewer', write: false }, async ({ deps }) => ({
  data: (await deps.store.listCategories()).map(c => ({ id: c.id, slug: c.slug, name: c.name })),
}))
