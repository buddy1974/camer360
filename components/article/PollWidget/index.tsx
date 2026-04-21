'use client'
import { useState, useEffect } from 'react'

interface PollData {
  id: number
  question: string
  options: string[]
  votes: number[]
  total: number
}

export function PollWidget({ pollId }: { pollId: number }) {
  const [data,   setData]   = useState<PollData | null>(null)
  const [voted,  setVoted]  = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const cacheKey = `poll_vote_${pollId}`

  useEffect(() => {
    const saved = localStorage.getItem(cacheKey)
    if (saved !== null) setVoted(Number(saved))

    fetch(`/api/polls/${pollId}`)
      .then(r => r.json())
      .then((d: PollData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [pollId, cacheKey])

  async function vote(idx: number) {
    if (voted !== null || !data) return
    setVoted(idx)
    localStorage.setItem(cacheKey, String(idx))
    try {
      const res  = await fetch(`/api/polls/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIdx: idx }),
      })
      const updated = await res.json() as PollData
      setData(updated)
    } catch { /* optimistic — keep local state */ }
  }

  if (loading || !data) return null

  const hasVoted = voted !== null
  const max = Math.max(...data.votes, 1)

  return (
    <div style={{
      background: '#0A0A0A', border: '1px solid #1E1E1E',
      borderRadius: '16px', padding: '24px', margin: '32px 0',
    }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>
        📊 Quick Poll
      </p>
      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#EEE', lineHeight: 1.4, marginBottom: '20px' }}>
        {data.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.options.map((opt, i) => {
          const count   = data.votes[i] ?? 0
          const pct     = data.total > 0 ? Math.round((count / data.total) * 100) : 0
          const isVoted = voted === i
          const barW    = data.total > 0 ? (count / max) * 100 : 0

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={hasVoted}
              style={{
                position: 'relative', overflow: 'hidden',
                background: 'transparent',
                border: `1px solid ${isVoted ? '#D4AF37' : '#2A2A2A'}`,
                borderRadius: '8px', padding: '12px 16px',
                cursor: hasVoted ? 'default' : 'pointer',
                textAlign: 'left', transition: 'border-color 0.15s',
              }}
            >
              {/* progress bar */}
              {hasVoted && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${barW}%`,
                  background: isVoted ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  transition: 'width 0.6s ease',
                }} />
              )}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: isVoted ? 800 : 600, color: isVoted ? '#D4AF37' : '#CCC' }}>
                  {opt}
                </span>
                {hasVoted && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isVoted ? '#D4AF37' : '#555' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {hasVoted && (
        <p style={{ fontSize: '0.65rem', color: '#444', marginTop: '14px' }}>
          {data.total.toLocaleString()} vote{data.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
