'use client'
import { useState } from 'react'

export function FooterNewsletter() {
  const [email, setEmail]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]         = useState(false)
  const [msg, setMsg]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    try {
      const res  = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        setMsg("You're in. Expect Africa's best stories in your inbox.")
      } else {
        setMsg(data.error || 'Something went wrong.')
      }
    } catch {
      setMsg('Network error — please try again.')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(212,175,55,0.08)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '10px',
        color: '#D4AF37',
        fontSize: '14px',
        lineHeight: 1.5,
      }}>
        {msg}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        style={{
          padding: '14px 18px',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {msg && (
        <div style={{ fontSize: '12px', color: '#F44336' }}>{msg}</div>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: 'linear-gradient(45deg, #D4AF37, #F7DC6F)',
          color: '#1A1A1A',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          transition: 'transform 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
      >
        {submitting ? 'Subscribing…' : 'Subscribe Now'}
      </button>
    </form>
  )
}
