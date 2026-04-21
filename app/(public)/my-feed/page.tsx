'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CELEBRITIES } from '@/lib/celebrities'
import { CATEGORIES } from '@/lib/constants'
import type { ArticleWithRelations } from '@/lib/types'

const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug)

export default function MyFeedPage() {
  const [articles,    setArticles]    = useState<ArticleWithRelations[]>([])
  const [loading,     setLoading]     = useState(true)
  const [followedC,   setFollowedC]   = useState<string[]>([])
  const [followedCat, setFollowedCat] = useState<string[]>([])

  useEffect(() => {
    const celebs = CELEBRITIES
      .filter(c => localStorage.getItem(`follow_celeb_${c.slug}`))
      .map(c => c.searchName)
    const cats = CATEGORY_SLUGS
      .filter(s => localStorage.getItem(`follow_category_${s}`))

    setFollowedC(celebs)
    setFollowedCat(cats)

    if (celebs.length === 0 && cats.length === 0) {
      setLoading(false)
      return
    }

    const params = new URLSearchParams()
    if (celebs.length)  params.set('celebrities', celebs.join(','))
    if (cats.length)    params.set('categories',  cats.join(','))

    fetch(`/api/my-feed?${params}`)
      .then(r => r.json())
      .then((data: ArticleWithRelations[]) => { setArticles(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hasFollows = followedC.length > 0 || followedCat.length > 0

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Personalized
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '6px', lineHeight: 1.1 }}>
          My Feed
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '8px' }}>
          Stories curated from the celebrities and topics you follow.
        </p>
      </div>

      {/* What you follow */}
      {hasFollows && (
        <div style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Following:
          </span>
          {CELEBRITIES.filter(c => followedC.includes(c.searchName)).map(c => (
            <span key={c.slug} style={{
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              color: '#D4AF37', padding: '4px 12px', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700,
            }}>
              {c.name}
            </span>
          ))}
          {followedCat.map(s => (
            <span key={s} style={{
              background: '#F3F4F6', border: '1px solid #E5E7EB',
              color: '#4B5563', padding: '4px 12px', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700,
            }}>
              {CATEGORIES.find(c => c.slug === s)?.name ?? s}
            </span>
          ))}
        </div>
      )}

      {/* Empty state — nothing followed */}
      {!hasFollows && (
        <div style={{
          background: '#F9F7F4', border: '1px solid var(--border-light)',
          borderRadius: '16px', padding: '64px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⭐</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
            Your feed is empty
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            Follow celebrities and topics to build a personalised stream of stories.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {CELEBRITIES.map(c => (
              <Link key={c.slug} href={`/celebrities/${c.slug}`} style={{
                background: 'white', border: '1px solid var(--border-light)',
                borderRadius: '8px', padding: '10px 16px',
                color: 'var(--primary-dark)', textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                + Follow {c.name}
              </Link>
            ))}
            {CATEGORIES.map(c => (
              <Link key={c.slug} href={`/${c.slug}`} style={{
                background: 'white', border: '1px solid var(--border-light)',
                borderRadius: '8px', padding: '10px 16px',
                color: 'var(--primary-dark)', textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                + {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {hasFollows && loading && (
        <div style={{ textAlign: 'center', padding: '64px', color: '#9CA3AF' }}>
          Loading your feed…
        </div>
      )}

      {/* Articles grid */}
      {!loading && articles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {articles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}

      {/* Has follows but no articles */}
      {hasFollows && !loading && articles.length === 0 && (
        <div style={{
          background: '#F9F7F4', border: '1px solid var(--border-light)',
          borderRadius: '16px', padding: '48px', textAlign: 'center',
        }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
            No stories yet for the topics you follow — check back soon.
          </p>
        </div>
      )}

    </div>
  )
}
