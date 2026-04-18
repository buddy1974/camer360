import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { getAllCategories } from '@/lib/db/queries'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  let categories: Category[] = []
  try {
    categories = await getAllCategories()
  } catch (e) {
    console.error('[new-article] getAllCategories error:', e)
  }
  return <ArticleEditor categories={categories} />
}
