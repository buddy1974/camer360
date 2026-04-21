'use client'
import { useState, useEffect } from 'react'

const KEY_DATES = 'reading_streak_dates'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function updateStreak(): number {
  const raw   = localStorage.getItem(KEY_DATES)
  const dates: string[] = raw ? JSON.parse(raw) : []
  const t     = today()
  if (dates[0] === t) return dates.length  // already logged today

  // Check if yesterday is in list (streak continues)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streak    = dates[0] === yesterday ? [t, ...dates].slice(0, 30) : [t]
  localStorage.setItem(KEY_DATES, JSON.stringify(streak))
  return streak.length
}

export function ReadingStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    try {
      setStreak(updateStreak())
    } catch { /* localStorage unavailable */ }
  }, [])

  if (streak < 2) return null

  return (
    <div title={`You've read for ${streak} days in a row!`} style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
      borderRadius: '20px', padding: '4px 12px',
      fontSize: '0.68rem', fontWeight: 800, color: '#D4AF37',
      letterSpacing: '0.06em', cursor: 'default',
    }}>
      🔥 {streak}-day streak
    </div>
  )
}
