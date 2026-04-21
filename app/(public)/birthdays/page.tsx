import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { birthdays } from '@/lib/db/schema'

export const metadata: Metadata = {
  title: 'Celebrity Birthdays | Camer360',
  description: 'Upcoming African celebrity birthdays — never miss a chance to celebrate your favourite African stars.',
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getUpcoming(rows: typeof birthdays.$inferSelect[], days = 30) {
  const now  = new Date()
  const year = now.getFullYear()
  return rows
    .map(b => {
      const thisYear = new Date(year,    b.birthMonth - 1, b.birthDay)
      const nextYear = new Date(year + 1, b.birthMonth - 1, b.birthDay)
      const target   = thisYear >= now ? thisYear : nextYear
      const diffMs   = target.getTime() - now.getTime()
      const diffDays = Math.floor(diffMs / 86400000)
      return { ...b, daysUntil: diffDays, nextDate: target }
    })
    .filter(b => b.daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

function getBirthdayThisMonth(rows: typeof birthdays.$inferSelect[]) {
  const m = new Date().getMonth() + 1
  return rows.filter(b => b.birthMonth === m).sort((a, b) => a.birthDay - b.birthDay)
}

export default async function BirthdaysPage() {
  let rows: typeof birthdays.$inferSelect[] = []
  try {
    rows = await db.select().from(birthdays)
  } catch { /* table not yet created */ }

  const upcoming = getUpcoming(rows, 30)
  const thisMonth = getBirthdayThisMonth(rows)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          This Month
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          Celebrity Birthdays 🎂
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '10px', lineHeight: 1.6 }}>
          Upcoming birthdays from your favourite African celebrities — never miss the celebrations.
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🎂</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Birthday tracker launching soon.</p>
        </div>
      ) : (
        <>
          {/* Next 30 days */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                Next 30 Days
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcoming.map(b => (
                  <div key={b.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'white', border: '1px solid var(--border-light)',
                    borderRadius: '12px', padding: '14px 18px',
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, #D4AF37, #F0D060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        🎂
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {b.celebSlug ? (
                        <Link href={`/celebrities/${b.celebSlug}`} style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', textDecoration: 'none' }}>
                          {b.name}
                        </Link>
                      ) : (
                        <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>{b.name}</p>
                      )}
                      <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                        {MONTH_NAMES[b.birthMonth - 1]} {b.birthDay}
                        {b.birthYear ? ` · ${new Date().getFullYear() - b.birthYear} years` : ''}
                        {b.category ? ` · ${b.category}` : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {b.daysUntil === 0 ? (
                        <span style={{ background: '#D4AF37', color: '#1A1A1A', fontSize: '0.68rem', fontWeight: 900, padding: '4px 10px', borderRadius: '20px' }}>
                          🎉 Today!
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                          In {b.daysUntil} day{b.daysUntil !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* This month full list */}
          {thisMonth.length > 0 && (
            <section>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                All of {MONTH_NAMES[new Date().getMonth()]}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {thisMonth.map(b => (
                  <div key={b.id} style={{
                    background: '#F9F7F4', border: '1px solid var(--border-light)',
                    borderRadius: '10px', padding: '10px 14px',
                    fontSize: '0.82rem', color: 'var(--primary-dark)',
                  }}>
                    <span style={{ fontWeight: 700 }}>{b.name}</span>
                    <span style={{ color: '#D4AF37', fontWeight: 900, marginLeft: '8px' }}>{MONTH_NAMES[b.birthMonth - 1]} {b.birthDay}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
