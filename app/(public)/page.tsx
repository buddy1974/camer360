export const dynamic  = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import AdUnit from '@/components/ads/AdUnit'
import { ArticleCard } from '@/components/article/ArticleCard'
import InstallBanner from '@/components/pwa/InstallBanner'
import SubscribeForm from '@/components/newsletter/SubscribeForm'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  getFeaturedArticles, getLatestArticles,
  getMostRead, getArticlesByCategory, getAllCategories,
} from '@/lib/db/queries'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { buildOrganizationSchema } from '@/lib/seo/schema'
import { desc } from 'drizzle-orm'
import type { ArticleWithRelations, Category } from '@/lib/types'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  let featured:       ArticleWithRelations[] = []
  let latest:         ArticleWithRelations[] = []
  let mostRead:       ArticleWithRelations[] = []
  let allCats:        Category[]             = []
  type MusicDrop = typeof musicDrops.$inferSelect
  let drops:          MusicDrop[]            = []

  try {
    ;[featured, latest, mostRead, allCats] = await Promise.all([
      getFeaturedArticles(7),
      getLatestArticles(18),
      getMostRead(6),
      getAllCategories(),
    ])
  } catch (err) {
    console.error('Homepage DB error:', err)
  }

  try {
    drops = await db.select().from(musicDrops).orderBy(desc(musicDrops.releaseDate)).limit(5)
  } catch { /* table may not exist yet */ }

  const targetSlugs = ['celebrities', 'music', 'film-tv', 'sport-stars', 'influencers', 'entrepreneurs', 'events']
  const availableSlugs = targetSlugs.filter(s => allCats.some(c => c.slug === s))

  let categoryRows: { slug: string; name: string; articles: ArticleWithRelations[] }[] = []
  try {
    categoryRows = await Promise.all(
      availableSlugs.slice(0, 4).map(async slug => {
        const cat = allCats.find(c => c.slug === slug)!
        const { articles: arts } = await getArticlesByCategory(cat.slug, 1, 6)
        return { slug: cat.slug, name: cat.name, articles: arts }
      })
    )
  } catch (err) {
    console.error('Category rows DB error:', err)
  }

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />

      <div style={{
        paddingTop: '24px',
        paddingBottom: '48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>

        {/* ── HERO SECTION ── */}
        {featured[0] && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            alignItems: 'stretch'
          }}>

            {/* LEFT — DOMINANT STORY */}
            <ArticleCard article={featured[0]} variant="hero" priority />

            {/* RIGHT — 2 STACKED STORIES, equal height */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              height: '100%'
            }}>
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

        {/* ── TOP BANNER AD ── */}
        <div className="w-full max-w-[728px] mx-auto my-4">
          <AdUnit slot="9844142257" format="horizontal" />
        </div>

        {/* ── LATEST NEWS + SIDEBAR ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '32px',
          alignItems: 'start'
        }}>

          {/* MAIN — 3-column article grid */}
          <div>
            <div className="section-head">
              <span className="section-head-title">Latest Stories</span>
              <span className="section-head-line" />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {latest.slice(0, 9).map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>

          {/* SIDEBAR — Latest + Most Read */}
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
                <span className="section-head-title" style={{ color: '#D4AF37' }}>Trending</span>
                <span className="section-head-line" />
              </div>
              {mostRead.map((a, i) => (
                <ArticleCard key={a.id} article={a} variant="list" index={i} />
              ))}
            </div>
          </aside>

        </div>

        {/* ── MUSIC DROPS WIDGET ── */}
        {drops.length > 0 && (
          <section>
            <div className="section-head">
              <span className="section-head-title">New Releases</span>
              <span className="section-head-line" />
              <Link
                href="/music/new-releases"
                className="text-[0.62rem] font-bold uppercase tracking-wider text-[#D4AF37] whitespace-nowrap"
              >
                All Releases →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {drops.map(drop => {
                const TYPE_COLOR: Record<string, string> = {
                  album: '#D4AF37', EP: '#E91E8C', single: '#22C55E', mixtape: '#3B82F6',
                }
                const color = TYPE_COLOR[drop.type ?? 'single'] ?? '#888'
                return (
                  <div key={drop.id} style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '12px', overflow: 'hidden' }}>
                    {drop.coverUrl ? (
                      <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                        <img src={drop.coverUrl} alt={`${drop.artist} – ${drop.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        🎵
                      </div>
                    )}
                    <div style={{ padding: '12px' }}>
                      <span style={{ display: 'inline-block', fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: '4px', padding: '2px 6px', marginBottom: '6px' }}>
                        {drop.type ?? 'single'}
                      </span>
                      <p style={{ margin: 0, fontWeight: 800, color: '#EEE', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {drop.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {drop.artist}
                      </p>
                      {drop.streamUrl && (
                        <a href={drop.streamUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.65rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Stream →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px'
            }}>
              {row.articles.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        ))}

      </div>
    </>
  )
}
