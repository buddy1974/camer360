'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { NAV_CATEGORIES } from '@/lib/constants'
import { SearchBar } from '@/components/layout/SearchBar'

export function Header() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname                = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header
      style={{
        position:   'sticky',
        top:        0,
        zIndex:     50,
        width:      '100%',
        transition: 'background 0.5s ease, box-shadow 0.5s ease, backdrop-filter 0.5s ease',
        background: scrolled
          ? 'rgba(6,6,6,0.92)'
          : '#060606',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* ── Main bar ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          maxWidth:      '1340px',
          margin:        '0 auto',
          padding:       '0 24px',
          display:       'flex',
          alignItems:    'center',
          height:        '68px',
          gap:           '28px',
        }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Glowing logo badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position:     'absolute',
                inset:        0,
                borderRadius: '50%',
                background:   'var(--gradient-gold)',
                filter:       'blur(8px)',
                opacity:      0.5,
              }} />
              <div style={{
                position:      'relative',
                width:         '40px',
                height:        '40px',
                borderRadius:  '50%',
                background:    '#0A0A0A',
                border:        '1.5px solid hsla(41,65%,52%,0.4)',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Camer360" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                {/* Pulse dot */}
                <span style={{
                  position:     'absolute',
                  top:          '-2px',
                  right:        '-2px',
                  width:        '9px',
                  height:       '9px',
                  borderRadius: '50%',
                  background:   'hsl(var(--gold))',
                  border:       '1.5px solid #060606',
                }} className="pulse-dot-ed" />
              </div>
            </div>

            {/* Brand name */}
            <div style={{ lineHeight: 1 }}>
              <div style={{
                fontFamily:    'var(--font-display), Georgia, serif',
                fontSize:      '1.35rem',
                fontWeight:    700,
                letterSpacing: '-0.02em',
                color:         '#F5F5F0',
              }}>
                Camer<span style={{ color: 'hsl(var(--gold))' }}>360</span>
              </div>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontSize: '9px' }}>
                Premier Lifestyle · Est. 2019
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'none', flex: 1, justifyContent: 'center', alignItems: 'center' }} className="lg-nav">
            <style>{`
              @media (min-width: 1024px) { .lg-nav { display: flex !important; } .mob-btn { display: none !important; } }
            `}</style>
            {NAV_CATEGORIES.map(cat => {
              const active = pathname === `/${cat.slug}` || pathname.startsWith(`/${cat.slug}/`)
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  style={{
                    position:      'relative',
                    padding:       '22px 18px',
                    fontSize:      '12px',
                    fontWeight:    700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    whiteSpace:    'nowrap',
                    textDecoration:'none',
                    color:          active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    transition:    'color 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#DDD' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
                >
                  {cat.name}
                  {active && (
                    <span style={{
                      position:   'absolute',
                      bottom:     0,
                      left:       0,
                      right:      0,
                      height:     '2px',
                      background: 'hsl(var(--gold))',
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: social + search + subscribe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', flexShrink: 0 }}>
            {/* Social icons */}
            {[
              { href: 'https://facebook.com/camer360',  label: 'Facebook',  path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
              { href: 'https://twitter.com/camer360',   label: 'X',         path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
              { href: 'https://instagram.com/camer360', label: 'Instagram',  path: null },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: '32px', height: '32px', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--gold))'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}
              >
                {s.path ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                )}
              </a>
            ))}

            <SearchBar />

            {/* Subscribe CTA */}
            <Link
              href="/newsletter"
              style={{
                display:       'none',
                alignItems:    'center',
                gap:           '6px',
                borderRadius:  '99px',
                background:    'hsl(var(--onyx))',
                border:        '1px solid hsla(41,65%,52%,0.3)',
                color:         'hsl(var(--gold-soft,44 80% 78%))',
                padding:       '8px 18px',
                fontSize:      '11px',
                fontWeight:    700,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                textDecoration:'none',
                transition:    'all 0.4s var(--ease-editorial)',
                marginLeft:    '6px',
              }}
              className="subscribe-cta"
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--gradient-gold)'
                el.style.color = 'hsl(var(--onyx))'
                el.style.borderColor = 'transparent'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'hsl(var(--onyx))'
                el.style.color = 'hsl(44,80%,78%)'
                el.style.borderColor = 'hsla(41,65%,52%,0.3)'
              }}
            >
              Subscribe
            </Link>
            <style>{`
              @media (min-width: 768px) { .subscribe-cta { display: inline-flex !important; } }
            `}</style>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              style={{ width: '32px', height: '32px', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
              className="mob-btn"
            >
              {open ? <X size={18} color="currentColor" /> : <Menu size={18} color="currentColor" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <nav
          style={{
            position:   'fixed',
            inset:      `69px 0 0 0`,
            background: 'rgba(6,6,6,0.98)',
            zIndex:     50,
            overflowY:  'auto',
            borderTop:  '1px solid rgba(255,255,255,0.06)',
          }}
          className="animate-fade-in"
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {NAV_CATEGORIES.map(cat => {
              const active = pathname.startsWith(`/${cat.slug}`)
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  style={{
                    padding:         '18px 24px',
                    fontSize:        '13px',
                    fontWeight:      700,
                    textTransform:   'uppercase',
                    letterSpacing:   '0.12em',
                    textDecoration:  'none',
                    color:            active ? 'hsl(var(--gold))' : 'rgba(255,255,255,0.55)',
                    borderBottom:    '1px solid rgba(255,255,255,0.05)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'space-between',
                    transition:      'color 0.2s',
                  }}
                >
                  {cat.name}
                  {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--gold))' }} />}
                </Link>
              )
            })}
            <div style={{ padding: '20px 24px' }}>
              <Link href="/newsletter" style={{
                display: 'block', textAlign: 'center',
                background: 'var(--gradient-gold)',
                color: 'hsl(var(--onyx))',
                borderRadius: '99px',
                padding: '14px',
                fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.18em',
                textDecoration: 'none',
              }}>
                Subscribe Free
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
