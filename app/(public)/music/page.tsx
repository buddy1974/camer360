import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { asc, desc, isNotNull } from 'drizzle-orm'
import { ArticleCard } from '@/components/article/ArticleCard'
import { getArticlesByCategory } from '@/lib/db/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Music | Camer360 — African Music, Afrobeats & Videos',
  description: 'African music coverage: Afrobeats charts, music videos, new releases, and the latest from Cameroon, Nigeria, Ghana and across the continent.',
}

const MUSIC_SECTIONS = [
  { href: '/music/afrobeats',    label: 'Afrobeats Chart',  icon: '🏆', desc: 'Weekly top 20' },
  { href: '/music/videos',       label: 'Music Videos',     icon: '▶️', desc: 'Trending on YouTube' },
  { href: '/music/new-releases', label: 'New Releases',     icon: '🎵', desc: 'Latest drops' },
]

export default async function MusicHubPage() {
  let topChart: typeof musicDrops.$inferSelect[] = []
  let recentDrops: typeof musicDrops.$inferSelect[] = []
  let articles: Awaited<ReturnType<typeof getArticlesByCategory>>['articles'] = []

  try {
    topChart = await db.select().from(musicDrops)
      .where(isNotNull(musicDrops.chartPosition))
      .orderBy(asc(musicDrops.chartPosition))
      .limit(5)

    recentDrops = await db.select().from(musicDrops)
      .orderBy(desc(musicDrops.releaseDate))
      .limit(6)
  } catch { /* table not yet created */ }

  try {
    const result = await getArticlesByCategory('music', 1, 6)
    articles = result.articles
  } catch { /* db error */ }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '48px' }}>
        <div className="eyebrow text-gold mb-3 flex items-center gap-3">
          <span className="gold-rule" />
          Music
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'hsl(20 14% 8%)', lineHeight: 1.05, marginBottom: '12px' }}>
          African Music &amp; Culture
        </h1>
        <p style={{ color: 'hsl(20 10% 40%)', fontSize: '1.05rem' }}>
          Afrobeats, Makossa, Bikutsi and every sound Africa is making right now.
        </p>
      </div>

      {/* ── Section nav cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '56px' }}>
        {MUSIC_SECTIONS.map(s => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="music-section-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
              <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(20 14% 8%)', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: 'hsl(20 10% 45%)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Top 5 chart (if data exists) ── */}
      {topChart.length > 0 && (
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="eyebrow text-gold flex items-center gap-3">
              <span className="gold-rule" /> Afrobeats Top 5
            </div>
            <Link href="/music/afrobeats" className="story-link" style={{ fontSize: '12px', color: 'hsl(var(--gold))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
              Full Chart →
            </Link>
          </div>
          <div style={{ border: '1px solid hsl(30 12% 88%)', borderRadius: '8px', overflow: 'hidden' }}>
            {topChart.map((drop, i) => (
              <div key={drop.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < topChart.length - 1 ? '1px solid hsl(30 12% 88%)' : 'none', background: i % 2 === 0 ? 'white' : 'hsl(40 33% 98%)' }}>
                <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--gold))', width: '28px', flexShrink: 0 }}>
                  {i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : String(drop.chartPosition ?? i + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'hsl(20 14% 8%)', fontSize: '14px' }}>{drop.artist}</div>
                  <div style={{ color: 'hsl(20 10% 40%)', fontSize: '13px' }}>{drop.title}</div>
                </div>
                <span style={{ fontSize: '11px', color: 'hsl(20 10% 55%)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>{drop.country}</span>
                {drop.streamUrl && (
                  <a href={drop.streamUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'hsl(var(--gold))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', flexShrink: 0 }}>
                    Stream →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spotify editorial playlists */}
      <div style={{ marginBottom: '56px' }}>
        <div className="eyebrow text-gold mb-5 flex items-center gap-3">
          <span className="gold-rule" /> Featured Playlists
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <iframe
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DWYkaDif7Ztbp"
            width="100%" height="152" frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" style={{ borderRadius: '8px', display: 'block' }}
            title="African Heat playlist"
          />
          <iframe
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DWYmnD6RNZB8Y"
            width="100%" height="152" frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" style={{ borderRadius: '8px', display: 'block' }}
            title="Afro Party Anthems playlist"
          />
        </div>
      </div>

      {/* Latest music articles */}
      {articles.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="eyebrow text-gold flex items-center gap-3">
              <span className="gold-rule" /> Latest Music News
            </div>
            <Link href="/music" className="story-link" style={{ fontSize: '12px', color: 'hsl(var(--gold))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
              All Stories →
            </Link>
          </div>
          <div className="cards-grid-3">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} variant="editorial" index={i} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
