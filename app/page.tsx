export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import EbonyNavigation from '@/components/ebony-navigation'
import BackToTop from '@/components/ui/BackToTop'
import { Footer } from '@/components/layout/Footer'
import { BreakingBanner } from '@/components/article/BreakingBanner'
import { ArticleCard } from '@/components/article/ArticleCard'
import InstallBanner from '@/components/pwa/InstallBanner'
import { JsonLd } from '@/components/seo/JsonLd'
import { PremiumHero } from '@/components/home/PremiumHero'
import { TrendingSidebar } from '@/components/home/TrendingSidebar'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { EditorQuote } from '@/components/home/EditorQuote'
import {
  getFeaturedArticles, getLatestArticles,
  getMostRead, getArticlesByCategory, getAllCategories,
  getBreakingNews,
} from '@/lib/db/queries'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { buildOrganizationSchema } from '@/lib/seo/schema'
import type { ArticleWithRelations, Category } from '@/lib/types'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  let featured:  ArticleWithRelations[] = []
  let latest:    ArticleWithRelations[] = []
  let mostRead:  ArticleWithRelations[] = []
  let allCats:   Category[]             = []
  let breaking:  Awaited<ReturnType<typeof getBreakingNews>> = []

  try {
    ;[featured, latest, mostRead, allCats, breaking] = await Promise.all([
      getFeaturedArticles(7),
      getLatestArticles(18),
      getMostRead(6),
      getAllCategories(),
      getBreakingNews(5),
    ])
  } catch (err) {
    console.error('Homepage DB error:', err)
  }

  const targetSlugs = ['celebrities', 'music', 'film-tv', 'sport-stars', 'influencers', 'entrepreneurs', 'events']
  const availableSlugs = targetSlugs.filter(s => allCats.some(c => c.slug === s))

  let categoryRows: { slug: string; name: string; articles: ArticleWithRelations[] }[] = []
  try {
    categoryRows = await Promise.all(
      availableSlugs.slice(0, 6).map(async slug => {
        const cat = allCats.find(c => c.slug === slug)!
        const { articles: arts } = await getArticlesByCategory(cat.slug, 1, 6)
        return { slug: cat.slug, name: cat.name, articles: arts }
      })
    )
  } catch (err) {
    console.error('Category rows DB error:', err)
  }

  const filledCategoryRows = categoryRows.filter(r => r.articles.length > 0)

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />

      <EbonyNavigation />
      <BreakingBanner articles={breaking} />

      <main className="min-h-screen bg-background">

        {/* ── Cinematic hero ── */}
        <PremiumHero featured={featured} />

        {/* ── Latest Stories + Trending Sidebar ── */}
        <section className="bg-background py-16 lg:py-24">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
            {/* Section header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <div className="eyebrow text-gold mb-3 flex items-center gap-3">
                  <span className="gold-rule" />
                  Latest Stories
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                  What we&rsquo;re publishing now
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xl">
                  Curated entertainment &amp; culture from across the continent and the diaspora.
                </p>
              </div>
              <Link href="/celebrities" className="story-link group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] hover:text-gold-deep shrink-0">
                All stories <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Cards grid */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                {latest.slice(0, 6).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
              {/* Sticky sidebar */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <TrendingSidebar articles={mostRead} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Editor's Quote ── */}
        <EditorQuote />

        {/* ── Category section rails ── */}
        {filledCategoryRows.slice(0, 3).map(row => (
          <section key={row.slug} className="bg-background py-16 lg:py-24 border-t border-border">
            <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 lg:mb-14">
                <div className="max-w-2xl">
                  <div className="eyebrow text-gold mb-3 flex items-center gap-3">
                    <span className="gold-rule" />
                    {row.name}
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                    The {row.name.toLowerCase()} stories
                  </h2>
                </div>
                <Link href={`/${row.slug}`} className="story-link group inline-flex items-center gap-2 shrink-0 text-[12px] font-semibold uppercase tracking-[0.2em] hover:text-gold-deep">
                  See all stories <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {row.articles.slice(0, 3).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── Newsletter conversion ── */}
        <NewsletterSection />

        {/* ── More category rails ── */}
        {filledCategoryRows.slice(3).map(row => (
          <section key={row.slug} className="bg-background py-16 lg:py-24 border-t border-border">
            <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 lg:mb-14">
                <div>
                  <div className="eyebrow text-gold mb-3 flex items-center gap-3">
                    <span className="gold-rule" />
                    {row.name}
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                    {row.name} headlines
                  </h2>
                </div>
                <Link href={`/${row.slug}`} className="story-link group inline-flex items-center gap-2 shrink-0 text-[12px] font-semibold uppercase tracking-[0.2em] hover:text-gold-deep">
                  See all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {row.articles.slice(0, 3).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
            </div>
          </section>
        ))}

      </main>

      <Footer />
      <BackToTop />
      <InstallBanner />
    </>
  )
}
