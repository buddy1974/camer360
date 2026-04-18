import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { getAllCategories, getArticleById } from '@/lib/db/queries'
import { notFound } from 'next/navigation'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let categories: Category[] = []
  try {
    categories = await getAllCategories()
  } catch (e) {
    console.error('[edit-article] getAllCategories error:', e)
  }
  const article = await getArticleById(parseInt(id)).catch(() => null)
  if (!article) notFound()
  return <ArticleEditor categories={categories} article={article} />
}
