'use client'
import { useMemo, useState } from 'react'
import type { ArticleWithRelations } from '@/lib/types'

interface TimelineEvent {
  year: string
  title: string
  contentHtml: string
  image: string | null
}

function parseTimeline(html: string): TimelineEvent[] {
  if (typeof window === 'undefined') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const events: TimelineEvent[] = []
  const h3s = Array.from(doc.querySelectorAll('h3'))

  h3s.forEach(h3 => {
    const text = h3.textContent?.trim() ?? ''
    const match = text.match(/^(\d{4})\s*[—–\-:]\s*(.+)$/)
    const year  = match ? match[1] : ''
    const title = match ? match[2].trim() : text

    let contentHtml = ''
    let image: string | null = null
    let next = h3.nextElementSibling

    while (next && next.tagName !== 'H3') {
      const img = next.querySelector('img')
      if (img && !image) image = img.getAttribute('src')
      if (next.tagName === 'P' || next.tagName === 'BLOCKQUOTE') {
        contentHtml += next.outerHTML
      }
      next = next.nextElementSibling
    }

    if (title) events.push({ year, title, contentHtml, image })
  })

  return events
}

export default function CelebrityTimeline({ article }: { article: ArticleWithRelations }) {
  const events  = useMemo(() => parseTimeline(article.body), [article.body])
  const [open, setOpen] = useState<number | null>(0)

  if (events.length === 0) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: article.body }}
        style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}
      />
    )
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* Portrait hero */}
      {article.featuredImage && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap' }}>
          <img
            src={article.featuredImage}
            alt={article.title}
            style={{ width: '200px', height: '260px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0, border: '2px solid #D4AF37' }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#EEE', lineHeight: 1.1, marginBottom: '12px' }}>{article.title}</h1>
            {article.subtitle && (
              <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, marginBottom: '16px' }}>{article.subtitle}</p>
            )}
            {article.excerpt && (
              <p style={{ color: '#BBBBBB', fontSize: '0.92rem', lineHeight: 1.7, borderLeft: '3px solid #D4AF37', paddingLeft: '16px' }}>
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Jump nav */}
      {events.length > 3 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {events.map((ev, i) => (
            <button
              key={i}
              onClick={() => setOpen(i)}
              style={{
                background: open === i ? '#D4AF37' : '#111',
                border: `1px solid ${open === i ? '#D4AF37' : '#2A2A2A'}`,
                color: open === i ? '#1A1A1A' : '#888',
                borderRadius: '20px', padding: '4px 12px',
                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {ev.year || `#${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Vertical timeline */}
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        {/* Gold vertical line */}
        <div style={{
          position: 'absolute', left: '7px', top: '8px', bottom: '8px',
          width: '2px', background: 'linear-gradient(to bottom, #D4AF37, #8B7A2F)',
        }} />

        {events.map((ev, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: '32px' }}>

            {/* Node dot */}
            <div style={{
              position: 'absolute', left: '-32px', top: '6px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: open === i ? '#D4AF37' : '#333',
              border: '2px solid #D4AF37',
              cursor: 'pointer', transition: 'background 0.2s',
              zIndex: 1,
            }}
              onClick={() => setOpen(open === i ? null : i)}
            />

            {/* Year pill */}
            {ev.year && (
              <span style={{
                display: 'inline-block',
                background: '#D4AF37', color: '#1A1A1A',
                fontSize: '0.65rem', fontWeight: 900,
                letterSpacing: '0.1em', padding: '2px 8px',
                borderRadius: '4px', marginBottom: '6px',
              }}>
                {ev.year}
              </span>
            )}

            {/* Title */}
            <h3
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                fontSize: '1.05rem', fontWeight: 800,
                color: open === i ? '#D4AF37' : '#EEE',
                cursor: 'pointer', margin: '0 0 0 0',
                transition: 'color 0.2s', lineHeight: 1.3,
              }}
            >
              {ev.title}
            </h3>

            {/* Expanded content */}
            {open === i && (
              <div style={{ marginTop: '12px' }}>
                {ev.image && (
                  <img
                    src={ev.image}
                    alt={ev.title}
                    style={{ width: '100%', maxWidth: '480px', height: '240px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: ev.contentHtml }}
                  style={{ color: '#BBBBBB', lineHeight: 1.8, fontSize: '0.92rem' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
