'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import { NAV_CATEGORIES } from '@/lib/constants'

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
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background:   '#ffffff',
        borderBottom: '1px solid hsl(30 12% 88%)',
        boxShadow:    scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="page-container flex items-center justify-between gap-4 py-3.5 lg:py-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Camer360 home">
          <div className="relative">
            {/* Gold glow behind badge */}
            <div className="absolute inset-0 rounded-full bg-gradient-gold blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-gold/30"
              style={{ background: 'hsl(20 14% 8%)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt=""
                style={{ height: '20px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold pulse-dot" />
            </div>
          </div>
          <div className="leading-none">
            <div className="font-display text-xl font-bold tracking-tight" style={{ color: 'hsl(20 14% 8%)' }}>
              Camer<span style={{ color: 'hsl(var(--gold))' }}>360</span>
            </div>
            <div className="eyebrow mt-0.5" style={{ fontSize: '8px', color: 'hsl(20 14% 8% / 0.4)' }}>
              Premier Lifestyle
            </div>
          </div>
        </Link>

        {/* ── Desktop nav (centered) ── */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center" aria-label="Main navigation">
          {NAV_CATEGORIES.map(c => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="story-link text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 hover:text-gold"
              style={{ color: 'hsl(20 14% 8% / 0.65)' }}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search icon */}
          <button
            aria-label="Search"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 hover:text-gold"
            style={{ borderColor: 'hsl(30 12% 88%)', color: 'hsl(20 14% 8% / 0.5)' }}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Subscribe — dark bg, white text, large */}
          <Link
            href="/newsletter"
            className="hidden md:inline-flex items-center rounded-full font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
            style={{
              background:  'hsl(20 14% 8%)',
              color:       '#ffffff',
              padding:     '10px 22px',
              fontSize:    '12px',
              fontWeight:  700,
              letterSpacing: '0.16em',
            }}
          >
            Subscribe
          </Link>

          {/* Mobile hamburger */}
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            style={{ borderColor: 'hsl(30 12% 88%)', color: 'hsl(20 14% 8% / 0.6)' }}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          className="lg:hidden animate-fade-in"
          style={{ borderTop: '1px solid hsl(30 12% 88%)', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)' }}
        >
          <nav className="page-container flex flex-col py-4">
            {NAV_CATEGORIES.map(c => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                onClick={() => setOpen(false)}
                className="py-3.5 text-sm font-semibold uppercase tracking-[0.14em] transition-colors hover:text-gold"
                style={{ borderBottom: '1px solid hsl(30 12% 88%)', color: 'hsl(20 14% 8% / 0.65)' }}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/newsletter"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full py-3 text-center text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ background: 'hsl(20 14% 8%)', color: '#ffffff' }}
            >
              Subscribe Free
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
