import Link from 'next/link'
import { SITE_NAME, SITE_FB, SITE_TWITTER } from '@/lib/constants'
import { FooterNewsletter } from '@/components/newsletter/FooterNewsletter'

export function Footer() {
  return (
    <footer className="ultra-premium-footer">

      <div className="footer-content">

        {/* ── Brand + Newsletter ── */}
        <div className="footer-section">
          <Link href="/" className="footer-logo">Camer360</Link>
          <p className="footer-tagline">
            Central &amp; West Africa&rsquo;s entertainment magazine with Cameroon at the heart.
            Yaoundé celebrities, Cameroonian diaspora stories, and the culture
            that defines our generation.
          </p>

          <div className="footer-newsletter">
            <p className="footer-newsletter-title">Newsletter</p>
            <p className="footer-newsletter-desc">
              Cameroon stories, Central &amp; West African culture — delivered to your inbox.
            </p>
            <FooterNewsletter />
          </div>

          {/* Social */}
          <div className="footer-social">
            {[
              { href: SITE_FB,                                                       icon: '📘', label: 'Facebook' },
              { href: `https://twitter.com/${(SITE_TWITTER ?? '').replace('@', '')}`, icon: '🐦', label: 'X' },
              { href: 'https://instagram.com/camer360',                              icon: '📷', label: 'Instagram' },
              { href: 'https://youtube.com/camer360',                               icon: '📺', label: 'YouTube' },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                className="footer-social-icon" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Entertainment ── */}
        <div className="footer-section">
          <h3 className="footer-section-title">Entertainment</h3>
          <ul className="footer-links">
            {[
              { href: '/celebrities',    label: 'Celebrities' },
              { href: '/music',          label: 'Music' },
              { href: '/film-tv',        label: 'Film & TV' },
              { href: '/fashion-beauty', label: 'Style' },
              { href: '/viral',          label: 'Viral' },
              { href: '/gossip',         label: 'Gossip' },
            ].map(item => (
              <li key={item.href} className="footer-link">
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Culture ── */}
        <div className="footer-section">
          <h3 className="footer-section-title">Culture</h3>
          <ul className="footer-links">
            {[
              { href: '/diaspora',    label: 'Diaspora' },
              { href: '/money-moves', label: 'Entrepreneurs' },
              { href: '/sport-stars', label: 'Sport Stars' },
              { href: '/influencers', label: 'Influencers' },
              { href: '/real-talk',   label: 'Real Talk' },
              { href: '/exposed',     label: 'Exposed' },
            ].map(item => (
              <li key={item.href} className="footer-link">
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-section">
          <h3 className="footer-section-title">Company</h3>
          <ul className="footer-links">
            {[
              { href: '/about',     label: 'About Camer360' },
              { href: '/contact',   label: 'Contact Us' },
              { href: '/advertise', label: 'Advertise' },
              { href: '/rss',       label: 'RSS Feed' },
              { href: '/search',    label: 'Search' },
              { href: '/privacy',   label: 'Privacy Policy' },
            ].map(item => (
              <li key={item.href} className="footer-link">
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <nav className="footer-legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

    </footer>
  )
}
