'use client'
import { useState } from 'react'
import AdUnit from '@/components/ads/AdUnit'

interface Props { body: string }

export function ProgressiveBody({ body }: Props) {
  const [expanded, setExpanded] = useState(false)

  const parts   = body.split('</p>')
  const preview = parts.slice(0, 3).join('</p>') + (parts.length > 3 ? '</p>' : '')
  const restParts = parts.slice(3)
  const mid     = restParts.slice(0, 3).join('</p>') + (restParts.length > 3 ? '</p>' : '')
  const tail    = restParts.length > 3 ? restParts.slice(3).join('</p>') : ''
  const hasMore = restParts.length > 0

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: preview }} />

      {!expanded && hasMore && (
        <div style={{ margin: '28px 0', textAlign: 'center' }}>
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: 'linear-gradient(45deg, #D4AF37, #F0D060)',
              color: '#1A1A1A',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '24px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Keep Reading ↓
          </button>
          <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '8px' }}>
            {restParts.length} more paragraph{restParts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {expanded && mid && (
        <>
          <div dangerouslySetInnerHTML={{ __html: mid }} />
          {tail && (
            <>
              <div style={{ margin: '32px -40px', padding: '0 40px' }}>
                <AdUnit slot="5520370976" format="rectangle" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: tail }} />
            </>
          )}
        </>
      )}
    </>
  )
}
