import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Camer360',
  description: 'Terms of Service for Camer360 — West & Central Africa\'s premier entertainment magazine.',
}

const h2Style: React.CSSProperties = {
  fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem',
}
const pStyle: React.CSSProperties = {
  marginBottom: '1.2rem',
}

export default function TermsPage() {
  return (
    <div className="static-page" style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 80px' }}>

      {/* Header */}
      <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
        Legal
      </span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, marginBottom: '12px' }}>
        Terms of Service
      </h1>
      <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '40px' }}>Last updated: April 2026</p>

      {/* Publisher info box */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
          Publisher Information
        </div>
        <div style={{ color: '#BBBBBB', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <strong style={{ color: '#EEE' }}>Camer360</strong><br />
          PO Box 1926, Bamenda<br />
          North West Region, Cameroon<br />
          Phone: <a href="tel:+23769985745" style={{ color: '#D4AF37', textDecoration: 'none' }}>+237 69985745</a><br />
          Email: <a href="mailto:info@camer360.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>info@camer360.com</a>
        </div>
      </div>

      <div style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}>

        <h2 style={h2Style}>1. Acceptance of Terms</h2>
        <p style={pStyle}>
          By accessing or using Camer360 (<strong style={{ color: '#EEE' }}>camer360.com</strong>), you agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use our website.
          We reserve the right to modify these terms at any time; continued use of the site
          constitutes acceptance of any changes.
        </p>

        <h2 style={h2Style}>2. Content &amp; Intellectual Property</h2>
        <p style={pStyle}>
          All content published on Camer360 — including articles, photographs, graphics, video and
          audio — is the exclusive property of Camer360 or used under licence and is protected by
          copyright law. You may not reproduce, distribute, modify or create derivative works without
          prior written permission.
        </p>
        <p style={pStyle}>
          Short quotations (under 100 words) with a clear attribution link back to the original
          article are permitted for editorial commentary and news aggregation purposes.
        </p>

        <h2 style={h2Style}>3. User Submissions</h2>
        <p style={pStyle}>
          When you submit tips, story leads, photographs or other content to Camer360, you grant us
          a non-exclusive, worldwide, royalty-free licence to use, edit, publish and distribute that
          content across our platforms. You confirm that you hold the rights to any content you submit
          and that it does not infringe any third-party rights.
        </p>
        <p style={pStyle}>
          We reserve the right to decline, edit or remove any submission at our editorial discretion.
          Submission does not guarantee publication.
        </p>

        <h2 style={h2Style}>4. Editorial Independence</h2>
        <p style={pStyle}>
          Camer360 maintains a strict separation between editorial content and commercial activity.
          All paid promotions, sponsored articles and advertising placements are clearly labelled as
          such. Our editorial team operates independently of our commercial team and advertising
          partners have no influence over editorial decisions.
        </p>
        <p style={pStyle}>
          We are committed to accuracy and fairness. Corrections are published promptly when errors
          are identified. To request a correction, contact <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a>.
        </p>

        <h2 style={h2Style}>5. Prohibited Uses</h2>
        <p style={pStyle}>You agree not to:</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.2rem', lineHeight: 2 }}>
          <li>Scrape, crawl or systematically download content from our site</li>
          <li>Reproduce or republish our articles in full without written permission</li>
          <li>Use our content for training AI models or similar automated systems</li>
          <li>Use our brand, logo or name in a way that implies endorsement</li>
          <li>Attempt to interfere with the security or functionality of the site</li>
          <li>Submit false, misleading or defamatory content to our editorial team</li>
        </ul>

        <h2 style={h2Style}>6. Advertising &amp; Third-Party Links</h2>
        <p style={pStyle}>
          We display advertising through Google AdSense and direct partnerships. We are not responsible
          for the content of advertisements or the practices of advertisers. Our site contains links to
          third-party websites; we are not responsible for their content or privacy practices.
        </p>

        <h2 style={h2Style}>7. Disclaimers &amp; Limitation of Liability</h2>
        <p style={pStyle}>
          Content on Camer360 is provided for informational and entertainment purposes only. While we
          strive for accuracy, we make no warranties regarding the completeness or reliability of any
          content. Camer360 shall not be liable for any direct, indirect, incidental or consequential
          damages arising from your use of this site.
        </p>

        <h2 style={h2Style}>8. Governing Law</h2>
        <p style={pStyle}>
          These Terms of Service are governed by the laws of the Republic of Cameroon. Any disputes
          arising from use of this website shall be subject to the exclusive jurisdiction of the courts
          of Cameroon.
        </p>

        <h2 style={h2Style}>9. Contact</h2>
        <p style={pStyle}>
          For legal enquiries, licensing requests or to report a content violation:<br />
          <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a><br />
          Camer360 · PO Box 1926 · Bamenda · Cameroon
        </p>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ border: '1px solid #2A2A2A', color: '#888', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/contact" style={{ border: '1px solid #2A2A2A', color: '#888', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  )
}
