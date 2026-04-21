export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePageContent } from '@/components/article/ArticlePageContent'
import { getArticleBySlug, getRelatedArticles } from '@/lib/db/queries'
import { buildArticleMetadata } from '@/lib/seo/metadata'

interface Props { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const article = await getArticleBySlug(category, slug)
  if (!article) return {}
  return buildArticleMetadata(article)
}

export default async function ArticlePage({ params }: Props) {
  const { category: catSlug, slug } = await params
  const article = await getArticleBySlug(catSlug, slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id, article.categoryId, 4)

  return <ArticlePageContent article={article} related={related} />
}
