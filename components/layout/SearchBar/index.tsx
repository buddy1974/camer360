'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/lib/types'

export function SearchBar() {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ArticleWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router    = useRouter()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
    else { setQuery(''); setResults([]) }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json() as { articles: ArticleWithRelations[] }
      setResults((data.articles || []).slice(0, 5))
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(v), 300)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="w-8 h-8 grid place-items-center text-[#555] hover:text-white transition-colors ml-1"
      >
        <Search size={16} strokeWidth={2} />
      </button>
    )
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }} className="ml-1">
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#111', border: '1px solid #2A2A2A',
        borderRadius: '8px', padding: '6px 10px',
        width: '260px',
      }}>
        {loading
          ? <Loader2 size={14} className="text-[#555] animate-spin flex-shrink-0" />
          : <Search size={14} className="text-[#555] flex-shrink-0" />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="Search celebrities, music…"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#EEE', fontSize: '0.82rem', flex: 1, minWidth: 0,
          }}
        />
        <button onClick={() => setOpen(false)} className="text-[#555] hover:text-white flex-shrink-0">
          <X size={14} />
        </button>
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#111', border: '1px solid #2A2A2A', borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {results.map(a => (
            <Link
              key={a.id}
              href={`/${a.category.slug}/${a.slug}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '10px 14px',
                borderBottom: '1px solid #1A1A1A', textDecoration: 'none',
              }}
              className="hover:bg-[#1A1A1A] transition-colors"
            >
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#EEE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.title}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {a.category.name}
              </p>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '10px 14px', fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
            className="hover:bg-[#1A1A1A] transition-colors"
          >
            See all results for &quot;{query}&quot; →
          </Link>
        </div>
      )}
    </div>
  )
}
