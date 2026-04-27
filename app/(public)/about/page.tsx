import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "About Camer360 | West & Central Africa's Entertainment Magazine",
  description: "Camer360 is West & Central Africa's premier entertainment magazine — celebrities, music, film, sport stars, influencers, entrepreneurs and events from Cameroon to the world.",
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div className="eyebrow text-gold mb-3 flex items-center gap-3">
          <span className="gold-rule" />
          About Us
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'hsl(20 14% 8%)', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          360° of African Entertainment
        </h1>
        <p style={{ color: 'hsl(20 10% 40%)', fontSize: '1.1rem', lineHeight: 1.75 }}>
          The pulse of celebrity, music, film and culture across Cameroon, West &amp; Central Africa, and the global African diaspora.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '56px' }}>
        {[
          { number: '500K+', label: 'Monthly Readers'    },
          { number: '7',     label: 'Content Categories' },
          { number: '3',     label: 'Continents Covered' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid hsl(30 12% 88%)', borderRadius: '8px', padding: '24px', textAlign: 'center', borderTop: '2px solid hsl(var(--gold))' }}>
            <div className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--gold))' }}>{stat.number}</div>
            <div style={{ fontSize: '11px', color: 'hsl(20 10% 40%)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Body — editorial prose */}
      <div style={{ color: 'hsl(20 14% 18%)', lineHeight: 1.85, fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '1.75rem' }}>
          <strong style={{ color: 'hsl(20 14% 8%)' }}>Camer360</strong> is West &amp; Central Africa&rsquo;s premier
          entertainment magazine — your definitive source for celebrity news, music, film &amp; TV,
          sport stars, fashion, entrepreneurship and diaspora culture. We put Cameroon at the heart
          of the African entertainment conversation.
        </p>
        <p style={{ marginBottom: '1.75rem' }}>
          From the red carpets of Yaoundé and Douala to the stages of Lagos, Accra, Paris and New York,
          we track the stories, trends and personalities that define African pop culture. Our team of
          writers, photographers and cultural correspondents operates across Cameroon, the continent
          and the diaspora.
        </p>
        <p style={{ marginBottom: '1.75rem' }}>
          We cover eight content verticals —{' '}
          {['Celebrities', 'Music', 'Film & TV', 'Sport Stars', 'Influencers', 'Entrepreneurs', 'Events'].map((cat, i, arr) => (
            <span key={cat}><strong style={{ color: 'hsl(20 14% 8%)' }}>{cat}</strong>{i < arr.length - 1 ? ', ' : ''}</span>
          ))}
          {' '}— chosen to reflect the full spectrum of African achievement and ambition.
        </p>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Our Mission</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          To celebrate African excellence. We believe the continent&rsquo;s entertainers, athletes,
          entrepreneurs and cultural icons deserve world-class coverage — on their own terms, told
          by people who understand the culture. Camer360 gives Africa&rsquo;s stars their moment.
        </p>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Diaspora Focus</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          Millions of Cameroonians and Africans live across the USA, Europe and beyond. Our dedicated
          USA and Europe sections bridge the gap — bringing diaspora stories home and connecting the
          homeland to African voices shaping culture abroad.
        </p>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Our Editorial Team</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          Camer360 is produced by a team of writers, photographers and cultural correspondents
          operating across Cameroon, West &amp; Central Africa, and the diaspora. Our editorial
          decisions are made independently of our commercial operations — no advertiser influences
          what we cover or how we cover it.
        </p>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Publisher</h2>
        <div style={{ background: 'white', border: '1px solid hsl(30 12% 88%)', borderRadius: '8px', padding: '24px', marginBottom: '1.75rem' }}>
          <div style={{ color: 'hsl(20 14% 18%)', fontSize: '0.95rem', lineHeight: 1.9 }}>
            <strong style={{ color: 'hsl(20 14% 8%)', fontSize: '1rem' }}>Camer360</strong><br />
            PO Box 1926, Bamenda<br />
            North West Region, Cameroon<br />
            Phone: <a href="tel:+23769985745" style={{ color: 'hsl(var(--gold))', textDecoration: 'none' }}>+237 69985745</a><br />
            Email: <a href="mailto:info@camer360.com" style={{ color: 'hsl(var(--gold))', textDecoration: 'none' }}>info@camer360.com</a>
          </div>
        </div>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Advertise With Us</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          Reach a highly engaged audience of African entertainment fans across web, social and
          newsletter. For partnership and advertising enquiries, contact our commercial team.
        </p>

        <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(20 14% 8%)', margin: '2.5rem 0 1rem', borderLeft: '3px solid hsl(var(--gold))', paddingLeft: '1rem' }}>Contact</h2>
        <p style={{ marginBottom: '2rem' }}>
          Editorial: <a href="mailto:info@camer360.com" style={{ color: 'hsl(var(--gold))' }}>info@camer360.com</a><br />
          Advertising: <a href="mailto:ads@camer360.com" style={{ color: 'hsl(var(--gold))' }}>ads@camer360.com</a><br />
          Press releases &amp; tips: <a href="mailto:tips@camer360.com" style={{ color: 'hsl(var(--gold))' }}>tips@camer360.com</a>
        </p>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/advertise" style={{ background: 'hsl(var(--gold))', color: 'hsl(20 14% 8%)', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Advertise
          </Link>
          <Link href="/contact" style={{ border: '1px solid hsl(30 12% 88%)', color: 'hsl(20 14% 8%)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  )
}
