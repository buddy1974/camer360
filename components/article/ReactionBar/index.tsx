'use client'
import { useState, useEffect } from 'react'

const REACTIONS = [
  { emoji: '🔥', label: 'Fire'   },
  { emoji: '😍', label: 'Love'   },
  { emoji: '😂', label: 'Dead'   },
  { emoji: '👀', label: 'Tea'    },
  { emoji: '💅', label: 'Iconic' },
  { emoji: '💔', label: 'Sad'    },
]

interface ReactionCount { reaction: string; count: number }

export function ReactionBar({ articleId }: { articleId: number }) {
  const [counts,   setCounts]   = useState<ReactionCount[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const storageKey = `reaction_${articleId}`

  useEffect(() => {
    setSelected(localStorage.getItem(storageKey))
    fetch(`/api/reactions/${articleId}`)
      .then(r => r.json())
      .then((data: ReactionCount[]) => setCounts(data))
      .catch(() => {})
  }, [articleId, storageKey])

  const total = counts.reduce((s, r) => s + Number(r.count), 0)

  function getCount(emoji: string) {
    return Number(counts.find(r => r.reaction === emoji)?.count ?? 0)
  }

  async function handleReact(emoji: string) {
    if (selected || loading) return
    setLoading(true)

    // Optimistic update
    setSelected(emoji)
    localStorage.setItem(storageKey, emoji)
    setCounts(prev => {
      const existing = prev.find(r => r.reaction === emoji)
      if (existing) {
        return prev.map(r => r.reaction === emoji ? { ...r, count: r.count + 1 } : r)
      }
      return [...prev, { reaction: emoji, count: 1 }]
    })

    try {
      await fetch(`/api/reactions/${articleId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reaction: emoji }),
      })
    } catch { /* optimistic already shown */ }

    setLoading(false)
  }

  return (
    <div style={{
      background: '#0A0A0A',
      border: '1px solid #1E1E1E',
      borderRadius: '16px',
      padding: '20px 24px',
      margin: '28px 0',
    }}>
      <p style={{
        fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: '#555', marginBottom: '16px',
      }}>
        {selected ? 'Your reaction' : 'How does this story hit?'}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {REACTIONS.map(({ emoji, label }) => {
          const count   = getCount(emoji)
          const isMe    = selected === emoji
          const pct     = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={!!selected || loading}
              title={label}
              style={{
                position:    'relative',
                display:     'flex',
                flexDirection: 'column',
                alignItems:  'center',
                gap:         '4px',
                padding:     '10px 14px',
                background:  isMe ? 'rgba(212,175,55,0.12)' : '#111',
                border:      `1px solid ${isMe ? '#D4AF37' : '#1E1E1E'}`,
                borderRadius: '12px',
                cursor:      selected ? 'default' : 'pointer',
                transition:  'all 0.15s ease',
                minWidth:    '60px',
                overflow:    'hidden',
              }}
            >
              {/* fill bar */}
              {selected && pct > 0 && (
                <div style={{
                  position:   'absolute',
                  bottom:     0, left: 0, right: 0,
                  height:     `${pct}%`,
                  background: isMe ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                  transition: 'height 0.4s ease',
                }} />
              )}
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{emoji}</span>
              <span style={{
                fontSize:   '0.65rem',
                fontWeight: 700,
                color:      isMe ? '#D4AF37' : '#555',
                letterSpacing: '0.05em',
              }}>
                {selected ? `${pct}%` : label}
              </span>
            </button>
          )
        })}
      </div>

      {total > 0 && (
        <p style={{ fontSize: '0.65rem', color: '#333', marginTop: '12px' }}>
          {total.toLocaleString()} {total === 1 ? 'reaction' : 'reactions'}
        </p>
      )}
    </div>
  )
}
