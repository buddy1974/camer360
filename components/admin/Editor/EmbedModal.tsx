'use client'
import { useState } from 'react'
import { generateEmbed, detectPlatform, platformLabel, platformIcon } from '@/lib/embeds'

interface Props {
  onInsert: (html: string) => void
  onClose:  () => void
}

export function EmbedModal({ onInsert, onClose }: Props) {
  const [url,     setUrl]     = useState('')
  const [error,   setError]   = useState('')

  const platform = url.trim() ? detectPlatform(url.trim()) : null
  const label    = platformLabel(platform)
  const icon     = platformIcon(platform)

  function handleInsert() {
    const trimmed = url.trim()
    if (!trimmed) { setError('Enter a URL'); return }
    const html = generateEmbed(trimmed)
    if (!html) {
      setError('URL not recognised. Supported: YouTube, TikTok, Instagram, Vimeo, Twitter/X, Facebook, Twitch, Spotify.')
      return
    }
    onInsert(html)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(0,0,0,0.7)',
        zIndex:          999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '20px',
      }}
    >
      <div style={{
        background:   '#0F0F0F',
        border:       '1px solid #2A2A2A',
        borderRadius: '14px',
        padding:      '24px',
        width:        '100%',
        maxWidth:     '500px',
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 800, color: '#EEE' }}>
          Insert Embed
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.72rem', color: '#555' }}>
          YouTube · TikTok · Instagram · Vimeo · Twitter/X · Facebook · Twitch · Spotify
        </p>

        <input
          autoFocus
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          onKeyDown={e => { if (e.key === 'Enter') handleInsert(); if (e.key === 'Escape') onClose() }}
          placeholder="Paste video or post URL..."
          style={{
            width:        '100%',
            background:   '#080808',
            border:       `1px solid ${error ? '#C8102E' : '#2A2A2A'}`,
            borderRadius: '8px',
            color:        '#EEE',
            fontSize:     '0.88rem',
            padding:      '10px 12px',
            outline:      'none',
            boxSizing:    'border-box',
          }}
        />

        {/* Platform detection preview */}
        {platform && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: '1rem' }}>{icon}</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{label} detected</span>
          </div>
        )}

        {error && (
          <div style={{ fontSize: '0.72rem', color: '#C8102E', marginTop: 8 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#888', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!platform}
            style={{
              background:   platform ? '#C8102E' : '#1A1A1A',
              border:       'none',
              color:        platform ? '#fff' : '#444',
              borderRadius: '8px',
              padding:      '8px 20px',
              fontSize:     '0.78rem',
              fontWeight:   700,
              cursor:       platform ? 'pointer' : 'not-allowed',
            }}
          >
            Insert {platform ? `${icon} ${label}` : 'Embed'}
          </button>
        </div>
      </div>
    </div>
  )
}
