import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { asc, desc, isNotNull } from 'drizzle-orm'
import { StreamingLinks } from '@/components/music/StreamingLinks'

export const revalidate = 3600 // re-fetch every hour

export const metadata: Metadata = {
  title: 'Top Afrobeats Chart 2026 | Camer360',
  description: 'This week\'s top Afrobeats hits — Cameroon, Nigeria, Ghana and across Africa. Updated weekly.',
  openGraph: {
    title:       'Top Afrobeats Chart 2026 | Camer360',
    description: 'Weekly African music chart — the hottest Afrobeats, Makossa, Bikutsi and Afropop right now.',
  },
}

const TYPE_COLOR: Record<string, string> = {
  single: '#22C55E', EP: '#E91E8C', album: '#D4AF37', mixtape: '#3B82F6',
}

const COUNTRY_FLAG: Record<string, string> = {
  CM: '🇨🇲', NG: '🇳🇬', GH: '🇬🇭', SN: '🇸🇳', CI: '🇨🇮',
  TZ: '🇹🇿', KE: '🇰🇪', ZA: '🇿🇦', CD: '🇨🇩', AO: '🇦🇴',
}

function formatDate(d: string | Date): string {
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return String(d) }
}

export default async function AfrobeatsChartPage() {
  // Chart: ranked entries first, then remaining by release date
  let chart:  typeof musicDrops.$inferSelect[] = []
  let recent: typeof musicDrops.$inferSelect[] = []

  try {
    chart  = await db.select().from(musicDrops)
      .where(isNotNull(musicDrops.chartPosition))
      .orderBy(asc(musicDrops.chartPosition))
      .limit(20)

    recent = await db.select().from(musicDrops)
      .orderBy(desc(musicDrops.releaseDate))
      .limit(12)
  } catch { /* table may not exist */ }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '3px 12px' }}>
            Weekly Chart
          </span>
          <span style={{ fontSize: '0.6rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Updated every Monday
          </span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 12px', lineHeight: 1.05 }}>
          🔥 Top Afrobeats
        </h1>
        <p style={{ color: '#777', fontSize: '0.88rem', maxWidth: '540px', lineHeight: 1.7, margin: 0 }}>
          The hottest tracks from Cameroon, Nigeria, Ghana and across the continent — Afrobeats, Makossa, Bikutsi and Afropop.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
          <Link href="/music/new-releases" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            New Releases →
          </Link>
          <Link href="/music" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Music Stories →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>

        {/* ── Left: Chart ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
              Chart Rankings
            </h2>
          </div>

          {chart.length === 0 ? (
            <div style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>🎵</p>
              <p style={{ color: '#555', fontSize: '0.88rem' }}>Chart loading...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {chart.map((drop, idx) => {
                const pos   = drop.chartPosition ?? idx + 1
                const color = TYPE_COLOR[drop.type ?? 'single'] ?? '#888'
                const flag  = COUNTRY_FLAG[drop.country ?? ''] ?? ''
                return (
                  <div
                    key={drop.id}
                    style={{
                      display:       'grid',
                      gridTemplateColumns: '44px 80px 1fr auto',
                      gap:           '12px',
                      alignItems:    'center',
                      background:    pos <= 3 ? 'rgba(212,175,55,0.04)' : '#0A0A0A',
                      border:        `1px solid ${pos <= 3 ? 'rgba(212,175,55,0.15)' : '#1A1A1A'}`,
                      borderRadius:  '10px',
                      padding:       '12px 14px',
                      transition:    'border-color 0.15s',
                    }}
                  >
                    {/* Position */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize:   pos <= 3 ? '1.2rem' : '1rem',
                        fontWeight: 900,
                        color:      pos === 1 ? '#D4AF37' : pos === 2 ? '#9CA3AF' : pos === 3 ? '#CD7F32' : '#333',
                      }}>
                        {pos <= 3 ? ['🥇','🥈','🥉'][pos - 1] : pos}
                      </span>
                    </div>

                    {/* Cover */}
                    <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                      {drop.coverUrl ? (
                        <img
                          src={drop.coverUrl}
                          alt={`${drop.artist} – ${drop.title}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%', borderRadius: '6px',
                          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', border: `1px solid ${color}20`,
                        }}>
                          🎵
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 900, color,
                          background: `${color}18`, border: `1px solid ${color}30`,
                          borderRadius: '4px', padding: '1px 6px', textTransform: 'uppercase',
                        }}>
                          {drop.type ?? 'single'}
                        </span>
                        {flag && <span style={{ fontSize: '0.9rem' }}>{flag}</span>}
                      </div>
                      <p style={{ margin: 0, fontWeight: 800, color: '#EEE', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {drop.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {drop.artist}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: '#444' }}>
                        {formatDate(drop.releaseDate)}
                      </p>
                    </div>

                    {/* Streaming links */}
                    <StreamingLinks
                      links={{
                        stream_url:    drop.streamUrl,
                        apple_url:     drop.appleUrl,
                        youtube_url:   drop.youtubeUrl,
                        audiomack_url: drop.audiomackUrl,
                        boomplay_url:  drop.boomplayUrl,
                      }}
                      compact
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '80px' }}>

          {/* Spotify Playlist Embed — African Heat (no API key needed) */}
          <div style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#1DB954', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                🎧 Spotify • African Heat
              </span>
            </div>
            <iframe
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DWYkaDif7Ztbp?utm_source=generator&theme=0"
              width="100%"
              height="380"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 'none', display: 'block' }}
            />
          </div>

          {/* Afrobeats playlist */}
          <div style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 0' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#1DB954', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                🎧 Spotify • Afro Party Anthems
              </span>
            </div>
            <iframe
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DWYmnD6RNZB8Y?utm_source=generator&theme=0"
              width="100%"
              height="380"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 'none', display: 'block' }}
            />
          </div>

          {/* New Releases section */}
          {recent.length > 0 && (
            <div style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '16px', padding: '16px' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 14px' }}>
                Latest Drops
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recent.slice(0, 6).map(drop => (
                  <div key={drop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: '#111' }}>
                      {drop.coverUrl
                        ? <img src={drop.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎵</div>
                      }
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#DDD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.title}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.artist}</p>
                    </div>
                    {drop.streamUrl && (
                      <a href={drop.streamUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#1DB954', textDecoration: 'none', fontWeight: 700, flexShrink: 0 }}>
                        ▶
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/music/new-releases" style={{ display: 'block', marginTop: '14px', fontSize: '0.65rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                All New Releases →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
