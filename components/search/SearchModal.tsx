'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'

interface Props {
  onClose: () => void
}

export default function SearchModal({ onClose }: Props) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ArticleWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json() as { articles: ArticleWithRelations[] }
      setResults(data.articles?.slice(0, 8) ?? [])
    } catch { setResults([]) }
    finally  { setLoading(false) }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 320)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9998, backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
        width: 'min(640px, calc(100vw - 32px))',
        zIndex: 9999,
        background: '#0F0F0F',
        border: '1px solid #2A2A2A',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
      }}>
        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #1A1A1A' }}>
          {loading
            ? <Loader2 style={{ width: 20, height: 20, color: '#D4AF37', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
            : <Search style={{ width: 20, height: 20, color: '#555', flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && search(query)}
            placeholder="Search celebrities, music, film…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#EEE', fontSize: '1rem', lineHeight: 1.5,
            }}
          />
          <button onClick={onClose} aria-label="Close search"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {results.map(a => (
              <Link
                key={a.id}
                href={`/${a.category.slug}/${a.slug}`}
                onClick={onClose}
                style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #151515', textDecoration: 'none' }}
                className="hover:bg-[#1A1A1A] transition-colors"
              >
                {a.featuredImage && (
                  <img src={a.featuredImage} alt="" loading="lazy"
                    style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EEE', lineHeight: 1.35,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.title}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#D4AF37', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {a.category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p style={{ padding: '24px 20px', color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>
            No results for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Hint */}
        {query.trim().length < 2 && (
          <p style={{ padding: '16px 20px', color: '#333', fontSize: '0.75rem' }}>
            Type at least 2 characters to search…
          </p>
        )}
      </div>
    </>
  )
}
