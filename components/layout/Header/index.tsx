'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { NAV_CATEGORIES } from '@/lib/constants'

export function Header() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname               = usePathname()

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
          ? 'bg-[#060606]/96 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-[#060606]'
      }`}
    >
      {/* ── Logo row ── */}
      <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Camer360" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="w-10 h-10 grid place-items-center text-[#666] hover:text-white transition-colors rounded-lg"
          >
            <Search size={18} strokeWidth={2} />
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 grid place-items-center text-[#666] hover:text-white transition-colors rounded-lg"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* ── Desktop nav bar ── */}
      <nav className="hidden lg:block border-t border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center">
          {NAV_CATEGORIES.map(cat => {
            const active =
              pathname === `/${cat.slug}` ||
              pathname.startsWith(`/${cat.slug}/`)
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={`relative px-6 py-4 text-[13px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? 'text-white'
                    : 'text-[#666] hover:text-[#ccc]'
                }`}
              >
                {cat.name}
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D4AF37] rounded-t-sm" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {open && (
        <nav className="lg:hidden fixed inset-x-0 top-[68px] bottom-0 bg-[#060606] z-50 overflow-y-auto border-t border-[#1A1A1A]">
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
