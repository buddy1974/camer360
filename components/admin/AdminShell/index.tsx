'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  exact?: boolean
}

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Content',
    items: [
      { href: '/admin',                       label: 'Dashboard',     icon: '◈', exact: true },
      { href: '/admin/quick-publish',         label: 'Quick Publish', icon: '⚡' },
      { href: '/admin/articles/new',          label: 'New Article',   icon: '+' },
      { href: '/admin/articles?status=draft', label: 'Drafts',        icon: '○' },
      { href: '/admin/articles',              label: 'All Articles',  icon: '≡' },
    ],
  },
  {
    heading: 'Editorial',
    items: [
      { href: '/admin/categories',  label: 'Categories',   icon: '#' },
      { href: '/admin/comments',    label: 'Comments',     icon: '◻' },
      { href: '/admin/newsletter',  label: 'Newsletter',   icon: '◎' },
      { href: '/admin/polls',       label: 'Polls',        icon: '◑' },
    ],
  },
  {
    heading: 'Data',
    items: [
      { href: '/admin/birthdays',   label: 'Birthdays',    icon: '◇' },
      { href: '/admin/awards',      label: 'Awards',       icon: '◆' },
      { href: '/admin/rich-list',   label: 'Rich List',    icon: '◈' },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/analytics',   label: 'Analytics',    icon: '↗' },
      { href: '/admin/youtube',     label: 'YouTube',      icon: '▶' },
      { href: '/',                  label: 'View Site',    icon: '⌁', exact: true },
    ],
  },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const statusParam  = searchParams.get('status')

  function isActive(href: string, exact?: boolean): boolean {
    if (href === '/admin/articles?status=draft') {
      return pathname === '/admin/articles' && statusParam === 'draft'
    }
    if (href === '/admin/articles') {
      return pathname === '/admin/articles' && statusParam !== 'draft'
    }
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/admin'
      ? true
      : href === '/admin' && pathname === '/admin'
  }

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #141414', flexShrink: 0 }}>
        <Image src="/logo.png" alt="Camer360" width={130} height={32} style={{ objectFit: 'contain' }} />
        <div style={{ fontSize: '9px', color: '#333', marginTop: '5px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
          Editorial Admin
        </div>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.heading}>
            <div style={{
              fontSize: '9px', fontWeight: 800, color: '#2A2A2A', textTransform: 'uppercase',
              letterSpacing: '0.18em', padding: '0 8px', marginBottom: '4px',
            }}>
              {group.heading}
            </div>
            {group.items.map(item => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '7px 8px', borderRadius: '7px',
                    fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                    textDecoration: 'none', transition: 'all 0.12s',
                    color: active ? '#fff' : '#444',
                    background: active ? '#181818' : 'transparent',
                    marginBottom: '1px',
                  }}
                >
                  <span style={{
                    fontSize: '12px', width: '16px', textAlign: 'center', flexShrink: 0,
                    color: active ? '#D4AF37' : '#2E2E2E',
                  }}>{item.icon}</span>
                  {item.label}
                  {active && (
                    <span style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: pipeline shortcut + logout */}
      <div style={{ borderTop: '1px solid #141414', padding: '10px', flexShrink: 0 }}>
        <a
          href="https://n8n.maxpromo.digital"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px',
            borderRadius: '7px', fontSize: '0.72rem', color: '#2A2A2A', textDecoration: 'none',
            transition: 'color 0.12s', marginBottom: '2px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#555')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}
        >
          <span style={{ fontSize: '10px', color: '#1A1A1A' }}>⚙</span> n8n Pipeline ↗
        </a>
        <button
          onClick={() => { window.location.href = '/api/admin/logout' }}
          style={{
            display: 'flex', width: '100%', alignItems: 'center', gap: '8px',
            padding: '7px 8px', borderRadius: '7px', fontSize: '0.72rem', color: '#2A2A2A',
            background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#888')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}
        >
          <span style={{ fontSize: '10px' }}>→</span> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex' }}>

      {/* Desktop sidebar */}
      <aside style={{
        display: 'none', flexDirection: 'column', width: '210px', flexShrink: 0,
        background: '#080808', borderRight: '1px solid #141414',
      }}
        className="md-sidebar"
      >
        {/* Inline responsive via SSR-safe class trick */}
        <style>{`
          @media(min-width:768px){ .md-sidebar { display: flex !important; } }
          @media(min-width:768px){ .mobile-topbar { display: none !important; } }
        `}</style>
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpen(false)} />
          <aside style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '220px',
            background: '#080808', borderRight: '1px solid #141414',
          }}>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="mobile-topbar" style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderBottom: '1px solid #141414', background: '#080808',
        }}>
          <button
            onClick={() => setOpen(true)}
            style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '18px', padding: 0 }}
            aria-label="Open menu"
          >☰</button>
          <Image src="/logo.png" alt="Camer360" width={110} height={28} />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
