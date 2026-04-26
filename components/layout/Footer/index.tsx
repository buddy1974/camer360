import Link from 'next/link'
import { Mail } from 'lucide-react'
import { SITE_NAME, SITE_FB, SITE_TWITTER } from '@/lib/constants'
import { FooterNewsletter } from '@/components/newsletter/FooterNewsletter'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--gradient-onyx)', color: '#F5F5F0' }}>

      {/* ── Top accent line ── */}
      <div style={{ height: '2px', background: 'var(--gradient-gold)' }} />

      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '64px 32px 0' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap:                 '48px',
        }}>

          {/* ── Brand column ── */}
          <div>
            {/* Logo mark */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '20px' }}>
              <div style={{
                width:          '44px',
                height:         '44px',
                borderRadius:   '50%',
                background:     'var(--gradient-gold)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" style={{ height: '28px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#F5F5F0' }}>
                  Camer<span style={{ color: 'hsl(var(--gold))' }}>360</span>
                </div>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', marginTop: '2px' }}>
                  Cameroon&rsquo;s Premier Lifestyle Magazine
                </div>
              </div>
            </Link>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '280px', marginBottom: '28px' }}>
              Editorial storytelling at the intersection of African entertainment, culture and ambition.
              From Yaoundé to Lagos, Brussels to D.C.
            </p>

            {/* Newsletter mini form */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>
                Newsletter
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', lineHeight: 1.6 }}>
                Cameroon stories, Central &amp; West African culture — delivered weekly.
              </p>
              <FooterNewsletter />
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { href: SITE_FB,                                                          label: 'Facebook',  d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', fill: true },
                { href: `https://twitter.com/${(SITE_TWITTER ?? '').replace('@', '')}`,   label: 'X',         d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', fill: true },
                { href: 'https://instagram.com/camer360',                                 label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.07 4.849c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.334-2.633 1.308-3.608C4.516 2.568 5.783 2.296 7.149 2.234 8.415 2.175 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z', fill: true },
                { href: 'https://www.youtube.com/channel/UCVOFAEB15N3WA8FiOhJ8BKg',      label: 'YouTube',   d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', fill: true },
                { href: '/newsletter',                                                     label: 'Newsletter', icon: <Mail size={13} /> },
              ].map(({ href, label, d, fill, icon }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer" aria-label={label}
                  style={{ width:'36px', height:'36px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', transition:'all 0.3s', textDecoration:'none' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'hsl(var(--gold))'; el.style.color = 'hsl(var(--gold))' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.12)'; el.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  {icon ?? (d && <svg width="13" height="13" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2"><path d={d}/></svg>)}
                </a>
              ))}
            </div>
          </div>

          {/* ── Entertainment ── */}
          <div>
            <h3 className="eyebrow" style={{ color: 'hsl(var(--gold))', marginBottom: '18px', fontSize: '11px' }}>Entertainment</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/celebrities',  label: 'Celebrities' },
                { href: '/music',        label: 'Music' },
                { href: '/film-tv',      label: 'Film & TV' },
                { href: '/sport-stars',  label: 'Sport Stars' },
                { href: '/influencers',  label: 'Influencers' },
                { href: '/entrepreneurs',label: 'Entrepreneurs' },
                { href: '/events',       label: 'Events' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link" style={{
                    fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Culture ── */}
          <div>
            <h3 className="eyebrow" style={{ color: 'hsl(var(--gold))', marginBottom: '18px', fontSize: '11px' }}>Culture</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/timelines',        label: 'Celebrity Timelines' },
                { href: '/family-trees',     label: 'Family Trees' },
                { href: '/ones-to-watch',    label: 'Ones to Watch' },
                { href: '/cultural-moments', label: 'Cultural Moments' },
                { href: '/music/afrobeats',  label: 'Afrobeats Chart' },
                { href: '/music/videos',     label: 'Music Videos' },
                { href: '/music/new-releases', label: 'New Releases' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link" style={{
                    fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h3 className="eyebrow" style={{ color: 'hsl(var(--gold))', marginBottom: '18px', fontSize: '11px' }}>Company</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/about',          label: 'About Camer360' },
                { href: '/contact',        label: 'Contact Us' },
                { href: '/newsletter',     label: 'Newsletter' },
                { href: '/advertise',      label: 'Advertise' },
                { href: '/rss',            label: 'RSS Feed' },
                { href: '/privacy',        label: 'Privacy Policy' },
                { href: '/terms',          label: 'Terms of Service' },
                { href: '/content-policy', label: 'Content Policy' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link" style={{
                    fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Gold divider + bottom bar ── */}
        <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '32px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            © {year} {SITE_NAME}. Made in Cameroon, for Africa.
          </p>
          <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
            Central &amp; West Africa&rsquo;s #1 Entertainment Platform
          </div>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {[
              { href: '/privacy',   label: 'Privacy' },
              { href: '/advertise', label: 'Advertise' },
              { href: '/contact',   label: 'Contact' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
