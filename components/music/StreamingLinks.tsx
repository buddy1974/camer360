'use client'

interface Platform {
  key:   string
  label: string
  icon:  string
  color: string
  bg:    string
}

const PLATFORMS: Platform[] = [
  { key: 'spotify',   label: 'Spotify',     icon: '🎧', color: '#1DB954', bg: 'rgba(29,185,84,0.12)'  },
  { key: 'apple',     label: 'Apple Music', icon: '🎵', color: '#FC3C44', bg: 'rgba(252,60,68,0.12)'  },
  { key: 'youtube',   label: 'YouTube',     icon: '▶️', color: '#FF0000', bg: 'rgba(255,0,0,0.1)'     },
  { key: 'audiomack', label: 'Audiomack',   icon: '🎶', color: '#FFA500', bg: 'rgba(255,165,0,0.12)'  },
  { key: 'boomplay',  label: 'Boomplay',    icon: '🎼', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
]

interface Links {
  stream_url?:    string | null  // primary (usually Spotify)
  apple_url?:     string | null
  youtube_url?:   string | null
  audiomack_url?: string | null
  boomplay_url?:  string | null
}

interface Props {
  links:   Links
  compact?: boolean
}

export function StreamingLinks({ links, compact = false }: Props) {
  const items = [
    { ...PLATFORMS[0], url: links.stream_url },
    { ...PLATFORMS[1], url: links.apple_url },
    { ...PLATFORMS[2], url: links.youtube_url },
    { ...PLATFORMS[3], url: links.audiomack_url },
    { ...PLATFORMS[4], url: links.boomplay_url },
  ].filter(p => p.url)

  if (items.length === 0) return null

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {items.map(p => (
          <a
            key={p.key}
            href={p.url!}
            target="_blank"
            rel="noopener noreferrer"
            title={`Listen on ${p.label}`}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          30,
              height:         30,
              borderRadius:   '50%',
              background:     p.bg,
              border:         `1px solid ${p.color}40`,
              textDecoration: 'none',
              fontSize:       '0.85rem',
              transition:     'transform 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {p.icon}
          </a>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {items.map(p => (
        <a
          key={p.key}
          href={p.url!}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '6px',
            background:     p.bg,
            border:         `1px solid ${p.color}40`,
            color:          p.color,
            padding:        '6px 12px',
            borderRadius:   '20px',
            fontSize:       '0.7rem',
            fontWeight:     700,
            textDecoration: 'none',
            transition:     'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
        >
          <span>{p.icon}</span>
          <span>{p.label}</span>
        </a>
      ))}
    </div>
  )
}
