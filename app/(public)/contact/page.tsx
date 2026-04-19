import type { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Camer360',
  description: 'Contact Camer360 — West & Central Africa\'s entertainment magazine. Reach our editorial team, advertising department or send a story tip.',
}

const EMAILS = [
  { icon: '✉️', title: 'General Inquiries',  email: 'info@camer360.com',  desc: 'Questions, partnerships, general contact' },
  { icon: '📰', title: 'News & Story Tips',   email: 'tips@camer360.com',  desc: 'Breaking news, exclusive stories, tips' },
  { icon: '📢', title: 'Advertising',          email: 'ads@camer360.com',   desc: 'Ad placements, sponsorships, partnerships' },
  { icon: '⚖️', title: 'Legal & Corrections',  email: 'info@camer360.com',  desc: 'Corrections, takedown requests, legal matters' },
]

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
        Contact
      </span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, marginBottom: '12px' }}>
        Get In Touch
      </h1>
      <p style={{ color: '#888', fontSize: '1rem', marginBottom: '40px', lineHeight: 1.7 }}>
        Our editorial team is based in Bamenda, Cameroon. We cover West &amp; Central Africa
        and the global diaspora — reach us anytime.
      </p>

      {/* Address + Phone block */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
          Our Office
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ color: '#BBBBBB', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <strong style={{ color: '#EEE' }}>Camer360</strong><br />
            PO Box 1926<br />
            Bamenda, North West Region<br />
            Cameroon
          </div>
          <div style={{ color: '#BBBBBB', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <strong style={{ color: '#EEE' }}>Phone</strong><br />
            <a href="tel:+23769985745" style={{ color: '#D4AF37', textDecoration: 'none' }}>+237 69985745</a>
            <br /><br />
            <strong style={{ color: '#EEE' }}>General Email</strong><br />
            <a href="mailto:info@camer360.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>info@camer360.com</a>
          </div>
        </div>
      </div>

      {/* Email tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
        {EMAILS.map(item => (
          <div key={item.title} style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#EEE', marginBottom: '4px' }}>{item.title}</div>
            <a href={`mailto:${item.email}`} style={{ fontSize: '0.8rem', color: '#D4AF37', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>{item.email}</a>
            <div style={{ fontSize: '0.72rem', color: '#555' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div style={{ marginBottom: '40px' }}>
        <ContactForm />
      </div>

      {/* Social media */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
          Follow Us
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://www.facebook.com/camer360" target="_blank" rel="noopener noreferrer"
            style={{ background: '#1877F2', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Facebook
          </a>
          <a href="https://twitter.com/Camer360" target="_blank" rel="noopener noreferrer"
            style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            X / Twitter
          </a>
          <a href="https://instagram.com/camer360" target="_blank" rel="noopener noreferrer"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Instagram
          </a>
        </div>
      </div>

    </div>
  )
}
