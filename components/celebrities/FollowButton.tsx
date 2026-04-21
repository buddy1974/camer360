'use client'
import { useState, useEffect } from 'react'

interface Props {
  type:  'celeb' | 'category'
  slug:  string
  label: string
}

export function FollowButton({ type, slug, label }: Props) {
  const key      = `follow_${type}_${slug}`
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(!!localStorage.getItem(key))
  }, [key])

  function toggle() {
    if (active) {
      localStorage.removeItem(key)
      setActive(false)
    } else {
      localStorage.setItem(key, '1')
      setActive(true)
    }
  }

  return (
    <button
      onClick={toggle}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         '6px',
        padding:     '10px 20px',
        borderRadius: '24px',
        border:      `1px solid ${active ? '#D4AF37' : '#333'}`,
        background:  active ? 'rgba(212,175,55,0.12)' : 'transparent',
        color:       active ? '#D4AF37' : '#888',
        fontSize:    '0.75rem',
        fontWeight:  700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor:      'pointer',
        transition:  'all 0.15s ease',
      }}
    >
      {active ? '✓' : '+'} {active ? `Following ${label}` : `Follow ${label}`}
    </button>
  )
}
