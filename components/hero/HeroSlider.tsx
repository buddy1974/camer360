'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/lib/types'

interface Props {
  articles: ArticleWithRelations[]
}

export default function HeroSlider({ articles }: Props) {
  const [current, setCurrent]   = useState(0)
  const [paused,  setPaused]    = useState(false)
  const touchStartX             = useRef(0)
  const count                   = articles.length

  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count])
  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count])

  // Auto-advance every 5.5 s
  useEffect(() => {
    if (paused || count <= 1) return
    const id = setInterval(next, 5500)
    return () => clearInterval(id)
  }, [paused, next, count])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (!count) return (
    <div style={{ minHeight: 'clamp(320px, 70vh, 760px)', background: '#1a1a1a' }} />
  )

  return (
    <div
      role="region"
      aria-label="Featured stories"
      style={{ position: 'relative', overflow: 'hidden', background: '#1a1a1a', minHeight: 'clamp(320px, 70vh, 760px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchStartX.current = e.targetTouches[0].clientX }}
      onTouchEnd={e => {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
      }}
    >
      {/* ── Slides ── */}
      {articles.map((article, i) => (
        <div
          key={article.id}
          aria-hidden={i !== current}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.85s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {/* Background image */}
          {article.featuredImage && (
            <img
              src={article.featuredImage}
              alt=""
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Flat dim */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)' }} />
          {/* Bottom-up gradient for text legibility */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)' }} />
          {/* Subtle left vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 50%)' }} />

          {/* Text content — extra bottom padding for dots */}
          <Link
            href={`/${article.category.slug}/${article.slug}`}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: 'clamp(20px, 4vw, 48px) clamp(20px, 5vw, 52px) 68px',
              textDecoration: 'none', display: 'block',
            }}
          >
            <span style={{
              display: 'inline-block',
              background: '#D4AF37', color: '#1A1A1A',
              fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em',
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: '2px',
              marginBottom: '14px',
            }}>
              {article.category.name}
            </span>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.5rem, 3.8vw, 3.2rem)',
              fontWeight: 800, color: '#fff',
              lineHeight: 1.14, margin: '0 0 14px',
              textShadow: '0 2px 20px rgba(0,0,0,0.65)',
              maxWidth: '760px',
            }}>
              {article.title}
            </h1>

            {article.excerpt && (
              <p style={{
                color: 'rgba(255,255,255,0.80)', fontSize: '15px',
                lineHeight: 1.65, margin: '0 0 22px', maxWidth: '580px',
                display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}>
                {article.excerpt}
              </p>
            )}

            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#D4AF37,#F7DC6F)',
              color: '#1A1A1A', fontSize: '11px', fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '12px 28px', borderRadius: '2px',
            }}>
              Read Full Story →
            </span>
          </Link>
        </div>
      ))}

      {/* ── Arrows (only when multiple slides) ── */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous story"
            style={{
              position: 'absolute', left: 16, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontSize: '24px', lineHeight: 1,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next story"
            style={{
              position: 'absolute', right: 16, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontSize: '24px', lineHeight: 1,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            ›
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {count > 1 && (
        <div
          style={{
            position: 'absolute', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', gap: 8, alignItems: 'center',
          }}
        >
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 28 : 8,
                height: 8, borderRadius: 4, padding: 0,
                background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.40)',
                border: 'none', cursor: 'pointer',
                transition: 'width 0.35s ease, background 0.35s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar ── */}
      {count > 1 && !paused && (
        <div
          key={`${current}-progress`}
          style={{
            position: 'absolute', top: 0, left: 0, height: 3,
            background: '#D4AF37',
            animation: 'hero-progress 5.5s linear forwards',
            zIndex: 20,
          }}
        />
      )}
    </div>
  )
}
