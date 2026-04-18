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

const CAT_NAV = [
  { slug: 'celebrities',    name: 'Celebrities' },
  { slug: 'music',          name: 'Music' },
  { slug: 'film-tv',        name: 'Film & TV' },
  { slug: 'fashion-beauty', name: 'Style' },
  { slug: 'gossip',         name: 'Gossip' },
  { slug: 'viral',          name: 'Viral' },
  { slug: 'diaspora',       name: 'Diaspora' },
  { slug: 'money-moves',    name: 'Entrepreneurs' },
  { slug: 'sport-stars',    name: 'Sport Stars' },
  { slug: 'influencers',    name: 'Influencers' },
  { slug: 'real-talk',      name: 'Real Talk' },
  { slug: 'exposed',        name: 'Exposed' },
]

export default async function HomePage() {
  let featured: ArticleWithRelations[] = []
  let latest:   ArticleWithRelations[] = []
  let mostRead: ArticleWithRelations[] = []
  let allCats:  Category[]             = []
  let breaking: Awaited<ReturnType<typeof getBreakingNews>> = []

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

      {/* ── CATEGORY NAV STRIP ── */}
      <nav style={{
        background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        <div style={{
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'stretch',
        }}>
          {CAT_NAV.map(cat => (
            <Link key={cat.slug} href={`/${cat.slug}`} className="cat-nav-link">
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── PAGE BODY — dark cinematic canvas ── */}
      <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>

        {/* ── COVER STORIES ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '36px 24px 40px' }}>

            <div className="ebony-section-label" style={{ marginBottom: '22px' }}>
              <span className="ebony-label-text">Cover Stories</span>
              <span className="ebony-label-line" />
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                CAMER360 MAGAZINE
              </span>
            </div>

            {featured.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr',
                gap: '20px',
                alignItems: 'stretch',
              }}>
                {/* DOMINANT — main cover story */}
                <ArticleCard article={featured[0]} variant="hero" priority />

                {/* SIDEBAR — 3 stacked stories */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
                  {featured.slice(1, 4).map(a => (
                    <div key={a.id} style={{ flex: 1, minHeight: 0 }}>
                      <ArticleCard article={a} variant="featured" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state while pipeline fills up */
              <div style={{
                border: '1px dashed rgba(212,175,55,0.2)',
                borderRadius: '16px',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}>
                <div className="gold-divider" />
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', letterSpacing: '0.08em', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  Cover stories loading via automation pipeline…
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── INSTALL BANNER ── */}
        <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px 24px 0' }}>
          <InstallBanner />
        </div>

        {/* ── LATEST STORIES + SIDEBAR ── */}
        <section>
          <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '44px 24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '44px',
              alignItems: 'start',
            }}>

              {/* MAIN GRID */}
              <div>
                <div className="ebony-section-label" style={{ marginBottom: '22px' }}>
                  <span className="ebony-label-text">Latest Stories</span>
                  <span className="ebony-label-line" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {latest.slice(0, 9).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>

              {/* SIDEBAR */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* SUBSCRIBE */}
                <div className="ebony-glass-card">
                  <SubscribeForm source="homepage" />
                </div>

                {/* TRENDING */}
                {mostRead.length > 0 && (
                  <div className="ebony-glass-card">
                    <div className="ebony-sidebar-head">Trending Now</div>
                    {mostRead.map((a, i) => (
                      <ArticleCard key={a.id} article={a} variant="list" index={i} />
                    ))}
                  </div>
                )}

                {/* JUST IN */}
                {latest.slice(0, 5).length > 0 && (
                  <div className="ebony-glass-card">
                    <div className="ebony-sidebar-head">Just In</div>
                    {latest.slice(0, 5).map((a, i) => (
                      <ArticleCard key={a.id} article={a} variant="list" index={i} />
                    ))}
                  </div>
                )}

              </aside>
            </div>
          </div>
        </section>

        {/* ── GOLD EDITORIAL DIVIDER ── */}
        <div style={{
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '4px', height: '4px', background: '#D4AF37', borderRadius: '50%' }} />
            <div style={{ width: '24px', height: '1px', background: '#D4AF37', opacity: 0.6 }} />
            <div style={{ width: '4px', height: '4px', background: '#D4AF37', borderRadius: '50%' }} />
          </div>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        {/* ── CATEGORY DEEP-DIVES ── */}
        <section>
          <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '44px 24px 64px' }}>
            {categoryRows.map((row, idx) => row.articles.length > 0 && (
              <div key={row.slug} style={{ marginBottom: idx < categoryRows.length - 1 ? '52px' : 0 }}>
                <div className="ebony-section-label" style={{ marginBottom: '22px' }}>
                  <span className="ebony-label-text">{row.name}</span>
                  <span className="ebony-label-line" />
                  <Link
                    href={`/${row.slug}`}
                    style={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#D4AF37',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      opacity: 0.85,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    See All →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {row.articles.map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  )
}
