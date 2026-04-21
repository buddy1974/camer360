import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title:       `Corrections Policy | ${SITE_NAME}`,
  description: `How Camer360 handles corrections, updates and clarifications to published content.`,
  alternates: { canonical: `${SITE_URL}/corrections-policy` },
}

const SECTION: React.CSSProperties = { marginBottom: '40px' }
const H2: React.CSSProperties = { fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '12px' }
const P: React.CSSProperties  = { fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.8, marginBottom: '12px' }

export default function CorrectionsPolicyPage() {
  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--grad-dark)', padding: '64px 40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>Corrections Policy</span>
          </nav>
          <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
            Accuracy & Accountability
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: 'white', marginTop: '8px', lineHeight: 1.1 }}>
            Corrections Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginTop: '12px' }}>
            Last updated: April 2026
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px 80px' }}>

        <div style={SECTION}>
          <h2 style={H2}>Our Commitment</h2>
          <p style={P}>
            Camer360 is committed to accuracy. When we make mistakes, we correct them promptly, transparently and without hesitation. Getting things right matters more than protecting our reputation.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>How We Handle Corrections</h2>
          <p style={P}>
            <strong>Factual errors</strong> — When a published article contains a verifiable factual error, we correct it directly in the article text and append a clearly labelled correction notice at the foot of the article explaining what was wrong and what the correct information is.
          </p>
          <p style={P}>
            <strong>Significant errors</strong> — Where an error materially changes the meaning or thrust of a story, we may update the headline and publish a more prominent correction notice.
          </p>
          <p style={P}>
            <strong>Updates</strong> — When a story develops after publication, we add an update notice with the date and new information rather than silently rewriting the original. The original reporting context is preserved.
          </p>
          <p style={P}>
            <strong>Clarifications</strong> — Where language was ambiguous but not factually wrong, we may add a clarification note.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>What We Do Not Do</h2>
          <p style={P}>
            We do not silently delete or rewrite published content to remove errors without noting the change. We do not remove published articles without explanation. Where an article is removed for legal reasons, we replace it with a notice explaining this.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>How to Report an Error</h2>
          <p style={P}>
            If you believe a Camer360 article contains an error, please contact us via our <Link href="/contact" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Contact page</Link>. Please include the article URL, the specific error and, if possible, a link to a reliable source with the correct information.
          </p>
          <p style={P}>
            We aim to review all correction requests within 48 hours.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Right of Reply</h2>
          <p style={P}>
            Individuals or organisations who are the subject of significant criticism in our coverage are given the opportunity to respond before publication where practicable. Responses received after publication may be added to the article.
          </p>
        </div>

      </div>
    </div>
  )
}
