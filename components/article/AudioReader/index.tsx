'use client'
import { useState, useEffect, useRef } from 'react'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function AudioReader({ title, body }: { title: string; body: string }) {
  const [playing,   setPlaying]   = useState(false)
  const [supported, setSupported] = useState(false)
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  function play() {
    const text = `${title}. ${stripHtml(body)}`
    const utt  = new SpeechSynthesisUtterance(text)
    utt.rate   = 0.92
    utt.pitch  = 1
    utt.onend  = () => setPlaying(false)
    utt.onerror = () => setPlaying(false)
    uttRef.current = utt
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utt)
    setPlaying(true)
  }

  function pause() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setPlaying(false)
    }
  }

  function resume() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setPlaying(true)
    } else {
      play()
    }
  }

  function stop() {
    window.speechSynthesis.cancel()
    setPlaying(false)
  }

  if (!supported) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: '#F9F7F4', border: '1px solid var(--border-light)',
      borderRadius: '12px', padding: '12px 16px', marginBottom: '24px',
    }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
        🎧 Listen
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {!playing ? (
          <button onClick={resume} style={btnStyle('#D4AF37', '#1A1A1A')}>
            ▶ Play
          </button>
        ) : (
          <button onClick={pause} style={btnStyle('#E5E7EB', '#374151')}>
            ⏸ Pause
          </button>
        )}
        <button onClick={stop} style={btnStyle('#E5E7EB', '#374151')}>
          ■ Stop
        </button>
      </div>
      {playing && (
        <span style={{ fontSize: '0.68rem', color: '#D4AF37', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
          Reading aloud…
        </span>
      )}
    </div>
  )
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, border: 'none',
    padding: '6px 12px', borderRadius: '6px',
    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
  }
}
