import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Camer360',
  description: 'Privacy Policy for Camer360 — how we collect, use and protect your personal data.',
}

const h2Style: React.CSSProperties = {
  fontSize: '1.1rem', fontWeight: 800, color: '#D4AF37', marginBottom: '8px',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

      <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
        Legal
      </span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, marginBottom: '12px' }}>
        Privacy Policy
      </h1>
      <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '8px' }}>Last updated: April 2026</p>

      {/* Legal entity */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
        <div style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.7 }}>
          This Privacy Policy applies to <strong style={{ color: '#EEE' }}>Camer360</strong>, the data controller,
          located at PO Box 1926, Bamenda, Cameroon.
          Contact for privacy matters: <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a>
        </div>
      </div>

      <div style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you subscribe to our newsletter,
          submit a story tip, or contact us. We also collect usage data including pages visited, time spent
          on site, and referring URLs through analytics tools (Google Analytics). If you comment on articles,
          your name and comment text are stored.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>2. How We Use Information</h2>
          <p>We use the information we collect to operate and improve our website, respond to enquiries,
          send newsletters to subscribers, display relevant advertising, and analyse how our content is used.
          We do not sell your personal data to third parties.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>3. Cookies</h2>
          <p>We use cookies to improve your experience. These include essential cookies required for site
          functionality, analytics cookies (Google Analytics) that help us understand visitor behaviour,
          and advertising cookies (Google AdSense) for personalised ads. You can disable cookies in your
          browser settings or opt out of personalised advertising at
          {' '}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>Google Ads Settings</a>.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>4. Advertising</h2>
          <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based
          on your prior visits to our site or other sites. You can opt out of personalised advertising
          by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>
            Google&rsquo;s Ads Settings
          </a>.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>5. Third-Party Services</h2>
          <p>Our site may contain links to third-party websites and social media platforms. We are not
          responsible for the privacy practices of those sites. We encourage you to read their privacy
          policies. We use Cloudflare for performance and security — see{' '}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>
            Cloudflare&rsquo;s Privacy Policy
          </a>.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>6. Data Retention</h2>
          <p>Newsletter subscription data is retained for as long as you remain subscribed. Contact form
          submissions and story tips are retained for up to 2 years. Analytics data is retained in
          aggregate form. You may request deletion of your data at any time (see Your Rights below).</p>
        </div>

        {/* Full GDPR Rights section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>7. Your Rights</h2>
          <p style={{ marginBottom: '1rem' }}>
            Under GDPR and applicable data protection law, you have the following rights regarding
            your personal data:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 2.2 }}>
            <li><strong style={{ color: '#EEE' }}>Right to Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Rectification</strong> — request correction of inaccurate or incomplete data.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Erasure ("Right to be Forgotten")</strong> — request deletion of your personal data where there is no legitimate reason for us to continue processing it.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Restriction</strong> — request that we limit how we process your data in certain circumstances.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Data Portability</strong> — receive your personal data in a structured, machine-readable format.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Object</strong> — object to processing based on legitimate interests or for direct marketing.</li>
            <li><strong style={{ color: '#EEE' }}>Right to Withdraw Consent</strong> — withdraw consent at any time where processing is based on consent (e.g. newsletter).</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            To exercise any of these rights, contact our Data Protection Officer at{' '}
            <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a>.
            We will respond within 30 days.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>8. Children&rsquo;s Privacy</h2>
          <p>Camer360 is not directed at children under 13. We do not knowingly collect personal data
          from children. If you believe we have inadvertently collected data from a child, please
          contact us immediately.</p>
        </div>

        {/* DPO contact box */}
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '24px', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
            Data Protection Contact
          </div>
          <div style={{ color: '#BBBBBB', fontSize: '0.88rem', lineHeight: 1.8 }}>
            For all privacy and data protection enquiries, including Right to be Forgotten requests:<br /><br />
            <strong style={{ color: '#EEE' }}>Camer360 — Data Protection</strong><br />
            PO Box 1926, Bamenda, Cameroon<br />
            Email: <a href="mailto:info@camer360.com" style={{ color: '#D4AF37' }}>info@camer360.com</a><br />
            Phone: <a href="tel:+23769985745" style={{ color: '#D4AF37' }}>+237 69985745</a>
          </div>
        </div>

      </div>
    </div>
  )
}
