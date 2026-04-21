'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BirthdayEntry {
  id: number
  name: string
  birthMonth: number
  birthDay: number
  birthYear: number | null
  category: string | null
  celebSlug: string | null
  daysUntil: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function BirthdayCountdown() {
  const [items, setItems] = useState<BirthdayEntry[]>([])

  useEffect(() => {
    fetch('/api/birthdays/upcoming')
      .then(r => r.json())
      .then((d: BirthdayEntry[]) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          🎂 Upcoming Birthdays
        </p>
        <Link href="/birthdays" style={{ fontSize: '0.62rem', color: '#555', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          All →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(b => {
          const isToday = b.daysUntil === 0
          const href    = b.celebSlug ? `/celebrities/${b.celebSlug}` : '/birthdays'
          return (
            <Link
              key={b.id}
              href={href}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                background: isToday ? 'linear-gradient(45deg, #D4AF37, #F0D060)' : '#1A1A1A',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: isToday ? '#1A1A1A' : '#555', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                  {MONTHS[b.birthMonth - 1]}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: isToday ? '#1A1A1A' : '#EEE', lineHeight: 1.1 }}>
                  {b.birthDay}
                </span>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#EEE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: isToday ? '#D4AF37' : '#555' }}>
                  {isToday ? '🎉 Today!' : `In ${b.daysUntil} day${b.daysUntil !== 1 ? 's' : ''}`}
                  {b.category ? ` · ${b.category}` : ''}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
