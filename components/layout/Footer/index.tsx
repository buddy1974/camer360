import Link from 'next/link'
import { SITE_NAME, SITE_FB, SITE_TWITTER } from '@/lib/constants'

const CATEGORIES = [
  { href: '/celebrities',    label: 'Celebrities' },
  { href: '/music',          label: 'Music' },
  { href: '/film-tv',        label: 'Film & TV' },
  { href: '/fashion-beauty', label: 'Fashion & Beauty' },
  { href: '/gossip',         label: 'Hot Gossip' },
  { href: '/viral',          label: 'Viral' },
]

const MORE_CATEGORIES = [
  { href: '/diaspora',    label: 'Diaspora' },
  { href: '/money-moves', label: 'Money Moves' },
  { href: '/sport-stars', label: 'Sport Stars' },
  { href: '/influencers', label: 'Influencers' },
  { href: '/real-talk',   label: 'Real Talk' },
  { href: '/exposed',     label: 'Exposed' },
]

const COMPANY = [
  { href: '/about',     label: 'About Us' },
  { href: '/contact',   label: 'Contact' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/privacy',   label: 'Privacy Policy' },
  { href: '/rss',       label: 'RSS Feed' },
  { href: '/search',    label: 'Search' },
]

const SOCIALS = [
  { href: SITE_FB,                                              label: 'Facebook' },
  { href: `https://twitter.com/${(SITE_TWITTER ?? '').replace('@', '')}`, label: 'X / Twitter' },
  { href: 'https://instagram.com/camer360',                    label: 'Instagram' },
  { href: 'https://tiktok.com/@camer360',                      label: 'TikTok' },
]

const EXPLORE_TAGS = [
  { label: 'Afrobeats',       href: '/tag/afrobeats' },
  { label: 'Nollywood',       href: '/tag/nollywood' },
  { label: 'Lagos',           href: '/tag/lagos' },
  { label: 'Douala',          href: '/tag/douala' },
  { label: 'African Fashion', href: '/tag/african-fashion' },
  { label: 'Grammy',          href: '/tag/grammy' },
  { label: 'Diaspora Life',   href: '/tag/diaspora-life' },
  { label: 'Netflix Africa',  href: '/tag/netflix-africa' },
  { label: 'AMVCA',           href: '/tag/amvca' },
  { label: 'Street Style',    href: '/tag/street-style' },
  { label: 'African Music',   href: '/tag/african-music' },
  { label: 'Celebrity News',  href: '/tag/celebrity-news' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#060606', borderTop: '1px solid rgba(212,175,55,0.08)', marginTop: '80px' }}>

      {/* Gold accent line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F7DC6F 50%, #D4AF37 80%, transparent 100%)' }} />

      {/* Main grid */}
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '56px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px' }}>

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block no-underline mb-4">
              <span style={{
                fontFamily: 'var(--font-serif), "Playfair Display", Georgia, serif',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}>
                Camer360
              </span>
            </Link>

            <div style={{ width: '32px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, #F7DC6F)', borderRadius: '1px', marginBottom: '16px' }} />

            <p style={{ color: '#444', fontSize: '0.8rem', lineHeight: 1.75, maxWidth: '220px' }}>
              West &amp; Central Africa&rsquo;s premier entertainment magazine. Celebrities, music, culture, and the stories that move the continent.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-2 mt-6">
              {SOCIALS.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#555] hover:text-[#D4AF37] transition-colors no-underline"
                  style={{
                    padding: '7px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Newsletter box */}
            <div style={{
              marginTop: '28px',
              padding: '20px',
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.12)',
              borderRadius: '10px',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#D4AF37', marginBottom: '6px' }}>
                Newsletter
              </p>
              <p style={{ fontSize: '0.72rem', color: '#444', marginBottom: '14px', lineHeight: 1.5 }}>
                African entertainment in your inbox weekly.
              </p>
              <Link
                href="/contact"
                style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #D4AF37, #F7DC6F)',
                  color: '#1A1A1A',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Subscribe Free
              </Link>
            </div>
          </div>

          {/* Entertainment */}
          <FooterLinkCol title="Entertainment" links={CATEGORIES} />

          {/* More */}
          <FooterLinkCol title="More" links={MORE_CATEGORIES} />

          {/* Company */}
          <FooterLinkCol title="Company" links={COMPANY} />

        </div>
      </div>

      {/* Tag cloud */}
      <div style={{ borderTop: '1px solid #0E0E0E' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#222', marginBottom: '14px' }}>
            Explore
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPLORE_TAGS.map(tag => (
              <Link
                key={tag.href}
                href={tag.href}
                className="text-[#333] hover:text-[#D4AF37] transition-colors no-underline whitespace-nowrap"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid #111',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                }}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #0A0A0A' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '0.62rem', color: '#222' }}>
            © {year} {SITE_NAME} · 360° of African Life
          </p>
          <div className="flex gap-5 items-center">
            {[
              { href: '/privacy',   label: 'Privacy' },
              { href: '/advertise', label: 'Advertise' },
              { href: '/contact',   label: 'Contact' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#222] hover:text-[#D4AF37] transition-colors no-underline text-[0.62rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}

function FooterLinkCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4AF37', marginBottom: '18px' }}>
        {title}
      </p>
      <ul className="list-none p-0 m-0 flex flex-col gap-[11px]">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[#555] hover:text-[#D4AF37] transition-colors no-underline text-[0.82rem]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
