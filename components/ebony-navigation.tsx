'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { NAV_CATEGORIES, SITE_FB, SITE_TWITTER } from '@/lib/constants'

export default function EbonyNavigation() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        background:    scrolled ? 'hsla(220,14%,4%,0.92)' : 'hsl(20,14%,8%)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom:  scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
        boxShadow:     scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="page-container flex items-center justify-between gap-6 py-4 lg:py-5">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="Camer360 home">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-gold blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-onyx-deep ring-2 ring-gold/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" style={{ height: '22px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold pulse-dot" />
            </div>
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl font-bold tracking-tight text-ivory">
              Camer<span className="text-gold">360</span>
            </div>
            <div className="eyebrow text-ivory/35 mt-1" style={{ fontSize: '9px' }}>
              Premier Lifestyle · Est. 2024
            </div>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          {NAV_CATEGORIES.map(c => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="story-link text-[13px] font-medium uppercase tracking-[0.14em] text-ivory/65 hover:text-gold transition-colors duration-300"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Subscribe CTA */}
          <Link
            href="/newsletter"
            className="hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-onyx transition-all duration-500 hover:shadow-glow"
            style={{ background: 'var(--gradient-gold)' }}
          >
            Subscribe
          </Link>

          {/* Mobile hamburger */}
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 hover:border-gold hover:text-gold transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="lg:hidden border-t border-ivory/10 bg-onyx-deep/95 backdrop-blur-xl animate-fade-in">
          <nav className="page-container flex flex-col py-4">
            {NAV_CATEGORIES.map(c => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                onClick={() => setOpen(false)}
                className="border-b border-ivory/10 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-ivory/70 hover:text-gold transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/newsletter"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full py-3 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-onyx"
              style={{ background: 'var(--gradient-gold)' }}
            >
              Subscribe Free
            </Link>

            {/* Social row */}
            <div className="mt-5 mb-2 flex items-center gap-3">
              {[
                { href: SITE_FB, label: 'Facebook', d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { href: `https://twitter.com/${(SITE_TWITTER ?? '').replace('@', '')}`, label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { href: 'https://instagram.com/camer360', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.07 4.849c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.334-2.633 1.308-3.608C4.516 2.568 5.783 2.296 7.149 2.234 8.415 2.175 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
              ].map(({ href, label, d }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 hover:border-gold hover:text-gold transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
