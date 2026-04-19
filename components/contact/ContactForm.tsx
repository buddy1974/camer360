'use client'
import { useState } from 'react'

export default function ContactForm() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
    const mailto = `mailto:info@camer360.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#080808', border: '1px solid #2A2A2A',
    borderRadius: '8px', padding: '10px 14px', color: '#EEE',
    fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
    marginBottom: '12px',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: '#666',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    display: 'block', marginBottom: '6px',
  }

  if (sent) {
    return (
      <div style={{ background: '#0a2a0a', border: '1px solid #007A3D', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✅</div>
        <p style={{ color: '#4ade80', fontSize: '0.9rem' }}>
          Your email client has been opened. Thank you for reaching out — we&apos;ll respond within 2 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: '28px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#EEE', marginBottom: '20px' }}>Send Us a Message</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div>
          <label style={labelStyle}>Your Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Full name" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Your Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>Subject</label>
      <input type="text" required value={subject} onChange={e => setSubject(e.target.value)}
        placeholder="What is your enquiry about?" style={inputStyle} />

      <label style={labelStyle}>Message</label>
      <textarea required value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Write your message here…" rows={5}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />

      <button type="submit" style={{
        background: '#D4AF37', color: '#1A1A1A', border: 'none',
        borderRadius: '8px', padding: '12px 28px', fontSize: '0.82rem',
        fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Send Message
      </button>
    </form>
  )
}
