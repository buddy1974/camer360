'use client'
import { useState, useEffect, useCallback } from 'react'

interface Props {
  articleTitle: string
  categorySlug: string
  slug: string
}

interface SelectionState {
  text: string
  x: number
  y: number
}

export function QuoteShare({ articleTitle, categorySlug, slug }: Props) {
  const [sel,     setSel]     = useState<SelectionState | null>(null)
  const [copied,  setCopied]  = useState(false)

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    const text      = selection?.toString().trim() ?? ''
    if (!text || text.length < 20 || text.length > 300) { setSel(null); return }

    const range = selection!.getRangeAt(0)
    const rect  = range.getBoundingClientRect()
    setSel({
      text,
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top  + window.scrollY - 52,
    })
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup',    handleSelection)
    document.addEventListener('touchend',   handleSelection)
    document.addEventListener('mousedown',  () => setSel(null))
    return () => {
      document.removeEventListener('mouseup',   handleSelection)
      document.removeEventListener('touchend',  handleSelection)
      document.removeEventListener('mousedown', () => setSel(null))
    }
  }, [handleSelection])

  if (!sel) return null

  const articleUrl = `${window.location.origin}/${categorySlug}/${slug}`
  const twitterText  = `"${sel.text}" — ${articleTitle} via @Camer360\n${articleUrl}`
  const whatsappText = `"${sel.text}"\n\n— ${articleTitle}\n${articleUrl}`

  async function copyQuote() {
    await navigator.clipboard.writeText(`"${sel!.text}" — ${articleTitle} (${articleUrl})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'absolute',
        left:  `${sel.x}px`,
        top:   `${sel.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#111',
        border: '1px solid #2A2A2A',
        borderRadius: '8px',
        padding: '6px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        whiteSpace: 'nowrap',
        pointerEvents: 'all',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
        Share
      </span>

      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={btnStyle}
        title="Share on X"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnStyle, background: '#25D366' }}
        title="Share on WhatsApp"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Copy */}
      <button
        onClick={copyQuote}
        style={{ ...btnStyle, background: copied ? '#22C55E' : '#333' }}
        title="Copy quote"
      >
        {copied
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        }
      </button>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 26, height: 26,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#1DA1F2',
  border: 'none', borderRadius: '6px',
  cursor: 'pointer', textDecoration: 'none', flexShrink: 0,
  transition: 'opacity 0.15s',
}
