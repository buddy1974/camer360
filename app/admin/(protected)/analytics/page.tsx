'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatHitCount } from '@/lib/utils'

type Row = {
  id: number; title: string; slug: string
  categorySlug: string; publishedAt: string | null; hits: number
}

export default function AnalyticsPage() {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/top-articles')
      .then(r => r.json())
      .then((d: Row[]) => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const total = rows.reduce((s, r) => s + Number(r.hits), 0)

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Analytics — Top Articles</h1>
        {!loading && <p style={{ fontSize: '0.72rem', color: '#555', marginTop: '4px' }}>{total.toLocaleString()} total reads across top {rows.length} articles</p>}
      </div>

      {loading && <p style={{ color: '#555', fontSize: '0.82rem' }}>Loading…</p>}

      {!loading && rows.length === 0 && (
        <p style={{ color: '#555', fontSize: '0.82rem' }}>No view data yet — articles need hits tracked first.</p>
      )}

      {!loading && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {rows.map((r, i) => {
            const pct = total > 0 ? (r.hits / total) * 100 : 0
            return (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr auto',
                alignItems: 'center', gap: '12px',
                background: '#0A0A0A', border: '1px solid #1E1E1E',
                borderRadius: '10px', padding: '12px 16px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`, background: 'rgba(212,175,55,0.06)',
                  borderRadius: '10px 0 0 10px',
                }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: i < 3 ? '#D4AF37' : '#333', position: 'relative' }}>
                  #{i + 1}
                </span>
                <div style={{ position: 'relative', minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#EEE', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {r.categorySlug}
                    </span>
                    {r.publishedAt && (
                      <span style={{ fontSize: '0.65rem', color: '#444' }}>
                        {new Date(r.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', position: 'relative' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#D4AF37', margin: 0 }}>
                    {formatHitCount(r.hits)}
                  </p>
                  <p style={{ fontSize: '0.62rem', color: '#333', margin: '1px 0 0' }}>
                    {pct.toFixed(1)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
