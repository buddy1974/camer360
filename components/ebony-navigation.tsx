'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Mail, Menu, X } from 'lucide-react'

const NAV_LEFT = [
  { label: 'CELEBRITIES',  href: '/celebrities'  },
  { label: 'MUSIC',        href: '/music'        },
  { label: 'FILM & TV',    href: '/film-tv'      },
  { label: 'SPORT STARS',  href: '/sport-stars'  },
]

const NAV_RIGHT = [
  { label: 'STYLE',         href: '/style'         },
  { label: 'ENTREPRENEURS', href: '/entrepreneurs' },
  { label: 'USA',           href: '/usa'           },
  { label: 'EUROPE',        href: '/europe'        },
]

const NAV_ALL = [...NAV_LEFT, ...NAV_RIGHT]

const TRENDING = [
  { label: 'CAMER360 POWER 100',         href: '/celebrities'   },
  { label: 'AFROBEATS RISING STARS',     href: '/music'         },
  { label: 'AFRICAN BEAUTY AWARDS 2026', href: '/style'         },
  { label: 'CAMEROONIANS IN AMERICA',    href: '/usa'           },
  { label: 'SPORT STARS TO WATCH',       href: '/sport-stars'   },
  { label: 'AFRICAN MOGULS 2026',        href: '/entrepreneurs' },
]

function NavLink({ item, pathname }: { item: { label: string; href: string }; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  return (
    <Link
      href={item.href}
      style={{ whiteSpace: 'nowrap' }}
      className={`text-xs font-black tracking-widest uppercase transition-colors px-1 ${
        active ? 'text-[#D4AF37]' : 'text-black hover:text-[#D4AF37]'
      }`}
    >
      {item.label}
    </Link>
  )
}

export default function EbonyNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">

      {/* ── Desktop: centered logo, nav split left/right ── */}
      <div className="hidden lg:grid container mx-auto px-6 py-4"
        style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '24px' }}>

        {/* Left nav */}
        <div className="flex items-center justify-end" style={{ gap: '28px' }}>
          {NAV_LEFT.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
        </div>

        {/* Center logo + taglines */}
        <Link href="/" className="flex items-center justify-center gap-3">
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic', fontSize: '11px',
            color: '#D4AF37', textAlign: 'right',
            lineHeight: 1.4, letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            Cameroon&rsquo;s<br />Premier
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Camer360" className="h-20 w-auto" />
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic', fontSize: '11px',
            color: '#D4AF37', textAlign: 'left',
            lineHeight: 1.4, letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            Lifestyle<br />Magazine
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center justify-start" style={{ gap: '28px' }}>
          {NAV_RIGHT.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
          {/* Utility icons */}
          <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-4">
            <Link href="/newsletter" aria-label="Newsletter"
              className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
            <Link href="/search" aria-label="Search"
              className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile: logo left, hamburger right ── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Camer360" className="h-12 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search"
            className="text-gray-600 hover:text-[#D4AF37] transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="text-gray-600 hover:text-[#D4AF37] transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-2 flex flex-col divide-y divide-gray-100">
            {NAV_ALL.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`py-4 text-sm font-black tracking-widest uppercase transition-colors ${
                  pathname.startsWith(item.href) ? 'text-[#D4AF37]' : 'text-gray-700 hover:text-[#D4AF37]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Gold trending bar ── */}
      <div className="bg-[#D4AF37] py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-white font-black text-xs tracking-widest mr-4 flex-shrink-0 uppercase">
              Trending:
            </span>
            <div className="flex items-center text-xs">
              {TRENDING.map((item, i) => (
                <span key={item.href} className="flex items-center">
                  {i > 0 && <span className="text-white/40 mx-3">|</span>}
                  <Link
                    href={item.href}
                    className="text-white hover:text-white/80 font-semibold tracking-wide uppercase whitespace-nowrap transition-opacity"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </header>
  )
}
