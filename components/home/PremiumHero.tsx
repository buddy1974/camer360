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
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10 py-10 lg:py-14">
        {/* Featured cover */}
        <article className="lg:col-span-8 reveal-up">
          <Link href={`/${cover.category.slug}/${cover.slug}`} className="group block">
            <div className="relative aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-onyx">
              {cover.featuredImage && (
                <img src={cover.featuredImage} alt={cover.title}
                  className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
              )}
              <div className="absolute inset-0 bg-gradient-hero-overlay" />
              <div className="absolute left-6 top-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">Cover Story · Vol IV</div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
                <div className="eyebrow text-gold mb-4 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-gold inline-block" />
                  {cover.category.name}
                </div>
                <h1 className="font-display text-3xl md:text-5xl lg:text-[60px] leading-[0.98] font-semibold text-ivory text-balance max-w-4xl">
                  {cover.title}
                </h1>
                {cover.excerpt && (
                  <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-ivory/75 line-clamp-2">
                    {cover.excerpt}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.18em] text-ivory/60">
                  {cover.author && <span className="text-ivory/90">By {cover.author.name}</span>}
                  <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {minutes} min read</span>
                  {cover.hits > 0 && <span className="flex items-center gap-2"><Eye className="h-3 w-3" /> {formatHitCount(cover.hits)}</span>}
                  <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold tracking-[0.2em] text-onyx transition-all duration-500 group-hover:gap-3">
                    Read the Story <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </article>

        {/* Side stack */}
        {sideStories.length > 0 && (
          <aside className="lg:col-span-4 flex flex-col divide-y divide-white/10 border-t border-white/10 lg:border-t-0">
            <div className="hidden lg:flex items-center justify-between pb-4">
              <div className="eyebrow text-gold">In This Issue</div>
              <div className="font-mono text-[10px] text-ivory/40">04 / 2026</div>
            </div>
            {sideStories.map((a, i) => (
              <Link key={a.id} href={`/${a.category.slug}/${a.slug}`}
                className="group flex gap-4 py-5 first:pt-0 lg:first:pt-5">
                <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 overflow-hidden bg-onyx">
                  {a.featuredImage && (
                    <img src={a.featuredImage} alt={a.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  )}
                  <div className="absolute left-0 top-0 bg-gold px-1.5 py-0.5 font-mono text-[10px] font-bold text-onyx">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="eyebrow text-gold/80 mb-1.5 text-[10px]">{a.category.name}</div>
                  <h3 className="font-display text-base md:text-lg leading-snug font-semibold text-ivory group-hover:text-gold transition-colors">
                    {a.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                    <span>{readingTime(a.body ?? '')} min</span>
                    {a.hits > 0 && <><span>·</span><span>{formatHitCount(a.hits)}</span></>}
                  </div>
                </div>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </section>
  )
}
