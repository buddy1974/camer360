import type { Metadata } from 'next'
import Link from 'next/link'
import SubscribeForm from '@/components/newsletter/SubscribeForm'

export const metadata: Metadata = {
  title: 'Newsletter | Camer360',
  description: "Subscribe to Camer360's free newsletter — weekly celebrity news, music, film and cultural stories from West & Central Africa delivered to your inbox.",
}

const BENEFITS = [
  { icon: '⭐', title: 'Breaking Celebrity News',    desc: 'First to know when your favourite African stars make headlines.' },
  { icon: '🎵', title: 'Music & Film Highlights',   desc: 'New releases, album reviews, film premieres and industry moves.' },
  { icon: '🏆', title: 'Exclusive Interviews',       desc: 'Behind-the-scenes access to Cameroon\'s biggest entertainers.' },
  { icon: '🎉', title: 'Events Coverage',            desc: 'Galas, concerts and cultural events across Africa and the diaspora.' },
]

export default function NewsletterPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#D4AF37',
        }}>
          Newsletter
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1 }}>
          Stay in the Loop
        </h1>
        <p style={{ color: '#888', fontSize: '1rem', marginTop: '16px', lineHeight: 1.7 }}>
          The pulse of African celebrity, music and culture — delivered free to your inbox every week.
        </p>
      </div>

      {/* Benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
        {BENEFITS.map(b => (
          <div key={b.title} style={{
            background: '#111', border: '1px solid #1E1E1E',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{b.icon}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EEE', marginBottom: '4px' }}>{b.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Subscribe form */}
      <SubscribeForm source="newsletter-page" />

      {/* Frequency + privacy note */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
          Weekly digest + breaking stories when news happens.{' '}
          No spam. Unsubscribe at any time.{' '}
          <Link href="/privacy" style={{ color: '#D4AF37', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </div>

    </div>
  )
}
