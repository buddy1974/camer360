'use client'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/lib/types'

export function BreakingBanner({ articles }: { articles: ArticleWithRelations[] }) {
  if (!articles.length) return null
  /* Duplicate items to create a seamless loop */
  const items = [...articles, ...articles, ...articles]

  return (
    /* overflow-hidden MUST be on the outermost element to clip the scrolling content */
    <div className="relative bg-onyx text-ivory border-b border-white/10 overflow-hidden" style={{ height: '36px' }}>
      <div className="flex items-stretch h-full">

        {/* "Breaking" label — shrinks to fit, never wraps */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-crimson h-full px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ivory">
          <span className="h-1.5 w-1.5 rounded-full bg-ivory pulse-dot" />
          Breaking
          {/* Fade bleed into the ticker */}
          <span
            aria-hidden
            className="absolute right-0 top-0 h-full w-6 translate-x-full"
            style={{ background: 'linear-gradient(to right, hsl(358 75% 48%), transparent)' }}
          />
        </div>

        {/* Scrolling ticker — overflow-hidden clips the wide content */}
        <div className="flex-1 overflow-hidden relative">
          {/* The inner div IS wider than the container on purpose — it scrolls via CSS animation */}
          <div className="animate-marquee flex items-center gap-10 h-full pl-8 text-[13px] whitespace-nowrap">
            {items.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`/${a.category.slug}/${a.slug}`}
                className="inline-flex items-center gap-3 text-ivory/90 hover:text-ivory transition-colors shrink-0"
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
