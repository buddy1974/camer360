import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { couples } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Celebrity Couples | Camer360',
  description: 'Track African celebrity relationships — who is together, engaged, married, on a break, or split. The definitive African celebrity couple tracker.',
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  dating:   { label: '❤️ Dating',    color: '#fff', bg: '#E91E8C' },
  engaged:  { label: '💍 Engaged',   color: '#1A1A1A', bg: '#D4AF37' },
  married:  { label: '💒 Married',   color: '#fff', bg: '#22C55E' },
  on_break: { label: '⏸ On a Break', color: '#fff', bg: '#F59E0B' },
  split:    { label: '💔 Split',     color: '#fff', bg: '#6B7280' },
  rumoured: { label: '👀 Rumoured',  color: '#fff', bg: '#8B5CF6' },
}

export default async function CouplesPage() {
  let rows: typeof couples.$inferSelect[] = []
  try {
    rows = await db.select().from(couples).orderBy(desc(couples.updatedAt))
  } catch { /* table not yet created */ }

  const active = rows.filter(c => !['split'].includes(c.status ?? ''))
  const split  = rows.filter(c => c.status === 'split')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Relationship Status
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          Celebrity Couples
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '10px', lineHeight: 1.6 }}>
          Who&rsquo;s together, who&rsquo;s engaged, who just split — African celebrity relationship status, tracked and updated by Camer360.
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>💑</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Couple tracker launching soon — check back for the latest relationship news.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                Active
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {active.map(c => <CoupleCard key={c.id} couple={c} />)}
              </div>
            </section>
          )}
          {split.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                Split
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {split.map(c => <CoupleCard key={c.id} couple={c} />)}
              </div>
            </section>
          )}
        </>
      )}

      <div style={{ marginTop: '48px', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center' }}>
        Know about a couple we&rsquo;re missing?{' '}
        <Link href="/contact" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>
          Let us know →
        </Link>
      </div>
    </div>
  )
}

function CoupleCard({ couple }: { couple: typeof couples.$inferSelect }) {
  const style = STATUS_STYLES[couple.status ?? 'dating'] ?? STATUS_STYLES.dating
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {couple.imageUrl && (
        <img src={couple.imageUrl} alt={`${couple.name1} & ${couple.name2}`}
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
      )}
      {!couple.imageUrl && (
        <div style={{ height: '80px', background: 'linear-gradient(135deg, #F9F7F4, #EEE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          💑
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 4px', lineHeight: 1.2 }}>
          {couple.name1} &amp; {couple.name2}
        </h3>
        <span style={{
          display: 'inline-block',
          background: style.bg, color: style.color,
          fontSize: '0.65rem', fontWeight: 800,
          padding: '3px 10px', borderRadius: '20px',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {style.label}
        </span>
        {couple.since && (
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '6px' }}>
            Since {new Date(couple.since).getFullYear()}
          </p>
        )}
        {couple.description && (
          <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '8px', lineHeight: 1.5 }}>
            {couple.description}
          </p>
        )}
      </div>
    </div>
  )
}
