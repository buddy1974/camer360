import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Content Policy | Camer360',
  description: "Camer360's editorial standards, content policy and advertising guidelines — how we create and curate content for West & Central Africa's entertainment magazine.",
}

const h2Style: React.CSSProperties = {
  fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem',
}
const pStyle: React.CSSProperties = {
  marginBottom: '1.2rem',
}

export default function ContentPolicyPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

      <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
        Editorial
      </span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, marginBottom: '12px' }}>
        Content Policy
      </h1>
      <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '40px' }}>Last updated: April 2026</p>

      <div style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}>

        <h2 style={h2Style}>Our Editorial Standards</h2>
        <p style={pStyle}>
          Camer360 is committed to accurate, fair and responsible journalism and entertainment
          coverage. Every article published on this platform is reviewed by our editorial team
          before publication. We strive to verify information from multiple sources before
          reporting and to clearly distinguish between news reporting, analysis and opinion.
        </p>
        <p style={pStyle}>
          When errors occur, we correct them promptly and transparently. Corrections are noted
          at the top of the affected article. To report an error, contact{' '}
          <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a>.
        </p>

        <h2 style={h2Style}>Content We Publish</h2>
        <p style={pStyle}>Camer360 publishes content across 7 editorial categories:</p>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: 2.2, marginBottom: '1.2rem' }}>
          <li><strong style={{ color: '#EEE' }}>Celebrities</strong> — profiles, interviews, celebrity news from Cameroon and Africa</li>
          <li><strong style={{ color: '#EEE' }}>Music</strong> — artist features, album reviews, Afrobeats, Afropop, Cameroon music industry</li>
          <li><strong style={{ color: '#EEE' }}>Film & TV</strong> — Nollywood, Cameroon cinema, streaming, industry news</li>
          <li><strong style={{ color: '#EEE' }}>Sport Stars</strong> — athletes, sports culture, sports entertainment</li>
          <li><strong style={{ color: '#EEE' }}>Influencers</strong> — social media personalities, content creators, digital culture</li>
          <li><strong style={{ color: '#EEE' }}>Entrepreneurs</strong> — African business leaders, Forbes Africa coverage, wealth and enterprise</li>
          <li><strong style={{ color: '#EEE' }}>Events</strong> — galas, festivals, cultural events, concerts across Africa and the diaspora</li>
        </ul>
        <p style={pStyle}>
          All content is original, editorially produced or properly licensed. We do not
          publish fake news, satire presented as fact, hate speech, graphic violence, or
          sexually explicit material.
        </p>

        <h2 style={h2Style}>Image Rights &amp; Copyright</h2>
        <p style={pStyle}>
          Images published on Camer360 are either: owned by Camer360, licensed from stock
          photography providers, credited press releases with permission, or used under fair
          use for editorial commentary purposes with full credit to the copyright holder.
        </p>
        <p style={pStyle}>
          If you believe an image on this site infringes your copyright, please submit a
          DMCA takedown request to{' '}
          <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a>{' '}
          with the subject line "DMCA Request". We will respond within 5 business days.
        </p>

        <h2 style={h2Style}>User-Generated Content</h2>
        <p style={pStyle}>
          Readers may submit story tips, photographs and press releases to our editorial
          team. By submitting content, you confirm you hold the necessary rights and grant
          Camer360 a licence to use the content (see our{' '}
          <Link href="/terms" style={{ color: '#D4AF37' }}>Terms of Service</Link>).
          Submission does not guarantee publication.
        </p>
        <p style={pStyle}>
          We do not accept sponsored content disguised as editorial coverage. All paid
          placements are clearly labelled as &ldquo;Sponsored&rdquo; or &ldquo;Advertisement&rdquo;.
        </p>

        <h2 style={h2Style}>Advertising Policy</h2>
        <p style={pStyle}>
          We display advertising through Google AdSense and direct commercial partnerships.
          All advertisements are clearly distinguished from editorial content. We do not
          allow pop-up ads, auto-play video ads with sound, or advertising that mimics
          editorial content without disclosure.
        </p>
        <p style={pStyle}>
          Our editorial decisions are made independently of our advertising team. Advertisers
          have no influence over what stories we cover or how we cover them. To advertise
          on Camer360, visit our{' '}
          <Link href="/advertise" style={{ color: '#D4AF37' }}>Advertise</Link> page.
        </p>

        <h2 style={h2Style}>Prohibited Content</h2>
        <p style={pStyle}>Camer360 does not publish:</p>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: 2.2, marginBottom: '1.2rem' }}>
          <li>Hate speech targeting any ethnicity, religion, gender or sexual orientation</li>
          <li>Misinformation or deliberately false content</li>
          <li>Content that incites violence or illegal activity</li>
          <li>Explicit sexual content</li>
          <li>Content that violates the privacy of private individuals without consent</li>
          <li>Defamatory content not based on verified facts</li>
        </ul>

        <h2 style={h2Style}>Contact</h2>
        <p style={pStyle}>
          For editorial enquiries, corrections or content complaints:<br />
          <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a><br />
          Camer360 · PO Box 1926 · Bamenda · Cameroon
        </p>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ border: '1px solid #2A2A2A', color: '#888', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/privacy" style={{ border: '1px solid #2A2A2A', color: '#888', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  )
}
