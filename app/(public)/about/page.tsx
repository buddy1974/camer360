import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "About Camer360 | West & Central Africa's Entertainment Magazine",
  description: "Camer360 is West & Central Africa's premier entertainment magazine — celebrities, music, film, sport stars, style and culture from Cameroon to the diaspora.",
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          About Us
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          360° of African Entertainment
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', marginTop: '16px', lineHeight: 1.7 }}>
          The pulse of celebrity, music, film and culture across Cameroon, West &amp; Central Africa, and the global African diaspora.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {[
          { number: '500K+', label: 'Monthly Readers'    },
          { number: '8',     label: 'Content Categories' },
          { number: '3',     label: 'Continents Covered' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#D4AF37' }}>{stat.number}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong style={{ color: '#EEE' }}>Camer360</strong> is West &amp; Central Africa&rsquo;s premier
          entertainment magazine — your definitive source for celebrity news, music, film &amp; TV,
          sport stars, fashion, entrepreneurship and diaspora culture. We put Cameroon at the heart
          of the African entertainment conversation.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          From the red carpets of Yaoundé and Douala to the stages of Lagos, Accra, Paris and New York,
          we track the stories, trends and personalities that define African pop culture. Our team of
          writers, photographers and cultural correspondents operates across Cameroon, the continent
          and the diaspora.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          We cover eight content verticals —{' '}
          {['Celebrities', 'Music', 'Film & TV', 'Sport Stars', 'Style', 'Entrepreneurs', 'USA', 'Europe'].map((cat, i, arr) => (
            <span key={cat}><strong style={{ color: '#EEE' }}>{cat}</strong>{i < arr.length - 1 ? ', ' : ''}</span>
          ))}
          {' '}— chosen to reflect the full spectrum of African achievement and ambition.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem' }}>Our Mission</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          To celebrate African excellence. We believe the continent&rsquo;s entertainers, athletes,
          entrepreneurs and cultural icons deserve world-class coverage — on their own terms, told
          by people who understand the culture. Camer360 gives Africa&rsquo;s stars their moment.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem' }}>Diaspora Focus</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Millions of Cameroonians and Africans live across the USA, Europe and beyond. Our dedicated
          USA and Europe sections bridge the gap — bringing diaspora stories home and connecting the
          homeland to African voices shaping culture abroad.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem' }}>Advertise With Us</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Reach a highly engaged audience of African entertainment fans across web, social and
          newsletter. For partnership and advertising enquiries, contact our commercial team.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', margin: '2.5rem 0 1rem' }}>Contact</h2>
        <p>
          Editorial: <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a><br />
          Advertising: <a href="mailto:ads@camer360.com" style={{ color: '#D4AF37' }}>ads@camer360.com</a><br />
          Press releases &amp; tips: <a href="mailto:tips@camer360.com" style={{ color: '#D4AF37' }}>tips@camer360.com</a>
        </p>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/advertise" style={{ background: '#D4AF37', color: '#1A1A1A', padding: '12px 24px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Advertise
          </Link>
          <Link href="/contact" style={{ border: '1px solid #2A2A2A', color: '#888', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  )
}
