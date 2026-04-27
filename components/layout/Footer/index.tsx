import Link from 'next/link'
import { Mail } from 'lucide-react'
import { SITE_NAME, SITE_FB, SITE_TWITTER } from '@/lib/constants'
import { FooterNewsletter } from '@/components/newsletter/FooterNewsletter'

const SECTIONS = [
  { href: '/celebrities',   label: 'Celebrities'   },
  { href: '/music',         label: 'Music'         },
  { href: '/film-tv',       label: 'Film & TV'     },
  { href: '/sport-stars',   label: 'Sport Stars'   },
  { href: '/influencers',   label: 'Influencers'   },
  { href: '/entrepreneurs', label: 'Entrepreneurs' },
  { href: '/events',        label: 'Events'        },
]

const COMPANY = [
  { href: '/about',          label: 'About Camer360' },
  { href: '/contact',        label: 'Contact Us'     },
  { href: '/advertise',      label: 'Advertise'      },
  { href: '/newsletter',     label: 'Newsletter'     },
  { href: '/rss',            label: 'RSS Feed'       },
]

const LEGAL = [
  { href: '/privacy',        label: 'Privacy Policy'  },
  { href: '/terms',          label: 'Terms of Service'},
  { href: '/content-policy', label: 'Content Policy'  },
]

const SOCIALS = [
  { href: SITE_FB, label: 'Facebook', d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
  { href: `https://twitter.com/${(SITE_TWITTER ?? '').replace('@', '')}`, label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://instagram.com/camer360', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.07 4.849c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.334-2.633 1.308-3.608C4.516 2.568 5.783 2.296 7.149 2.234 8.415 2.175 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { href: 'https://www.youtube.com/channel/UCVOFAEB15N3WA8FiOhJ8BKg', label: 'YouTube', d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { href: '/newsletter', label: 'Newsletter', icon: <Mail size={13} /> },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-onyx text-ivory">
      {/* Gold top accent */}
      <div className="h-[2px] bg-gradient-gold" />

      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10">

          {/* ── Brand column ── */}
          <div className="col-span-2 lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" style={{ height: '24px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">Camer<span className="text-gold">360</span></div>
                <div className="eyebrow text-ivory/40 mt-1" style={{ fontSize: '10px' }}>Cameroon&rsquo;s Premier Lifestyle Magazine</div>
              </div>
            </Link>
            <p className="text-sm text-ivory/60 max-w-md leading-relaxed mb-8">
              Editorial storytelling at the intersection of African entertainment, culture and ambition.
              From Yaoundé to Lagos, Brussels to D.C.
            </p>

            {/* Newsletter mini-form */}
            <div className="mb-8">
              <p className="eyebrow text-ivory/40 mb-2" style={{ fontSize: '10px' }}>Newsletter</p>
              <p className="text-xs text-ivory/35 mb-3 leading-relaxed">
                Cameroon stories, Central &amp; West African culture — delivered weekly.
              </p>
              <FooterNewsletter />
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ href, label, d, icon }) => (
                <a key={label} href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 hover:border-gold hover:text-gold transition-colors duration-300"
                >
                  {icon ?? (d && <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>)}
                </a>
              ))}
            </div>
          </div>

          {/* ── Sections ── */}
          <div className="lg:col-span-3">
            <div className="eyebrow text-gold mb-5">Sections</div>
            <ul className="space-y-3">
              {SECTIONS.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link text-sm text-ivory/70 hover:text-ivory transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div className="lg:col-span-2">
            <div className="eyebrow text-gold mb-5">Camer360</div>
            <ul className="space-y-3">
              {COMPANY.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link text-sm text-ivory/70 hover:text-ivory transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ── */}
          <div className="lg:col-span-2">
            <div className="eyebrow text-gold mb-5">Legal</div>
            <ul className="space-y-3">
              {LEGAL.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="story-link text-sm text-ivory/70 hover:text-ivory transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-ivory/10 pt-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ivory/40">
            © {year} {SITE_NAME} Media. Made in Cameroon, for Africa.
          </div>
          <div className="font-mono text-[10px] text-ivory/25">
            Central &amp; West Africa&rsquo;s #1 Entertainment Platform
          </div>
          <nav className="flex items-center gap-5">
            {[
              { href: '/privacy',   label: 'Privacy'   },
              { href: '/advertise', label: 'Advertise' },
              { href: '/contact',   label: 'Contact'   },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="story-link text-[11px] uppercase tracking-[0.12em] text-ivory/35 hover:text-ivory/70 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
