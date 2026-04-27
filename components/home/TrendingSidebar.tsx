import Link from 'next/link'
import { Flame } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'

interface Props { articles: ArticleWithRelations[] }

export function TrendingSidebar({ articles }: Props) {
  const items = articles.slice(0, 16)
  if (!items.length) return null

  return (
    <aside style={{ border: '1px solid hsl(30 12% 88%)', background: '#ffffff', padding: '20px', boxShadow: '0 10px 30px -10px hsla(20,14%,4%,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', height: '34px', width: '34px', alignItems: 'center', justifyContent: 'center', borderRadius: '999px', background: 'var(--gradient-gold)', flexShrink: 0 }}>
          <Flame style={{ height: '14px', width: '14px', color: 'hsl(20 14% 8%)' }} />
        </div>
        <div>
          <div className="eyebrow text-gold-deep" style={{ fontSize: '9px' }}>Trending Now</div>
          <div className="font-display" style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.1, marginTop: '2px' }}>
            This Week&rsquo;s Most Read
          </div>
        </div>
      </div>

      {/* Scrollable list of 16 items */}
      <ol className="trending-scrollable" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((a, i) => (
          <li
            key={a.id}
            style={{
              padding: '8px 0',
              borderBottom: i < items.length - 1 ? '1px solid hsl(30 12% 88%)' : 'none',
            }}
          >
            <Link
              href={`/${a.category.slug}/${a.slug}`}
              style={{ display: 'flex', gap: '12px', textDecoration: 'none', alignItems: 'flex-start' }}
              className="group"
            >
              {/* Number */}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1,
                color: 'hsl(var(--gold) / 0.5)',
                width: '30px',
                flexShrink: 0,
                transition: 'color 0.2s',
              }} className="group-hover:text-gold">
                {(i + 1).toString().padStart(2, '0')}
              </span>

              {/* Title */}
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.4,
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
