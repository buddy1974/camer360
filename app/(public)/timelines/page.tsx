import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/db/queries'

export const metadata: Metadata = {
  title: 'Celebrity Timelines | Camer360',
  description: 'Interactive career timelines for African celebrities — birth, debut, breakthrough, awards and legacy. Comprehensive biographies of Cameroon and African entertainment stars.',
}

export default async function TimelinesPage() {
  const { articles } = await getArticlesByCategory('celebrity-timelines', 1, 30)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          People
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.05, marginBottom: '12px' }}>
          Celebrity Timelines
        </h1>
        <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px' }}>
          The full story — birth to breakthrough. Interactive career timelines for African
          entertainment&rsquo;s biggest stars, from Cameroon to the global stage.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Celebrity timelines coming soon — check back shortly.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {articles.map(a => (
            <Link
              key={a.id}
              href={`/celebrity-timelines/${a.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px',
                overflow: 'hidden', transition: 'border-color 0.2s',
              }}
                className="hover:border-[#D4AF37]"
              >
                {a.featuredImage && (
                  <img
                    src={a.featuredImage}
                    alt={a.title}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'top' }}
                  />
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Timeline
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#EEE', lineHeight: 1.3, margin: 0 }}>
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '8px', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {a.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
