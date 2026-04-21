import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title:       `Editorial Guidelines | ${SITE_NAME}`,
  description: `How Camer360 creates, verifies and publishes entertainment journalism covering African celebrities, music, film, sport stars and culture.`,
  alternates: { canonical: `${SITE_URL}/editorial-guidelines` },
}

const SECTION: React.CSSProperties = { marginBottom: '40px' }
const H2: React.CSSProperties = { fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '12px', letterSpacing: '-0.01em' }
const P: React.CSSProperties  = { fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.8, marginBottom: '12px' }
const LI: React.CSSProperties = { fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.8, marginBottom: '6px' }

export default function EditorialGuidelinesPage() {
  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--grad-dark)', padding: '64px 40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>Editorial Guidelines</span>
          </nav>
          <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
            About Our Journalism
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: 'white', marginTop: '8px', lineHeight: 1.1 }}>
            Editorial Guidelines
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginTop: '12px' }}>
            Last updated: April 2026
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px 80px' }}>

        <div style={SECTION}>
          <h2 style={H2}>Our Mission</h2>
          <p style={P}>
            Camer360 is West and Central Africa&apos;s premier entertainment magazine. We cover celebrities, music, film, sport stars, influencers, entrepreneurs and cultural events — with Cameroon at the heart of our editorial focus.
          </p>
          <p style={P}>
            Our mission is to celebrate African talent, amplify African voices, and provide accurate, engaging entertainment journalism to audiences across the continent and the global diaspora.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Editorial Independence</h2>
          <p style={P}>
            Our editorial team operates independently from advertising and commercial interests. Coverage decisions — including which artists, athletes and public figures receive editorial attention — are made solely on the basis of newsworthiness and cultural relevance.
          </p>
          <p style={P}>
            Paid promotional content, advertorials and sponsored posts are always clearly labelled as such. They are never presented as independent editorial coverage.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Accuracy & Verification</h2>
          <p style={P}>We are committed to accuracy in all our reporting. Our verification process includes:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={LI}>Confirming news from at least two independent sources before publication</li>
            <li style={LI}>Using official statements, verified social media accounts and credentialed sources</li>
            <li style={LI}>Clearly distinguishing between confirmed facts, reports and rumours</li>
            <li style={LI}>Labelling all AI-assisted or AI-generated content</li>
            <li style={LI}>Publishing corrections promptly — see our <Link href="/corrections-policy" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Corrections Policy</Link></li>
          </ul>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Source Standards</h2>
          <p style={P}>
            We use named sources wherever possible. Anonymous sources are used only when there is a compelling editorial reason and when the information cannot be confirmed on the record. We do not pay for information.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Privacy & Public Interest</h2>
          <p style={P}>
            We respect the privacy of individuals, including public figures, in their personal and family lives. We publish private information only when there is a clear and justifiable public interest, and never to satisfy curiosity alone.
          </p>
          <p style={P}>
            We do not publish information about minors without exceptional justification. We take particular care when covering sensitive topics including health, relationships and personal struggles.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Opinion & Analysis</h2>
          <p style={P}>
            Opinion pieces, commentary and analysis are clearly labelled as such and represent the views of the named author, not of Camer360 as an organisation. The AI Perspectives feature on article pages is clearly identified as AI-generated and does not represent Camer360&apos;s editorial position.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Social Media</h2>
          <p style={P}>
            Camer360 staff use social media to share our journalism and engage with our audience. Personal accounts are the views of the individual, not of Camer360. We do not publish screenshots of private messages or direct messages without consent.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Contact the Newsroom</h2>
          <p style={P}>
            To report an error, submit a tip or contact our editorial team, please use the form on our <Link href="/contact" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Contact page</Link>.
          </p>
        </div>

      </div>
    </div>
  )
}
