'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { NAV_CATEGORIES } from '@/lib/constants'

export function Header() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname                = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#060606]/97 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.07)]'
          : 'bg-[#060606]'
      }`}
    >
      {/* ── Top row: logo | nav | social + search ── */}
      <div className="border-b border-[#1C1C1C]">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center h-[68px] gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Camer360" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav — centred, fills remaining space */}
          <nav className="hidden lg:flex items-center flex-1 justify-center gap-0">
            {NAV_CATEGORIES.map(cat => {
              const active =
                pathname === `/${cat.slug}` ||
                pathname.startsWith(`/${cat.slug}/`)
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className={`relative px-5 py-[22px] text-[12.5px] font-bold uppercase tracking-[0.11em] whitespace-nowrap transition-colors duration-150 ${
                    active ? 'text-white' : 'text-[#666] hover:text-[#ccc]'
                  }`}
                >
                  {cat.name}
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D4AF37]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: social icons + search */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto lg:ml-0">
            <a href="https://facebook.com/camer360" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://twitter.com/camer360" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
              className="w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/camer360" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <Link
              href="/search"
              aria-label="Search"
              className="w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors ml-1"
            >
              <Search size={16} strokeWidth={2} />
            </Link>
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="lg:hidden w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <nav className="lg:hidden fixed inset-x-0 top-[69px] bottom-0 bg-[#060606] z-50 overflow-y-auto border-t border-[#1A1A1A]">
          <div className="flex flex-col divide-y divide-[#141414]">
            {NAV_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={`px-6 py-5 text-[14px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  pathname.startsWith(`/${cat.slug}`)
                    ? 'text-[#D4AF37]'
                    : 'text-[#777] hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
