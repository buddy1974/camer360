'use client'
import { useState } from 'react'
import Link from 'next/link'

const inputS: React.CSSProperties = { width: '100%', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '12px 14px', color: '#EEE', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
const labelS: React.CSSProperties = { display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }

export default function TipPage() {
  const [form, setForm] = useState({ name: '', contact: '', tip: '', category: 'celebrities' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.tip.trim() || form.tip.trim().length < 30) return
    setStatus('sending')
    try {
      const r = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(r.ok ? 'sent' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--grad-dark)', padding: '64px 40px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>Tip the Newsroom</span>
          </nav>
          <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
            Got the inside scoop?
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 700, color: 'white', marginTop: '8px', lineHeight: 1.1 }}>
            Tip the Newsroom
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: '10px', lineHeight: 1.7 }}>
            Have a story, sighting or scoop? Send it to our editors. All tips are confidential. We protect our sources.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '56px 40px 80px' }}>

        {status === 'sent' ? (
          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '48px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🙏</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '10px' }}>
              Thank you — tip received
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 24px' }}>
              Our editors review every tip. If we publish a story based on your information, we&apos;ll credit you as agreed.
            </p>
            <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(45deg, #D4AF37, #F0D060)', color: '#1A1A1A', padding: '10px 24px', borderRadius: '24px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Back to Homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '40px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={labelS}>Your tip *</label>
              <textarea
                value={form.tip}
                onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                placeholder="Tell us what you know — who, what, where, when. The more detail, the better."
                rows={6}
                required
                minLength={30}
                style={{ ...inputS, resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px' }}>Minimum 30 characters</p>
            </div>

            <div>
              <label style={labelS}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ ...inputS, cursor: 'pointer' }}
              >
                {['celebrities', 'music', 'film-tv', 'sport-stars', 'influencers', 'entrepreneurs', 'events'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelS}>Name (optional)</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Anonymous" style={inputS} />
              </div>
              <div>
                <label style={labelS}>Contact (optional)</label>
                <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Email or WhatsApp" style={inputS} />
              </div>
            </div>

            <div style={{ background: '#F9F7F4', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px 16px', fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.6 }}>
              🔒 <strong>Confidentiality:</strong> Your identity is never shared without your consent. Contact details are optional and used only to follow up if needed. All submissions are encrypted in transit.
            </div>

            {status === 'error' && (
              <p style={{ fontSize: '0.82rem', color: '#EF4444' }}>Something went wrong — please try again or email us directly.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || form.tip.trim().length < 30}
              style={{
                background: form.tip.trim().length >= 30 ? 'linear-gradient(45deg, #D4AF37, #F0D060)' : '#E5E7EB',
                color: form.tip.trim().length >= 30 ? '#1A1A1A' : '#9CA3AF',
                border: 'none', padding: '14px 32px', borderRadius: '24px',
                fontSize: '0.85rem', fontWeight: 800, cursor: form.tip.trim().length >= 30 ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                transition: 'all 0.15s',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send Tip to Newsroom →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
