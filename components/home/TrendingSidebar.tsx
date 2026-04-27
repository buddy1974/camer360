import Link from 'next/link'
import { Flame } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'

interface Props { articles: ArticleWithRelations[] }

export function TrendingSidebar({ articles }: Props) {
  const items = articles.slice(0, 5)
  if (!items.length) return null

  return (
    <aside className="border border-border bg-white p-6 lg:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold shrink-0">
          <Flame className="h-4 w-4 text-onyx" />
        </div>
        <div>
          <div className="eyebrow text-gold-deep">Trending Now</div>
          <div className="font-display text-xl font-semibold leading-none mt-1">This Week&#39;s Most Read</div>
        </div>
      </div>
      <ol className="space-y-5">
        {items.map((a, i) => (
          <li key={a.id}>
            <Link href={`/${a.category.slug}/${a.slug}`} className="group flex gap-4">
              <span className="font-display text-4xl font-bold leading-none text-gold/60 group-hover:text-gold transition-colors w-10 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="block text-[15px] leading-snug font-medium group-hover:text-gold-deep transition-colors">
                {a.title}
              </span>
            </Link>
            {i < items.length - 1 && <div className="mt-5 h-px bg-border" />}
          </li>
        ))}
      </ol>
    </aside>
  )
}
