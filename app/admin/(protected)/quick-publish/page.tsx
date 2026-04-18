import { QuickPublish } from '@/components/admin/QuickPublish'
import { getAllCategories } from '@/lib/db/queries'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function QuickPublishPage() {
  let categories: Category[] = []
  try {
    categories = await getAllCategories()
  } catch (e) {
    console.error('[quick-publish] getAllCategories error:', e)
  }
  return <QuickPublish categories={categories} />
}
