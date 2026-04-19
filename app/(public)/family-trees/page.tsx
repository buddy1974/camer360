import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/db/queries'

export const metadata: Metadata = {
  title: 'Entertainment Family Trees | Camer360',
  description: 'Interactive family trees of African entertainment dynasties — musical families, acting lineages and business empires from Cameroon and across Africa.',
}

export default async function FamilyTreesPage() {
  const { articles } = await getArticlesByCategory('family-trees', 1, 20)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Dynasties
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.05, marginBottom: '12px' }}>
          Family Trees
        </h1>
        <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px' }}>
          Inside Africa&rsquo;s entertainment dynasties — the musical families, acting lineages and
          business empires that shaped the continent&rsquo;s cultural landscape.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Family trees coming soon — check back shortly.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {articles.map(a => (
            <Link key={a.id} href={`/family-trees/${a.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px',
                overflow: 'hidden',
              }}
                className="hover:border-[#D4AF37] transition-colors"
              >
                {a.featuredImage && (
                  <img src={a.featuredImage} alt={a.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Family Tree
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EEE', lineHeight: 1.3, margin: 0 }}>
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '8px', lineHeight: 1.5 }}>
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
