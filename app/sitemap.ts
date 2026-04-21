export const revalidate = 3600

import { MetadataRoute } from 'next'
import { getLatestArticles, getAllCategories } from '@/lib/db/queries'
import { CELEBRITIES } from '@/lib/celebrities'
import { SITE_URL } from '@/lib/constants'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/celebrities`,           changeFrequency: 'weekly'  as const, priority: 0.8, lastModified: new Date() },
  { url: `${SITE_URL}/awards`,                changeFrequency: 'weekly'  as const, priority: 0.7, lastModified: new Date() },
  { url: `${SITE_URL}/birthdays`,             changeFrequency: 'daily'   as const, priority: 0.7, lastModified: new Date() },
  { url: `${SITE_URL}/gossip/couples`,        changeFrequency: 'weekly'  as const, priority: 0.6, lastModified: new Date() },
  { url: `${SITE_URL}/archives`,              changeFrequency: 'monthly' as const, priority: 0.5, lastModified: new Date() },
  { url: `${SITE_URL}/money-moves/rich-list`, changeFrequency: 'monthly' as const, priority: 0.6, lastModified: new Date() },
  { url: `${SITE_URL}/music/new-releases`,    changeFrequency: 'daily'   as const, priority: 0.7, lastModified: new Date() },
  { url: `${SITE_URL}/my-feed`,               changeFrequency: 'always'  as const, priority: 0.5, lastModified: new Date() },
  { url: `${SITE_URL}/editorial-guidelines`,  changeFrequency: 'yearly'  as const, priority: 0.3, lastModified: new Date() },
  { url: `${SITE_URL}/corrections-policy`,    changeFrequency: 'yearly'  as const, priority: 0.3, lastModified: new Date() },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof getLatestArticles>> = []
  let categories: Awaited<ReturnType<typeof getAllCategories>> = []
  try {
    ;[articles, categories] = await Promise.all([getLatestArticles(1000), getAllCategories()])
  } catch { /* DB unavailable at build time */ }

  const articleUrls: MetadataRoute.Sitemap = articles.map(a => ({
    url:             `${SITE_URL}/${a.category.slug}/${a.slug}`,
    lastModified:    a.updatedAt ? new Date(a.updatedAt) : new Date(a.publishedAt!),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map(c => ({
    url:             `${SITE_URL}/${c.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'hourly',
    priority:        0.8,
  }))

  const celebrityUrls: MetadataRoute.Sitemap = CELEBRITIES.map(c => ({
    url:             `${SITE_URL}/celebrities/${c.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.75,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'always', priority: 1 },
    ...STATIC_ROUTES,
    ...categoryUrls,
    ...celebrityUrls,
    ...articleUrls,
  ]
}
