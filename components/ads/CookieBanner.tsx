'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useConsent } from '@/components/ads/ConsentContext'

export default function CookieBanner() {
  const { hasMadeChoice, accept, decline } = useConsent()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if no choice has been made yet
    if (!hasMadeChoice) setVisible(true)
  }, [hasMadeChoice])

  // Hide once a choice is made
  useEffect(() => {
    if (hasMadeChoice) setVisible(false)
  }, [hasMadeChoice])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 9990,
      background: '#0F0F0F',
      borderTop: '1px solid #1E1E1E',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
      padding: '16px 24px',
      animation: 'slideUp 0.35s ease-out',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div style={{
        maxWidth: '960px', margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Icon + text */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <p style={{ fontSize: '0.82rem', color: '#BBBBBB', lineHeight: 1.6, margin: 0 }}>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>🍪 Cookie Notice</span>
            {' '}We use cookies for analytics and personalised advertising to support our
            free entertainment coverage.{' '}
            <Link href="/privacy" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#888',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              background: '#D4AF37',
              border: 'none',
              color: '#1A1A1A',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
