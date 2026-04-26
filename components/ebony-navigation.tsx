'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Mail, Menu, X } from 'lucide-react'
import SearchModal from '@/components/search/SearchModal'

const NAV_LEFT = [
  { label: 'Celebrities',  href: '/celebrities'  },
  { label: 'Music',        href: '/music'        },
  { label: 'Film & TV',    href: '/film-tv'      },
  { label: 'Sport Stars',  href: '/sport-stars'  },
]

const NAV_RIGHT = [
  { label: 'Influencers',   href: '/influencers'  },
  { label: 'Entrepreneurs', href: '/entrepreneurs' },
  { label: 'Events',        href: '/events'       },
]

const NAV_ALL = [...NAV_LEFT, ...NAV_RIGHT]

const TRENDING_TOPICS = [
  { label: 'Camer360 Power 100',   href: '/celebrities'   },
  { label: 'Afrobeats Rising',     href: '/music'         },
  { label: 'Top Influencers 2026', href: '/influencers'   },
  { label: 'African Moguls 2026',  href: '/entrepreneurs' },
  { label: 'Sport Stars to Watch', href: '/sport-stars'   },
  { label: 'Upcoming Events',      href: '/events'        },
]

function NavLink({ item, pathname }: { item: { label: string; href: string }; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  return (
    <Link href={item.href} className="story-link" style={{
      whiteSpace:    'nowrap',
      fontSize:      '12px',
      fontWeight:    700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      textDecoration: 'none',
      color:          active ? 'hsl(var(--gold))' : '#1A1A1A',
      transition:    'color 0.2s',
      paddingBottom:  active ? '2px' : undefined,
      borderBottom:   active ? '1.5px solid hsl(var(--gold))' : undefined,
    }}>
      {item.label}
    </Link>
  )
}

export default function EbonyNavigation() {
  const [open,       setOpen]       = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header style={{
      position:     'sticky',
      top:           0,
      zIndex:        50,
      background:    scrolled ? 'rgba(254,254,253,0.96)' : '#FEFEFD',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition:   'all 0.4s cubic-bezier(0.22,1,0.36,1)',
      boxShadow:    scrolled
        ? '0 1px 0 rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06)'
        : '0 1px 0 rgba(0,0,0,0.08)',
    }}>

      {/* ── Desktop: three-column centred logo ── */}
      <div className="hidden lg:block">
        <div style={{
          maxWidth:            '1340px',
          margin:              '0 auto',
          padding:             '0 32px',
          display:             'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems:          'center',
          gap:                 '24px',
          height:              '80px',
        }}>
          {/* Left nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '32px' }}>
            {NAV_LEFT.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
          </div>

          {/* Center logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none' }}>
            <span style={{
              fontFamily:  'var(--font-display), Georgia, serif',
              fontStyle:   'italic',
              fontSize:    '11px',
              color:       'hsl(var(--gold))',
              textAlign:   'right',
              lineHeight:  1.5,
              letterSpacing: '0.06em',
              whiteSpace:  'nowrap',
            }}>
              Cameroon&rsquo;s<br />Premier
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Camer360" style={{ height: '72px', width: 'auto' }} />
            <span style={{
              fontFamily:  'var(--font-display), Georgia, serif',
              fontStyle:   'italic',
              fontSize:    '11px',
              color:       'hsl(var(--gold))',
              textAlign:   'left',
              lineHeight:  1.5,
              letterSpacing: '0.06em',
              whiteSpace:  'nowrap',
            }}>
              Lifestyle<br />Magazine
            </span>
          </Link>

          {/* Right nav + icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '28px' }}>
            {NAV_RIGHT.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '4px', paddingLeft: '16px', borderLeft: '1px solid #E8E8E6' }}>
              <Link href="/newsletter" aria-label="Newsletter"
                style={{ color: '#999', display: 'flex', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--gold))'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#999'}
              >
                <Mail size={17} />
              </Link>
              <button onClick={() => setSearchOpen(true)} aria-label="Search"
                style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--gold))'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#999'}
              >
                <Search size={17} />
              </button>
              {/* Subscribe pill */}
              <Link href="/newsletter" style={{
                display:       'inline-flex',
                alignItems:    'center',
                borderRadius:  '99px',
                background:    'hsl(var(--onyx))',
                color:         'hsl(var(--ivory))',
                padding:       '7px 18px',
                fontSize:      '11px',
                fontWeight:    700,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                textDecoration:'none',
                transition:    'all 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--gradient-gold)'; el.style.color = '#1A1A1A' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'hsl(var(--onyx))'; el.style.color = 'hsl(var(--ivory))' }}
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bar ── */}
      <div className="lg:hidden flex items-center justify-between" style={{ padding: '12px 20px' }}>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Camer360" style={{ height: '48px', width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSearchOpen(true)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <Search size={20} />
          </button>
          <button onClick={() => setOpen(v => !v)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <nav style={{ borderTop: '1px solid #E8E8E6', background: '#FEFEFD' }} className="animate-fade-in lg:hidden">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {NAV_ALL.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                padding:       '16px 20px',
                fontSize:      '13px',
                fontWeight:    700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textDecoration:'none',
                color:          pathname.startsWith(item.href) ? 'hsl(var(--gold))' : '#555',
                borderBottom:  '1px solid #F0EEE8',
                display:       'flex',
                justifyContent:'space-between',
                alignItems:    'center',
              }}>
                {item.label}
                {pathname.startsWith(item.href) && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--gold))' }} />
                )}
              </Link>
            ))}
            <div style={{ padding: '16px 20px' }}>
              <Link href="/newsletter" style={{
                display: 'block', textAlign: 'center',
                background: 'var(--gradient-gold)', color: '#1A1A1A',
                borderRadius: '99px', padding: '13px',
                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.16em', textDecoration: 'none',
              }}>
                Subscribe Free
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* ── Gold trending bar ── */}
      <div style={{ background: 'hsl(var(--gold))', padding: '7px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="eyebrow" style={{ color: 'rgba(26,26,26,0.65)', fontSize: '10px', flexShrink: 0 }}>
            Trending
          </span>
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
            {TRENDING_TOPICS.map((item, i) => (
              <span key={item.href} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {i > 0 && <span style={{ color: 'rgba(26,26,26,0.3)', margin: '0 12px' }}>·</span>}
                <Link href={item.href} style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                  color: 'rgba(26,26,26,0.8)', textDecoration: 'none', whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A1A1A'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(26,26,26,0.8)'}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </header>
  )
}
