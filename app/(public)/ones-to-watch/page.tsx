import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/db/queries'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Ones to Watch | Camer360',
  description: "Camer360's editorial predictions — the rising stars of African entertainment we're betting on. Monthly picks from our cultural tastemakers.",
}

export default async function OnestoWatchPage() {
  const { articles } = await getArticlesByCategory('ones-to-watch', 1, 20)

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Editorial Picks
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.05 }}>
          Ones to Watch
        </h1>
      </div>

      {/* Byline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
        <div style={{ background: '#D4AF37', color: '#1A1A1A', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {month}
        </div>
        <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
          Our editors&rsquo; picks for the African entertainers, athletes and entrepreneurs
          who are about to break through. These are the names you&rsquo;ll be hearing everywhere.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            Our first picks drop soon. Follow us to be the first to know.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {articles.map((a, i) => (
            <Link key={a.id} href={`/ones-to-watch/${a.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0',
                background: '#111',
                border: '1px solid #1E1E1E',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
                className="hover:border-[#D4AF37] transition-colors"
              >
                {/* Rank number */}
                <div style={{
                  background: i < 3 ? '#D4AF37' : '#1A1A1A',
                  color: i < 3 ? '#1A1A1A' : '#333',
                  width: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 900,
                  flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
                  {a.featuredImage && (
                    <img src={a.featuredImage} alt={a.title}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EEE', lineHeight: 1.3, margin: '0 0 6px' }}>
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.5, margin: '0 0 8px',
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {a.excerpt}
                      </p>
                    )}
                    {a.publishedAt && (
                      <span style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {formatDate(new Date(a.publishedAt))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Editorial note */}
      <div style={{ marginTop: '48px', background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px' }}>
        <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: '#888' }}>About Ones to Watch</strong> — These picks represent
          the independent editorial judgement of the Camer360 team. We have no commercial
          relationships with featured artists, athletes or entrepreneurs. Selections are based
          purely on cultural momentum, talent and our reporters&rsquo; on-the-ground intelligence.
        </p>
      </div>

    </div>
  )
}
