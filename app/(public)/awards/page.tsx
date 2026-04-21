import type { Metadata } from 'next'
import { db } from '@/lib/db/client'
import { awards } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'African Music & Entertainment Awards | Camer360',
  description: 'Track African awards seasons — AFRIMA, Channel O Music Video Awards, and more. Winners, nominees, and upcoming ceremonies covered by Camer360.',
}

const STATUS_BADGE = {
  upcoming:   { label: 'Upcoming', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  announced:  { label: 'Announced', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  closed:     { label: 'Closed', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
}

export default async function AwardsPage() {
  let rows: typeof awards.$inferSelect[] = []
  let awardShows: string[] = []
  try {
    rows = await db.select().from(awards).orderBy(desc(awards.year), desc(awards.ceremonyDate))
    awardShows = [...new Set(rows.map(r => r.awardShow))]
  } catch { /* table not yet created */ }

  const currentYear = new Date().getFullYear()
  const upcoming    = rows.filter(r => r.status === 'upcoming')
  const announced   = rows.filter(r => r.status === 'announced')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Awards Season
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          African Awards Tracker
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '10px', lineHeight: 1.6 }}>
          AFRIMA, Channel O, and every major African entertainment award — nominees, winners, and dates, all in one place.
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🏆</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Awards tracker launching soon for the {currentYear} season.</p>
        </div>
      ) : (
        <>
          {/* Upcoming ceremonies */}
          {upcoming.length > 0 && (
            <AwardsSection title="Upcoming Ceremonies 📅" rows={upcoming} />
          )}

          {/* Announced winners */}
          {announced.length > 0 && (
            <AwardsSection title="Announced Winners 🏆" rows={announced} />
          )}

          {/* By show */}
          {awardShows.map(show => {
            const showRows = rows.filter(r => r.awardShow === show && r.status === 'closed')
            if (showRows.length === 0) return null
            return <AwardsSection key={show} title={show} rows={showRows} closed />
          })}
        </>
      )}
    </div>
  )
}

function AwardsSection({ title, rows, closed = false }: {
  title: string
  rows: typeof awards.$inferSelect[]
  closed?: boolean
}) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rows.map(award => {
          const badge  = STATUS_BADGE[award.status ?? 'upcoming']
          const noms   = award.nominees ? award.nominees.split(',').map(s => s.trim()).filter(Boolean) : []
          return (
            <div key={award.id} style={{
              background: 'white', border: '1px solid var(--border-light)',
              borderRadius: '12px', padding: '16px 20px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      background: badge.bg, color: badge.color,
                      fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px',
                      borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
                      {award.awardShow} {award.year}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                    {award.category}
                  </p>
                  {award.ceremonyDate && (
                    <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                      🗓 {new Date(award.ceremonyDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {award.winner && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Winner</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#D4AF37', margin: 0 }}>🏆 {award.winner}</p>
                  </div>
                )}
              </div>
              {noms.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '0.62rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Nominees
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {noms.map(n => (
                      <span key={n} style={{
                        background: '#F9F7F4', border: '1px solid var(--border-light)',
                        color: n === award.winner ? '#D4AF37' : '#6B7280',
                        fontWeight: n === award.winner ? 700 : 400,
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '0.72rem',
                      }}>
                        {n === award.winner ? '🏆 ' : ''}{n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
