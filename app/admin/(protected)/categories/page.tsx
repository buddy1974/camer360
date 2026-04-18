'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, string> = {
  celebrities:    '#E91E8C',
  music:          '#9C27B0',
  'film-tv':      '#3F51B5',
  'fashion-beauty':'#E91E63',
  gossip:         '#F44336',
  viral:          '#FF5722',
  diaspora:       '#00BCD4',
  'money-moves':  '#4CAF50',
  'sport-stars':  '#2196F3',
  influencers:    '#FF9800',
  'real-talk':    '#607D8B',
  exposed:        '#795548',
}

interface CategoryRow {
  id: number
  slug: string
  name: string
  count: number
}

export default function CategoriesPage() {
  const [rows, setRows]     = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]       = useState('')
  const [working, setWorking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    if (res.ok) setRows(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function runAction(url: string, label: string) {
    setWorking(true)
    setMsg(`Running: ${label}…`)
    try {
      const res  = await fetch(url, { method: 'POST' })
      const data = await res.json()
      setMsg(data.message ?? (data.ok ? `${label} complete` : JSON.stringify(data)))
      await load()
    } catch {
      setMsg('Error — check console')
    }
    setWorking(false)
  }

  const entertainmentSlugs = Object.keys(CATEGORY_COLORS)
  const entCategories  = rows.filter(r => entertainmentSlugs.includes(r.slug))
  const otherCategories = rows.filter(r => !entertainmentSlugs.includes(r.slug))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>Categories</h1>
          <p style={{ color: '#444', fontSize: '0.75rem', marginTop: '4px' }}>
            {rows.length} total · {entCategories.length} entertainment · {otherCategories.length} other
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            disabled={working}
            onClick={() => runAction('/api/admin/categories/setup-entertainment', 'Setup Entertainment')}
            style={{
              padding: '9px 18px',
              background: working ? '#1A1A1A' : 'linear-gradient(135deg, #D4AF37, #F7DC6F)',
              color: working ? '#555' : '#1A1A1A',
              border: 'none', borderRadius: '8px',
              fontSize: '0.72rem', fontWeight: 700,
              cursor: working ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            ✦ Setup Entertainment
          </button>

          <button
            disabled={working}
            onClick={() => runAction('/api/admin/categories/cleanup', 'Cleanup CC Categories')}
            style={{
              padding: '9px 18px',
              background: '#0F0F0F',
              color: working ? '#555' : '#F44336',
              border: '1px solid #1E1E1E',
              borderRadius: '8px',
              fontSize: '0.72rem', fontWeight: 700,
              cursor: working ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            ✕ Remove CC Categories
          </button>
        </div>
      </div>

      {/* Status message */}
      {msg && (
        <div style={{
          padding: '12px 16px',
          background: '#0F0F0F',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '0.78rem',
          color: '#D4AF37',
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#444', fontSize: '0.8rem', textAlign: 'center', padding: '48px' }}>Loading…</div>
      ) : (
        <>
          {/* Entertainment categories */}
          {entCategories.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '14px' }}>
                Entertainment Categories
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {entCategories.map(r => (
                  <div key={r.id} style={{
                    background: '#0F0F0F',
                    border: `1px solid ${CATEGORY_COLORS[r.slug] ?? '#1A1A1A'}22`,
                    borderRadius: '10px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '3px', height: '100%',
                      background: CATEGORY_COLORS[r.slug] ?? '#D4AF37',
                    }} />
                    <div style={{ paddingLeft: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EEE' }}>{r.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#444', marginTop: '2px', fontFamily: 'monospace' }}>/{r.slug}</div>
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link
                          href={`/admin/articles?category=${r.slug}`}
                          style={{ fontSize: '0.78rem', fontWeight: 700, color: CATEGORY_COLORS[r.slug] ?? '#D4AF37', textDecoration: 'none' }}
                        >
                          {Number(r.count).toLocaleString()} articles
                        </Link>
                        <Link
                          href={`/${r.slug}`}
                          target="_blank"
                          style={{ fontSize: '0.62rem', color: '#333', textDecoration: 'none' }}
                        >
                          view →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other / CC categories */}
          {otherCategories.length > 0 && (
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', marginBottom: '14px' }}>
                Other Categories (CC Legacy)
              </div>
              <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      {['Category', 'Slug', 'Articles'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {otherCategories.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#555' }}>{r.name}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#333', fontFamily: 'monospace' }}>/{r.slug}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#333', fontWeight: 600 }}>
                          {Number(r.count).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: '#333', fontSize: '0.8rem', marginBottom: '20px' }}>No categories yet.</div>
              <button
                onClick={() => runAction('/api/admin/categories/setup-entertainment', 'Setup Entertainment')}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #D4AF37, #F7DC6F)',
                  color: '#1A1A1A', border: 'none', borderRadius: '8px',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}
              >
                ✦ Setup Entertainment Categories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
