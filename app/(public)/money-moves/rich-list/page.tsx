import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { richList } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Camer360 African Rich List | Camer360',
  description: "Africa's wealthiest — the definitive ranking of the continent's richest people. Net worth, industries, and movement tracked by Camer360.",
}

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria', ZA: 'South Africa', CM: 'Cameroon', EG: 'Egypt',
  KE: 'Kenya',   GH: 'Ghana',        CI: "Côte d'Ivoire", MA: 'Morocco',
}

function formatWealth(millions: number): string {
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`
  return `$${millions}M`
}

const CHANGE_ICONS: Record<string, string> = {
  up:     '↑',
  down:   '↓',
  stable: '—',
}
const CHANGE_COLORS: Record<string, string> = {
  up:     '#22C55E',
  down:   '#EF4444',
  stable: '#6B7280',
}

export default async function RichListPage() {
  let entries: typeof richList.$inferSelect[] = []
  try {
    entries = await db.select().from(richList).orderBy(asc(richList.rank))
  } catch { /* table may not exist yet */ }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Wealth Rankings
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05, marginBottom: '12px' }}>
          African Rich List
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '500px' }}>
          The definitive ranking of Africa&rsquo;s wealthiest individuals — net worth, industry, and movement tracked and updated by the Camer360 team.
        </p>
      </div>

      {entries.length === 0 ? (
        <div style={{
          background: '#F9F7F4', border: '1px solid var(--border-light)',
          borderRadius: '16px', padding: '64px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>💰</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Rich list loading — check back soon.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 60px',
            gap: '0', padding: '0 20px 12px',
            fontSize: '0.6rem', fontWeight: 900, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            <span>#</span>
            <span>Name</span>
            <span>Net Worth</span>
            <span>Country</span>
            <span>Trend</span>
          </div>

          {entries.map((person, i) => (
            <div key={person.id} style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 120px 80px 60px',
              gap: '0',
              padding: '16px 20px',
              background: i % 2 === 0 ? 'white' : '#FAFAF9',
              borderBottom: '1px solid var(--border-light)',
              alignItems: 'center',
              ...(i === 0 && { borderRadius: '12px 12px 0 0', borderTop: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }),
              ...(i === entries.length - 1 && { borderRadius: '0 0 12px 12px', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }),
              ...(i > 0 && i < entries.length - 1 && { borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }),
            }}>

              {/* Rank */}
              <span style={{
                fontSize: person.rank <= 3 ? '1.1rem' : '0.9rem',
                fontWeight: 900,
                color: person.rank === 1 ? '#D4AF37' : person.rank === 2 ? '#C0C0C0' : person.rank === 3 ? '#CD7F32' : '#9CA3AF',
              }}>
                {person.rank <= 3 ? ['🥇','🥈','🥉'][person.rank - 1] : `#${person.rank}`}
              </span>

              {/* Name + industry */}
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0, lineHeight: 1.2 }}>
                  {person.name}
                </p>
                {person.industry && (
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                    {person.industry}
                  </p>
                )}
              </div>

              {/* Net worth */}
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#D4AF37' }}>
                {formatWealth(person.netWorthM)}
              </span>

              {/* Country */}
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                {COUNTRY_NAMES[person.country] ?? person.country}
              </span>

              {/* Trend */}
              <span style={{
                fontSize: '0.88rem', fontWeight: 900,
                color: CHANGE_COLORS[person.changeDir ?? 'stable'],
              }}>
                {CHANGE_ICONS[person.changeDir ?? 'stable']}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '32px', padding: '16px 20px', background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.72rem', color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#6B7280' }}>Methodology:</strong> Net worth estimates sourced from public reports, Forbes Africa, and Camer360 editorial research. Figures are approximate and updated periodically.
          {' '}<Link href="/contact" style={{ color: '#D4AF37', textDecoration: 'none' }}>Submit a correction →</Link>
        </p>
      </div>

    </div>
  )
}
