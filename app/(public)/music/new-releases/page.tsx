import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'New Music Releases | Camer360',
  description: "The freshest African music drops — Afrobeats, Makossa, Bikutsi and more. Weekly new releases from Cameroon and across the continent.",
}

const TYPE_LABELS: Record<string, string> = {
  single:   'Single',
  EP:       'EP',
  album:    'Album',
  mixtape:  'Mixtape',
}

const TYPE_COLORS: Record<string, string> = {
  single:  '#D4AF37',
  EP:      '#E91E8C',
  album:   '#2196F3',
  mixtape: '#9C27B0',
}

function formatReleaseDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return d }
}

export default async function NewReleasesPage() {
  let drops: typeof musicDrops.$inferSelect[] = []
  try {
    drops = await db.select().from(musicDrops).orderBy(desc(musicDrops.releaseDate))
  } catch { /* table may not exist yet */ }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          This Week
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          New Releases
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '10px', maxWidth: '500px', lineHeight: 1.6 }}>
          The freshest drops from Cameroon and across Africa — Afrobeats, Makossa, Bikutsi, Afro-pop and more.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Link href="/music" style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37',
            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            ← All Music Stories
          </Link>
        </div>
      </div>

      {drops.length === 0 ? (
        <div style={{
          background: '#0A0A0A', border: '1px solid #1E1E1E',
          borderRadius: '16px', padding: '64px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🎵</p>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            New releases tracker launching soon — check back weekly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drops.map(drop => (
            <div key={drop.id} style={{
              background: '#0A0A0A', border: '1px solid #1E1E1E',
              borderRadius: '16px', overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: drop.coverUrl ? '100px 1fr' : '1fr',
              transition: 'border-color 0.15s',
            }}
              className="hover:border-[#D4AF37]"
            >
              {/* Cover art */}
              {drop.coverUrl && (
                <img
                  src={drop.coverUrl}
                  alt={`${drop.artist} - ${drop.title}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              )}

              {/* Info */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: TYPE_COLORS[drop.type ?? 'single'] ?? '#D4AF37',
                    color: '#fff', fontSize: '0.6rem', fontWeight: 900,
                    padding: '2px 8px', borderRadius: '4px',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {TYPE_LABELS[drop.type ?? 'single'] ?? drop.type}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {formatReleaseDate(String(drop.releaseDate))}
                  </span>
                  {drop.country && (
                    <span style={{
                      background: '#1A1A1A', border: '1px solid #2A2A2A',
                      color: '#666', padding: '2px 8px', borderRadius: '4px',
                      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      {drop.country}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#EEE', margin: 0, lineHeight: 1.2 }}>
                    {drop.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#D4AF37', fontWeight: 700, margin: '2px 0 0' }}>
                    {drop.artist}
                  </p>
                </div>

                {drop.description && (
                  <p style={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.5, margin: 0 }}>
                    {drop.description}
                  </p>
                )}

                {drop.streamUrl && (
                  <a
                    href={drop.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                      color: '#D4AF37', padding: '6px 14px', borderRadius: '20px',
                      fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                      width: 'fit-content', marginTop: '4px',
                    }}
                  >
                    ▶ Stream Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
