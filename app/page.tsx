export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingBanner } from '@/components/article/BreakingBanner'
import { ArticleCard } from '@/components/article/ArticleCard'
import InstallBanner from '@/components/pwa/InstallBanner'
import SubscribeForm from '@/components/newsletter/SubscribeForm'
import { JsonLd } from '@/components/seo/JsonLd'
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
      getMostRead(5),
      getAllCategories(),
      getBreakingNews(5),
    ])
  } catch (err) {
    console.error('Homepage DB error:', err)
  }

  const targetSlugs = ['celebrities', 'music', 'gossip', 'viral', 'film-tv', 'fashion-beauty']
  const availableSlugs = targetSlugs.filter(s => allCats.some(c => c.slug === s))

  let categoryRows: { slug: string; name: string; articles: ArticleWithRelations[] }[] = []
  try {
    categoryRows = await Promise.all(
      availableSlugs.slice(0, 4).map(async slug => {
        const cat = allCats.find(c => c.slug === slug)!
        const { articles: arts } = await getArticlesByCategory(cat.slug, 1, 4)
        return { slug: cat.slug, name: cat.name, articles: arts }
      })
    )
  } catch (err) {
    console.error('Category rows DB error:', err)
  }

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <BreakingBanner articles={breaking} />
      <Header />
      <main className="min-h-screen w-full">
        <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 24px' }}>

          <div style={{
            paddingTop: '24px',
            paddingBottom: '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>

            {/* ── HERO SECTION ── */}
            {featured[0] && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                alignItems: 'stretch',
              }}>
                <ArticleCard article={featured[0]} variant="hero" priority />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                  {featured.slice(1, 3).map(a => (
                    <div key={a.id} style={{ flex: 1, minHeight: 0 }}>
                      <ArticleCard article={a} variant="featured" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── APP INSTALL BANNER ── */}
            <InstallBanner />

            {/* ── LATEST STORIES + SIDEBAR ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '32px',
              alignItems: 'start',
            }}>
              <div>
                <div className="section-head">
                  <span className="section-head-title">Latest Stories</span>
                  <span className="section-head-line" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  {latest.slice(0, 9).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>

              <aside>
                <div style={{ marginBottom: '16px' }}>
                  <SubscribeForm source="homepage" />
                </div>
                {latest.slice(0, 7).length > 0 && (
                  <div className="bg-[#101010] border border-[#1E1E1E] rounded-xl p-5" style={{ marginBottom: '16px' }}>
                    <div className="section-head">
                      <span className="section-head-title" style={{ color: '#E91E8C' }}>Latest</span>
                      <span className="section-head-line" />
                    </div>
                    {latest.slice(0, 7).map((a, i) => (
                      <ArticleCard key={a.id} article={a} variant="list" index={i} />
                    ))}
                  </div>
                )}
                <div className="bg-[#101010] border border-[#1E1E1E] rounded-xl p-5">
                  <div className="section-head">
                    <span className="section-head-title" style={{ color: '#E91E8C' }}>Trending</span>
                    <span className="section-head-line" />
                  </div>
                  {mostRead.map((a, i) => (
                    <ArticleCard key={a.id} article={a} variant="list" index={i} />
                  ))}
                </div>
              </aside>
            </div>

            {/* ── CATEGORY SECTIONS ── */}
            {categoryRows.map(row => row.articles.length > 0 && (
              <section key={row.slug}>
                <div className="section-head">
                  <span className="section-head-title">{row.name}</span>
                  <span className="section-head-line" />
                  <Link
                    href={`/${row.slug}`}
                    className="text-[0.62rem] font-bold uppercase tracking-wider text-[#E91E8C] hover:text-[#DC2626] transition-colors whitespace-nowrap"
                  >
                    See all →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {row.articles.map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            ))}

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
