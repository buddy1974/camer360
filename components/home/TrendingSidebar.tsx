import Link from 'next/link'
import { Flame } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'

interface Props { articles: ArticleWithRelations[] }

export function TrendingSidebar({ articles }: Props) {
  const items = articles.slice(0, 8)
  if (!items.length) return null

  return (
    <aside style={{ border: '1px solid hsl(30 12% 88%)', background: '#ffffff', padding: '24px', boxShadow: '0 10px 30px -10px hsla(20,14%,4%,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', height: '36px', width: '36px', alignItems: 'center', justifyContent: 'center', borderRadius: '999px', background: 'var(--gradient-gold)', flexShrink: 0 }}>
          <Flame style={{ height: '16px', width: '16px', color: 'hsl(20 14% 8%)' }} />
        </div>
        <div>
          <div className="eyebrow text-gold-deep" style={{ fontSize: '10px' }}>Trending Now</div>
          <div className="font-display" style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.1, marginTop: '2px' }}>
            This Week&rsquo;s Most Read
          </div>
        </div>
      </div>

      {/* 8 items */}
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((a, i) => (
          <li
            key={a.id}
            style={{
              padding: '10px 0',
              borderBottom: i < items.length - 1 ? '1px solid hsl(30 12% 88%)' : 'none',
            }}
          >
            <Link
              href={`/${a.category.slug}/${a.slug}`}
              style={{ display: 'flex', gap: '14px', textDecoration: 'none', alignItems: 'flex-start' }}
              className="group"
            >
              {/* Number */}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: 1,
                color: 'hsl(var(--gold) / 0.55)',
                width: '36px',
                flexShrink: 0,
                transition: 'color 0.2s',
              }} className="group-hover:text-gold">
                {String(i + 1).padStart(2, '0')}
              </span>
              {/* Title */}
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.45,
                color: 'hsl(20 14% 8%)',
                transition: 'color 0.2s',
              }} className="group-hover:text-gold-deep">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}
