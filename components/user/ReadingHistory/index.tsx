'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryEntry {
  id:           number
  title:        string
  slug:         string
  categorySlug: string
  categoryName: string
  readAt:       string  // ISO timestamp
}

const KEY = 'reading_history_v1'
const MAX = 20

export function useReadingHistory() {
  function getHistory(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function addEntry(entry: Omit<HistoryEntry, 'readAt'>) {
    try {
      const history = getHistory().filter(h => h.id !== entry.id)
      const updated = [{ ...entry, readAt: new Date().toISOString() }, ...history].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(updated))
    } catch { /* storage full */ }
  }

  return { getHistory, addEntry }
}

// Component to record the current article in history (mount = article viewed)
export function RecordHistory({ id, title, slug, categorySlug, categoryName }: Omit<HistoryEntry, 'readAt'>) {
  useEffect(() => {
    try {
      const raw     = localStorage.getItem(KEY)
      const history: HistoryEntry[] = raw ? JSON.parse(raw) : []
      const fresh   = history.filter(h => h.id !== id)
      const updated = [{ id, title, slug, categorySlug, categoryName, readAt: new Date().toISOString() }, ...fresh].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(updated))
    } catch { /* ignore */ }
  }, [id, title, slug, categorySlug, categoryName])

  return null
}

// "Continue Reading" widget for homepage
export function ContinueReading() {
  const [items, setItems] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      const history: HistoryEntry[] = raw ? JSON.parse(raw) : []
      setItems(history.slice(0, 4))
    } catch { setItems([]) }
  }, [])

  if (items.length === 0) return null

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)   return 'Just now'
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '20px' }}>
      <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px' }}>
        📖 Continue Reading
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <Link
            key={item.id}
            href={`/${item.categorySlug}/${item.slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#EEE', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {item.title}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: '#444' }}>
              {item.categoryName} · {relativeTime(item.readAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
