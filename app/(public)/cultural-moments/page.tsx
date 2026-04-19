import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/db/queries'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Cultural Moments | Camer360',
  description: "Africa's defining cultural moments — the movements, milestones and breakthroughs that shaped entertainment, music, film and society across the continent.",
}

export default async function CulturalMomentsPage() {
  const { articles } = await getArticlesByCategory('cultural-moments', 1, 30)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          History in the Making
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.05, marginBottom: '12px' }}>
          Cultural Moments
        </h1>
        <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px' }}>
          The movements, milestones and breakthroughs that defined African entertainment.
          Tracking the moments that changed culture — from Yaoundé to the world stage.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Cultural moment tracking coming soon.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          {/* Timeline spine */}
          <div style={{
            position: 'absolute', left: '6px', top: '8px', bottom: '8px',
            width: '2px', background: 'linear-gradient(to bottom, #D4AF37 0%, #8B7A2F 100%)',
          }} />

          {articles.map((a, i) => (
            <div key={a.id} style={{ position: 'relative', marginBottom: '36px' }}>
              {/* Spine dot */}
              <div style={{
                position: 'absolute', left: '-28px', top: '18px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: i === 0 ? '#D4AF37' : '#222',
                border: '2px solid #D4AF37',
              }} />

              {/* Date pill */}
              {a.publishedAt && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 900,
                    background: '#1A1A1A', border: '1px solid #2A2A2A',
                    color: '#D4AF37', padding: '2px 10px', borderRadius: '20px',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {formatDate(new Date(a.publishedAt))}
                  </span>
                </div>
              )}

              <Link href={`/cultural-moments/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px',
                  overflow: 'hidden', display: 'grid',
                  gridTemplateColumns: a.featuredImage ? '140px 1fr' : '1fr',
                }}
                  className="hover:border-[#D4AF37] transition-colors"
                >
                  {a.featuredImage && (
                    <img src={a.featuredImage} alt={a.title}
                      style={{ width: '140px', height: '100px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#EEE', lineHeight: 1.3, margin: '0 0 6px' }}>
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5, margin: 0,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {a.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
