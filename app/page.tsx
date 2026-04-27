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
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { buildOrganizationSchema } from '@/lib/seo/schema'
import { asc } from 'drizzle-orm'
import type { ArticleWithRelations, Category } from '@/lib/types'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  type MusicDrop = typeof musicDrops.$inferSelect
  let featured:    ArticleWithRelations[] = []
  let latest:      ArticleWithRelations[] = []
  let mostRead:    ArticleWithRelations[] = []
  let allCats:     Category[]             = []
  let breaking:    Awaited<ReturnType<typeof getBreakingNews>> = []
  let chartDrops:  MusicDrop[]            = []

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

  try {
    chartDrops = await db.select().from(musicDrops).orderBy(asc(musicDrops.chartPosition)).limit(4)
  } catch { /* table may not exist yet */ }

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
        <section className="bg-background" style={{ paddingTop: '64px', paddingBottom: '64px', overflow: 'visible' }}>
          <div className="page-container">
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

            <div className="latest-stories-grid">
              {/* Cards: 2-col grid */}
              <div className="cards-grid-2">
                {latest.slice(0, 6).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
              {/* Trending sidebar + music modules — sticky */}
              <div className="hidden lg:block">
                <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <TrendingSidebar articles={mostRead} />

                  {/* MODULE 1 — Spotify Afrobeats embed */}
                  <div style={{ border: '1px solid hsl(30 12% 88%)', background: '#ffffff', padding: '20px', boxShadow: '0 10px 30px -10px hsla(20,14%,4%,0.1)' }}>
                    <div className="eyebrow text-gold-deep mb-3" style={{ fontSize: '9px' }}>Listen Now</div>
                    <iframe
                      style={{ borderRadius: '8px' }}
                      src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0"
                      width="100%"
                      height="352"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                    <a
                      href="https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', marginTop: '10px', fontSize: '12px', fontWeight: 600, color: '#1DB954', textDecoration: 'none' }}
                    >
                      Open full playlist →
                    </a>
                  </div>

                  {/* MODULE 2 — Afrobeats Chart top 4 */}
                  {chartDrops.length > 0 && (
                    <div style={{ border: '1px solid hsl(30 12% 88%)', background: '#ffffff', padding: '20px', boxShadow: '0 10px 30px -10px hsla(20,14%,4%,0.1)' }}>
                      <div className="eyebrow text-gold-deep mb-4" style={{ fontSize: '9px' }}>Afrobeats Chart</div>
                      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {chartDrops.map((drop, i) => (
                          <li key={drop.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < chartDrops.length - 1 ? '1px solid hsl(30 12% 88%)' : 'none' }}>
                            <span className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'hsl(var(--gold) / 0.7)', width: '30px', flexShrink: 0, lineHeight: 1 }}>
                              {(drop.chartPosition ?? i + 1).toString().padStart(2, '0')}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'hsl(20 14% 8%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.title}</p>
                              <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.artist}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <Link href="/music/afrobeats" style={{ display: 'block', marginTop: '12px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--gold-deep))', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Full chart →
                      </Link>
                    </div>
                  )}

                  {/* MODULE 3 — Latest Videos (music articles) */}
                  {categoryRows.find(r => r.slug === 'music')?.articles.slice(0, 3).length ? (
                    <div style={{ border: '1px solid hsl(30 12% 88%)', background: '#ffffff', padding: '20px', boxShadow: '0 10px 30px -10px hsla(20,14%,4%,0.1)' }}>
                      <div className="eyebrow text-gold-deep mb-4" style={{ fontSize: '9px' }}>Latest Videos</div>
                      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {categoryRows.find(r => r.slug === 'music')!.articles.slice(0, 3).map((a, i) => (
                          <li key={a.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < 2 ? '1px solid hsl(30 12% 88%)' : 'none', alignItems: 'flex-start' }}>
                            {a.featuredImage ? (
                              <img src={a.featuredImage} alt={a.title} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} loading="lazy" />
                            ) : (
                              <div style={{ width: '52px', height: '52px', borderRadius: '6px', background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🎵</div>
                            )}
                            <Link href={`/${a.category.slug}/${a.slug}`} style={{ flex: 1, textDecoration: 'none', fontSize: '13px', fontWeight: 500, color: 'hsl(20 14% 8%)', lineHeight: 1.4 }} className="group-hover:text-gold-deep">
                              {a.title}
                            </Link>
                          </li>
                        ))}
                      </ol>
                      <Link href="/music/videos" style={{ display: 'block', marginTop: '12px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--gold-deep))', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        All videos →
                      </Link>
                    </div>
                  ) : null}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Editor's Quote ── */}
        <EditorQuote />

        {/* ── Category section rails ── */}
        {filledCategoryRows.slice(0, 3).map(row => (
          <section key={row.slug} className="bg-background border-t border-border" style={{ paddingTop: '64px', paddingBottom: '64px', overflow: 'visible' }}>
            <div className="page-container">
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
              <div className="cards-grid-3">
                {row.articles.slice(0, 3).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── Newsletter conversion (80px top + bottom breathing room) ── */}
        <div style={{ marginTop: '80px', marginBottom: '80px' }}>
          <NewsletterSection />
        </div>

        {/* ── More category rails ── */}
        {filledCategoryRows.slice(3).map(row => (
          <section key={row.slug} className="bg-background border-t border-border" style={{ paddingTop: '64px', paddingBottom: '64px', overflow: 'visible' }}>
            <div className="page-container">
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
              <div className="cards-grid-3">
                {row.articles.slice(0, 3).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Bottom buffer before footer */}
        <div style={{ height: '32px' }} />

      </main>

      <Footer />
      <BackToTop />
      <InstallBanner />
    </>
  )
}
