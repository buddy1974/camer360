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
  getBreakingNews,
} from '@/lib/db/queries'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { buildOrganizationSchema } from '@/lib/seo/schema'
import { desc, asc } from 'drizzle-orm'
import { BirthdayCountdown } from '@/components/widgets/BirthdayCountdown'
import { ContinueReading }   from '@/components/user/ReadingHistory'
import type { ArticleWithRelations, Category } from '@/lib/types'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  let featured:       ArticleWithRelations[] = []
  let latest:         ArticleWithRelations[] = []
  let mostRead:       ArticleWithRelations[] = []
  let allCats:        Category[]             = []
  let breaking:       ArticleWithRelations[] = []
  type MusicDrop = typeof musicDrops.$inferSelect
  let drops:          MusicDrop[]            = []
  let chartDrops:     MusicDrop[]            = []

  try {
    ;[featured, latest, mostRead, allCats, breaking] = await Promise.all([
      getFeaturedArticles(7),
      getLatestArticles(18),
      getMostRead(5),
      getAllCategories(),
      getBreakingNews(3),
    ])
  } catch (err) {
    console.error('Homepage DB error:', err)
  }

  try {
    drops = await db.select().from(musicDrops).orderBy(desc(musicDrops.releaseDate)).limit(5)
  } catch { /* table may not exist yet */ }

  try {
    chartDrops = await db.select().from(musicDrops).orderBy(asc(musicDrops.chartPosition)).limit(5)
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

        {/* ── BREAKING NEWS BANNER ── */}
        {breaking.length > 0 && (
          <div style={{ background: '#0D0000', border: '1px solid #3A0000', borderRadius: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/breaking-news" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ background: '#C8102E', color: 'white', fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '3px 8px', borderRadius: '4px' }}>
                ● Breaking
              </span>
            </Link>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: '20px', flexWrap: 'nowrap' }}>
              {breaking.slice(0, 2).map((b, i) => (
                <Link key={b.id} href={`/${b.category.slug}/${b.slug}`} style={{ textDecoration: 'none', fontSize: '0.82rem', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#EEE' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: i === 0 ? 0 : 1 }}>
                  {b.title}
                </Link>
              ))}
            </div>
            <Link href="/breaking-news" style={{ fontSize: '0.65rem', color: '#C8102E', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
              More →
            </Link>
          </div>
        )}

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

        {/* ── TRENDING MUSIC STRIP ── always render; shows fallback when DB is empty */}
        <section style={{ background: '#0A0A0A', borderRadius: '16px', padding: '20px 24px', border: '1px solid #1E1E1E' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37' }}>🔥 Trending This Week</span>
            <Link href="/music/afrobeats" style={{ fontSize: '0.6rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full chart →</Link>
          </div>
          {chartDrops.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
              {chartDrops.slice(0, 5).map((drop, i) => (
                <Link key={drop.id} href="/music/afrobeats" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1, background: '#D4AF37', color: '#0A0A0A', fontSize: '0.6rem', fontWeight: 900, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {drop.chartPosition ?? i + 1}
                    </div>
                    {drop.coverUrl ? (
                      <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                        <img src={drop.coverUrl} alt={`${drop.artist} – ${drop.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🎵</div>
                    )}
                    <div style={{ padding: '10px 12px 12px' }}>
                      <p style={{ margin: 0, fontWeight: 800, color: '#EEE', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.artist}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ flex: 1, minWidth: '120px', background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#D4AF37', opacity: 0.3 }}>{String(n).padStart(2, '0')}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '10px', background: '#2A2A2A', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ height: '8px', background: '#1E1E1E', borderRadius: '4px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
            {/* MODULE A — Spotify embed */}
            <div className="bg-[#101010] border border-[#1E1E1E] rounded-xl p-4" style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '10px' }}>Listen Now</div>
              <iframe
                style={{ borderRadius: '8px' }}
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0"
                width="100%"
                height="152"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
              <a href="https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '8px', fontSize: '0.62rem', color: '#1DB954', fontWeight: 700, textDecoration: 'none' }}>
                Full playlist on Spotify →
              </a>
            </div>

            {/* MODULE B — Latest Drop */}
            {drops[0] && (
              <div className="bg-[#101010] border border-[#1E1E1E] rounded-xl p-4" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '10px' }}>Latest Drop</div>
                {drops[0].coverUrl ? (
                  <img src={drops[0].coverUrl} alt={drops[0].title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} loading="lazy" />
                ) : (
                  <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '10px' }}>🎵</div>
                )}
                <p style={{ margin: '0 0 2px', fontWeight: 800, color: '#EEE', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drops[0].title}</p>
                <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: '#888' }}>{drops[0].artist}</p>
                <Link href="/music/videos" style={{ fontSize: '0.62rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Watch Now →</Link>
              </div>
            )}

            {/* MODULE C — Chart Snapshot */}
            {chartDrops.length > 0 && (
              <div className="bg-[#101010] border border-[#1E1E1E] rounded-xl p-4" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '10px' }}>Afrobeats Chart</div>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {chartDrops.slice(0, 5).map((drop, i) => (
                    <li key={drop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: i < chartDrops.slice(0, 5).length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: '#D4AF37', width: '22px', flexShrink: 0, textAlign: 'center' }}>{drop.chartPosition ?? i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#EEE', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.title}</p>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#888' }}>{drop.artist}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link href="/music/afrobeats" style={{ display: 'block', marginTop: '10px', fontSize: '0.62rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>See full chart →</Link>
              </div>
            )}

            <BirthdayCountdown />
            <ContinueReading />

            {/* MODULE D — Newsletter capture */}
            <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-4" style={{ marginTop: '16px' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#EEE', fontSize: '0.85rem' }}>Get the weekly drop</p>
              <SubscribeForm source="sidebar-bottom" />
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
