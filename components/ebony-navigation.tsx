'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Mail, ShoppingBag, Menu, X } from 'lucide-react'

const NAV = [
  { label: 'ENTERTAINMENT', href: '/gossip'         },
  { label: 'STYLE',         href: '/fashion-beauty' },
  { label: 'SPORTS',        href: '/sport-stars'    },
  { label: 'CULTURE',       href: '/real-talk'      },
  { label: 'MUSIC',         href: '/music'          },
  { label: 'VIRAL',         href: '/viral'          },
  { label: 'CELEBRITIES',   href: '/celebrities'    },
]

const TRENDING = [
  { label: 'CAMER360 POWER 100',          href: '/celebrities'    },
  { label: 'AFRICAN BEAUTY AWARDS 2026',  href: '/fashion-beauty' },
  { label: 'AFROBEATS RISING STARS',      href: '/music'          },
  { label: 'DIASPORA SPOTLIGHT',          href: '/diaspora'       },
  { label: 'VIRAL THIS WEEK',             href: '/viral'          },
  { label: 'SPORT STARS TO WATCH',        href: '/sport-stars'    },
]

export default function EbonyNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Camer360" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Main Menu — desktop */}
          <div className="hidden lg:flex items-center" style={{ gap: '40px' }}>
            {NAV.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  className={`text-xl font-bold tracking-wide transition-colors uppercase ${
                    active ? 'text-[#D4AF37]' : 'text-black hover:text-[#D4AF37]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-5">
            <Link href="/newsletter" aria-label="Newsletter"
              className="hidden lg:block text-gray-600 hover:text-[#D4AF37] transition-colors">
              <Mail className="w-6 h-6" />
            </Link>
            <Link href="/search" aria-label="Search"
              className="text-gray-600 hover:text-[#D4AF37] transition-colors">
              <Search className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="lg:hidden text-gray-600 hover:text-[#D4AF37] transition-colors"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-2 flex flex-col divide-y divide-gray-100">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`py-4 text-lg font-bold tracking-wide uppercase transition-colors ${
                  pathname.startsWith(item.href) ? 'text-[#D4AF37]' : 'text-gray-700 hover:text-[#D4AF37]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Bar */}
      <div className="bg-[#D4AF37] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto whitespace-nowrap gap-0 scrollbar-none">
            <span className="font-bold mr-4 text-sm tracking-wide flex-shrink-0">TRENDING:</span>
            <div className="flex items-center gap-0 text-sm">
              {TRENDING.map((item, i) => (
                <span key={item.href} className="flex items-center">
                  {i > 0 && <span className="text-white/50 mx-3">|</span>}
                  <Link
                    href={item.href}
                    className="hover:underline transition-all font-medium tracking-wide whitespace-nowrap"
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
