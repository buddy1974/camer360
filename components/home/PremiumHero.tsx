'use client'
import Link from 'next/link'
import { ArrowUpRight, Clock, Eye } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'
import { readingTime, formatHitCount } from '@/lib/utils'

interface Props { featured: ArticleWithRelations[] }

export function PremiumHero({ featured }: Props) {
  if (!featured.length) return null
  const cover      = featured[0]
  const sideItems  = featured.slice(1, 6)   // up to 5 sidebar items
  const minutes    = readingTime(cover.body ?? '')

  return (
    <section
      className="overflow-hidden"
      style={{ background: 'hsl(20 14% 8%)', color: '#F5F5F0' }}
    >
      <div className="page-container py-8 lg:py-10">
        <div className="hero-grid">

          {/* ══════════════════════════════════
              LEFT — featured cover with overlay
          ══════════════════════════════════ */}
          <article className="min-w-0">
            <Link href={`/${cover.category.slug}/${cover.slug}`} className="group block relative overflow-hidden" style={{ aspectRatio: '16/10' }}>

              {/* Background image */}
              {cover.featuredImage ? (
                <img
                  src={cover.featuredImage}
                  alt={cover.title}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'hsl(220 14% 4%)' }} />
              )}

              {/* Gradient overlay — text readable on any image */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.12) 100%)',
                }}
              />

              {/* Issue label — top left */}
              <div className="absolute left-5 top-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'hsl(var(--gold))' }}>
                  Cover Story · Vol IV
                </span>
              </div>

              {/* Text content — bottom left, padded away from CTA */}
              <div
                className="absolute bottom-0 left-0"
                style={{ padding: '32px 160px 32px 32px' }}
              >
                {/* Category eyebrow */}
                <div className="eyebrow mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--gold))' }}>
                  <span className="h-1 w-1 rounded-full inline-block" style={{ background: 'hsl(var(--gold))' }} />
                  {cover.category.name}
                </div>

                {/* Headline */}
                <h1
                  className="font-display font-semibold leading-[1.02]"
                  style={{
                    fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                    color: '#ffffff',
                    maxWidth: '28rem',
                    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {cover.title}
                </h1>

                {/* Excerpt */}
                {cover.excerpt && (
                  <p
                    className="mt-3 leading-relaxed line-clamp-2"
                    style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', maxWidth: '26rem' }}
                  >
                    {cover.excerpt}
                  </p>
                )}

                {/* Meta line */}
                <div
                  className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)' }}
                >
                  {cover.author && (
                    <span style={{ color: 'rgba(255,255,255,0.85)' }}>By {cover.author.name}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0" /> {minutes} min read
                  </span>
                  {cover.hits > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3 w-3 shrink-0" /> {formatHitCount(cover.hits)}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA — absolute bottom-right */}
              <div className="absolute" style={{ right: '24px', bottom: '32px' }}>
                <span
                  className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.16em] transition-all duration-500 group-hover:gap-3"
                  style={{
                    background:   'hsl(var(--gold))',
                    color:        'hsl(20 14% 8%)',
                    padding:      '12px 22px',
                    borderRadius: '999px',
                    fontSize:     '11px',
                    fontWeight:   700,
                  }}
                >
                  Read the Story <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

            </Link>
          </article>

          {/* ══════════════════════════════════
              RIGHT — "In This Issue" sidebar
          ══════════════════════════════════ */}
          <aside
            className="min-w-0 flex flex-col"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Sidebar header */}
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>In This Issue</span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>04 / 2026</span>
            </div>

            {/* 5 story items */}
            <div className="flex flex-col" style={{ gap: '0' }}>
              {(sideItems.length > 0 ? sideItems : featured.slice(1, 6)).map((a, i) => (
                <Link
                  key={a.id}
                  href={`/${a.category.slug}/${a.slug}`}
                  className="group"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    gap: '12px',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    alignItems: 'start',
                  }}
                >
                  {/* Thumbnail with numbered badge */}
                  <div className="relative overflow-hidden shrink-0" style={{ width: '64px', height: '64px' }}>
                    {a.featuredImage ? (
                      <img
                        src={a.featuredImage}
                        alt={a.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'hsl(220 14% 4%)' }} />
                    )}
                    {/* Number badge */}
                    <div
                      className="absolute left-0 top-0 font-mono font-bold"
                      style={{
                        background:  'hsl(var(--gold))',
                        color:       'hsl(20 14% 8%)',
                        fontSize:    '9px',
                        padding:     '2px 5px',
                        lineHeight:  1.4,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <div
                      className="eyebrow mb-1"
                      style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}
                    >
                      {a.category.name}
                    </div>
                    <h3
                      className="font-display font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-gold"
                      style={{ fontSize: '13px', color: '#F5F5F0' }}
                    >
                      {a.title}
                    </h3>
                    <div
                      className="mt-1 flex items-center gap-2"
                      style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)' }}
                    >
                      <span>{readingTime(a.body ?? '')} min</span>
                      {a.hits > 0 && <><span>·</span><span>{formatHitCount(a.hits)}</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </section>
  )
}
