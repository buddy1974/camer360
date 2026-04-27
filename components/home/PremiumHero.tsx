'use client'
import Link from 'next/link'
import { ArrowUpRight, Clock, Eye } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'
import { readingTime, formatHitCount } from '@/lib/utils'

interface Props { featured: ArticleWithRelations[] }

export function PremiumHero({ featured }: Props) {
  if (!featured.length) return null
  const cover = featured[0]
  const sideStories = featured.slice(1, 4)
  const minutes = readingTime(cover.body ?? '')

  return (
    <section className="relative bg-onyx-deep text-ivory overflow-hidden">
      {/* Subtle grid texture — absolutely contained */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: 'linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Constrained inner using .hero-grid */}
      <div className="page-container relative py-10 lg:py-14">
        <div className="hero-grid">

          {/* ── Featured cover ── */}
          <article className="reveal-up min-w-0">
            <Link href={`/${cover.category.slug}/${cover.slug}`} className="group block">
              <div className="relative w-full overflow-hidden bg-onyx" style={{ aspectRatio: '16/9' }}>
                {cover.featuredImage && (
                  <img
                    src={cover.featuredImage}
                    alt={cover.title}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-hero-overlay" />

                <div className="absolute left-6 top-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                    Cover Story · Vol IV
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
                  <div className="eyebrow text-gold mb-4 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gold inline-block" />
                    {cover.category.name}
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl lg:text-[56px] leading-[1] font-semibold text-ivory" style={{ maxWidth: '36rem' }}>
                    {cover.title}
                  </h1>
                  {cover.excerpt && (
                    <p className="mt-4 text-base md:text-lg leading-relaxed text-ivory/75 line-clamp-2" style={{ maxWidth: '32rem' }}>
                      {cover.excerpt}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] uppercase tracking-[0.16em] text-ivory/55">
                    {cover.author && (
                      <span className="text-ivory/85">By {cover.author.name}</span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" /> {minutes} min read
                    </span>
                    {cover.hits > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3 w-3 shrink-0" /> {formatHitCount(cover.hits)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-onyx transition-all duration-500 group-hover:gap-3 shrink-0">
                      Read the Story <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* ── Side stack ── */}
          {sideStories.length > 0 && (
            <aside className="min-w-0 flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-t-0">
              <div className="hidden lg:flex items-center justify-between pb-4">
                <div className="eyebrow text-gold">In This Issue</div>
                <div className="font-mono text-[10px] text-ivory/40">04 / 2026</div>
              </div>
              {sideStories.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/${a.category.slug}/${a.slug}`}
                  className="group flex gap-4 py-5 first:pt-0 lg:first:pt-5 min-w-0"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-onyx">
                    {a.featuredImage && (
                      <img
                        src={a.featuredImage}
                        alt={a.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute left-0 top-0 bg-gold px-1.5 py-0.5 font-mono text-[10px] font-bold text-onyx">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow text-gold/80 mb-1.5 text-[10px]">{a.category.name}</div>
                    <h3 className="font-display text-sm md:text-base leading-snug font-semibold text-ivory group-hover:text-gold transition-colors line-clamp-3">
                      {a.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ivory/40">
                      <span>{readingTime(a.body ?? '')} min</span>
                      {a.hits > 0 && (
                        <><span>·</span><span>{formatHitCount(a.hits)}</span></>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </aside>
          )}

        </div>
      </div>
    </section>
  )
}
