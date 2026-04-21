import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Entertainment Archives | Camer360',
  description: 'Browse Camer360\'s complete archive of African entertainment stories, year by year.',
}

export default async function ArchivesPage() {
  let years: { year: number; count: number }[] = []
  try {
    const rows = await db
      .select({
        year:  sql<number>`YEAR(${articles.publishedAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .groupBy(sql`YEAR(${articles.publishedAt})`)
      .orderBy(sql`YEAR(${articles.publishedAt}) DESC`)
    years = rows.map(r => ({ year: Number(r.year), count: Number(r.count) })).filter(r => r.year > 2000)
  } catch { /* no published articles yet */ }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Year in Entertainment
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          Archives
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '10px', lineHeight: 1.6 }}>
          Every story Camer360 has covered — browse by year.
        </p>
      </div>

      {years.length === 0 ? (
        <div style={{ background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Archives coming soon.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {years.map(({ year, count }) => (
            <Link key={year} href={`/archives/${year}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'white', border: '1px solid var(--border-light)',
                borderRadius: '12px', padding: '20px 24px',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.15s',
              }}
                className="hover:border-[#D4AF37]"
              >
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-dark)', margin: 0, lineHeight: 1 }}>
                    {year}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '4px 0 0' }}>
                    Year in African Entertainment
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#D4AF37', margin: 0 }}>
                    {count.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                    stories
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
