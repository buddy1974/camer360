export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/article/ArticleCard'
import { getBreakingNews, getLatestArticles } from '@/lib/db/queries'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title:       `Breaking News | ${SITE_NAME}`,
  description: `Latest breaking celebrity news, urgent stories and developing situations from across Africa and Cameroon — updated in real time.`,
  alternates:  { canonical: `${SITE_URL}/breaking-news` },
}

export default async function BreakingNewsPage() {
  const [breaking, latest] = await Promise.all([
    getBreakingNews(20),
    getLatestArticles(6),
  ])

  const hasBreaking = breaking.length > 0

  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: '#0D0000', borderBottom: '2px solid #C8102E', padding: '40px 40px 36px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#C8102E' }}>Breaking News</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <span style={{ background: '#C8102E', color: 'white', fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px', borderRadius: '4px', animation: 'pulse 2s infinite' }}>
              ● LIVE
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
              Breaking News
            </h1>
          </div>
          <p style={{ color: '#555', fontSize: '0.82rem', margin: 0 }}>
            Developing stories and urgent celebrity news — Camer360 newsroom
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px' }}>

        {hasBreaking ? (
          <>
            {/* Lead story */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#C8102E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Breaking
                </span>
                <div style={{ flex: 1, height: '1px', background: '#1E0000' }} />
                <span style={{ fontSize: '0.65rem', color: '#444' }}>
                  {formatDate(breaking[0].publishedAt!)}
                </span>
              </div>
              <ArticleCard article={breaking[0]} variant="hero" priority />
            </div>

            {/* Remaining breaking stories */}
            {breaking.length > 1 && (
              <>
                <h2 style={{ fontSize: '0.72rem', fontWeight: 900, color: '#C8102E', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px' }}>
                  Also Breaking
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '56px' }}>
                  {breaking.slice(1).map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '64px', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📡</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>No breaking stories right now — check back soon.</p>
          </div>
        )}

        {/* Latest news below */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '28px' }}>
            Latest Stories
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {latest.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>

      </div>
    </div>
  )
}
