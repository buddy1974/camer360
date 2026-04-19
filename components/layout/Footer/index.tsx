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
              { href: '/celebrities',   label: 'Celebrities' },
              { href: '/music',         label: 'Music' },
              { href: '/film-tv',       label: 'Film & TV' },
              { href: '/sport-stars',   label: 'Sport Stars' },
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
              { href: '/influencers',      label: 'Influencers' },
              { href: '/entrepreneurs',    label: 'Entrepreneurs' },
              { href: '/events',           label: 'Events' },
              { href: '/timelines',        label: 'Celebrity Timelines' },
              { href: '/family-trees',     label: 'Family Trees' },
              { href: '/ones-to-watch',    label: 'Ones to Watch' },
              { href: '/cultural-moments', label: 'Cultural Moments' },
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
              { href: '/about',           label: 'About Camer360' },
              { href: '/contact',         label: 'Contact Us' },
              { href: '/newsletter',      label: 'Newsletter' },
              { href: '/advertise',       label: 'Advertise' },
              { href: '/rss',             label: 'RSS Feed' },
              { href: '/privacy',         label: 'Privacy Policy' },
              { href: '/terms',           label: 'Terms of Service' },
              { href: '/content-policy',  label: 'Content Policy' },
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
          <span style={{ display: 'block', fontSize: '0.68rem', color: '#444', marginTop: '4px' }}>
            This site displays Google AdSense advertisements. Ads are clearly labelled and do not influence editorial content.
          </span>
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
