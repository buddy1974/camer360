'use client'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/lib/types'

export function BreakingBanner({ articles }: { articles: ArticleWithRelations[] }) {
  if (!articles.length) return null
  const items = [...articles, ...articles]

  return (
    <div className="relative w-full overflow-hidden border-b border-white/10 bg-onyx text-ivory">
      <div className="max-w-[1440px] mx-auto px-0 flex items-stretch gap-0">
        {/* "Breaking" label */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-crimson py-2 pl-5 pr-7 text-[11px] font-bold uppercase tracking-[0.2em] text-ivory">
          <span className="h-1.5 w-1.5 rounded-full bg-ivory pulse-dot" />
          Breaking
          {/* Bleed fade */}
          <span className="absolute right-0 top-0 h-full w-6 translate-x-full" style={{ background: 'linear-gradient(to right, hsl(358 75% 48%), transparent)' }} />
        </div>
        {/* Scrolling items */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-marquee gap-10 whitespace-nowrap py-2 pl-8 text-[13px]" style={{ width: 'max-content' }}>
            {items.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`/${a.category.slug}/${a.slug}`}
                className="inline-flex items-center gap-3 text-ivory/90 hover:text-ivory transition-colors"
              >
                <span className="text-gold text-[10px]">◆</span>
                <span className="font-medium">{a.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
