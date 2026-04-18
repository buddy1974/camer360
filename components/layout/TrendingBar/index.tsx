import Link from 'next/link'
import { getMostRead } from '@/lib/db/queries'

export async function TrendingBar() {
  let items: { title: string; href: string }[] = []

  try {
    const articles = await getMostRead(8)
    items = articles.map(a => ({
      title: a.title.toUpperCase(),
      href:  `/${a.category.slug}/${a.slug}`,
    }))
  } catch {
    // silently skip if DB unavailable
  }

  if (items.length === 0) return null

  // Duplicate list for seamless CSS marquee loop
  const doubled = [...items, ...items]

  return (
    <div
      style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #1A1A1A',
        overflow: 'hidden',
        position: 'relative',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* "TRENDING:" label */}
      <div
        style={{
          flexShrink: 0,
          padding: '0 16px 0 20px',
          fontSize: '10px',
          fontWeight: 900,
          letterSpacing: '0.18em',
          color: '#D4AF37',
          textTransform: 'uppercase',
          borderRight: '1px solid #222',
          marginRight: '0',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#0A0A0A',
          position: 'relative',
          zIndex: 2,
        }}
      >
        TRENDING
      </div>

      {/* Scrolling track */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="trending-marquee" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {doubled.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              style={{
                flexShrink: 0,
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#888',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                padding: '0 28px',
                borderRight: '1px solid #222',
                transition: 'color 0.15s',
              }}
              className="hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .trending-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .trending-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
