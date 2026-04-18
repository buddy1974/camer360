'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface ArticleRow {
  id: number; title: string; slug: string; status: string
  publishedAt: string | null; category: string; catSlug: string; hits?: number
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published:   { bg: 'rgba(0,122,61,0.15)',   color: '#007A3D' },
  draft:       { bg: '#1A1A1A',                color: '#555'    },
  unpublished: { bg: 'rgba(245,166,35,0.15)', color: '#F5A623' },
  scheduled:   { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
  archived:    { bg: '#111',                   color: '#333'    },
}

export default function ArticlesListPage() {
  const urlParams    = useSearchParams()
  const router       = useRouter()
  const statusFilter = urlParams.get('status') || ''

  const [articles,     setArticles]     = useState<ArticleRow[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [search,       setSearch]       = useState('')
  const [loading,      setLoading]      = useState(true)
  const [selectedIds,  setSelectedIds]  = useState<Set<number>>(new Set())
  const [deleting,     setDeleting]     = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), q: search })
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res  = await fetch(`/api/admin/articles?${params}`)
      const data = await res.json() as { articles: ArticleRow[]; total: number }
      setArticles(data.articles ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setArticles([])
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  async function bulkUnpublish() {
    if (!confirm(`Unpublish ${selectedIds.size} article(s)? They will be hidden from the public but not deleted.`)) return
    setUnpublishing(true)
    await Promise.all([...selectedIds].map(id =>
      fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unpublished' }),
      })
    ))
    setUnpublishing(false)
    setSelectedIds(new Set())
    load()
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} article(s)? This cannot be undone.`)) return
    setDeleting(true)
    await Promise.all([...selectedIds].map(id =>
      fetch(`/api/admin/articles/${id}`, { method: 'DELETE', credentials: 'include' })
    ))
    setDeleting(false)
    setSelectedIds(new Set())
    load()
  }

  const tabs = [
    { label: 'All',         value: ''            },
    { label: 'Published',   value: 'published'   },
    { label: 'Drafts',      value: 'draft'       },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Archived',    value: 'archived'    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
          Articles <span style={{ color: '#333', fontSize: '1rem' }}>({total.toLocaleString()})</span>
        </h1>
        <Link href="/admin/articles/new" style={{
          background: '#C8102E', color: '#fff', padding: '8px 16px',
          borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
          textDecoration: 'none', textTransform: 'uppercase',
        }}>
          + New Article
        </Link>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #1A1A1A', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/articles${tab.value ? `?status=${tab.value}` : ''}`)}
            style={{
              padding: '8px 14px',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: statusFilter === tab.value ? '2px solid #C8102E' : '2px solid transparent',
              color: statusFilter === tab.value ? '#fff' : '#555',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '-1px',
              transition: 'color 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        placeholder="Search articles..."
        style={{
          width: '100%', background: '#0F0F0F', border: '1px solid #1E1E1E',
          borderRadius: '8px', padding: '10px 14px', color: '#EEE',
          fontSize: '0.88rem', outline: 'none', marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
          background: '#0D0D0D', border: '1px solid #2A2A2A', borderRadius: '8px', marginBottom: '12px',
        }}>
          <span style={{ color: '#888', fontSize: '0.82rem', flex: 1 }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>{selectedIds.size}</span> article{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            disabled={unpublishing || deleting}
            onClick={bulkUnpublish}
            style={{
              background: unpublishing ? '#1A1A1A' : 'rgba(245,166,35,0.12)',
              color: unpublishing ? '#555' : '#F5A623',
              border: '1px solid rgba(245,166,35,0.3)',
              padding: '6px 16px', borderRadius: '6px',
              cursor: unpublishing || deleting ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem', fontWeight: 700,
            }}
          >
            {unpublishing ? 'Unpublishing…' : 'Unpublish Selected'}
          </button>
          <button
            disabled={deleting || unpublishing}
            onClick={bulkDelete}
            style={{
              background: deleting ? '#1A1A1A' : 'rgba(200,16,46,0.12)',
              color: deleting ? '#555' : '#C8102E',
              border: '1px solid rgba(200,16,46,0.3)',
              padding: '6px 16px', borderRadius: '6px',
              cursor: deleting || unpublishing ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem', fontWeight: 700,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete Selected'}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>Loading…</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#333', fontSize: '0.8rem' }}>No articles found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                <th style={{ width: '40px', padding: '10px 16px' }}>
                  <input type="checkbox"
                    checked={selectedIds.size === articles.length && articles.length > 0}
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(articles.map(a => a.id)))
                      else setSelectedIds(new Set())
                    }} />
                </th>
                {['Title', 'Category', 'Status', 'Date', 'Reads', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => {
                const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.draft
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #0D0D0D', background: selectedIds.has(a.id) ? 'rgba(200,16,46,0.04)' : undefined }}>
                    <td style={{ padding: '10px 16px' }}>
                      <input type="checkbox" checked={selectedIds.has(a.id)}
                        onChange={e => {
                          const next = new Set(selectedIds)
                          if (e.target.checked) next.add(a.id)
                          else next.delete(a.id)
                          setSelectedIds(next)
                        }} />
                    </td>
                    <td style={{ padding: '10px 16px', maxWidth: '380px' }}>
                      <Link href={`/admin/articles/${a.id}/edit`} style={{ color: '#CCC', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>
                        {a.title}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#555', whiteSpace: 'nowrap' }}>{a.category}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                        background: st.bg, color: st.color, textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#555', whiteSpace: 'nowrap' }}>
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#555', whiteSpace: 'nowrap' }}>
                      {(a.hits || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href={`/admin/articles/${a.id}/edit`}
                          style={{ fontSize: '0.68rem', color: '#555', textDecoration: 'none', padding: '3px 8px', border: '1px solid #1E1E1E', borderRadius: '4px' }}>
                          Edit
                        </Link>
                        {a.status === 'published' && (
                          <Link href={`/${a.catSlug}/${a.slug}`} target="_blank"
                            style={{ fontSize: '0.68rem', color: '#555', textDecoration: 'none', padding: '3px 8px', border: '1px solid #1E1E1E', borderRadius: '4px' }}>
                            View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {page > 1 && (
          <button onClick={() => setPage(p => p - 1)} style={{ background: '#111', border: '1px solid #1E1E1E', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>← Prev</button>
        )}
        <span style={{ padding: '6px 14px', fontSize: '0.75rem', color: '#555' }}>
          Page {page} of {Math.ceil(total / 20) || 1}
        </span>
        {page * 20 < total && (
          <button onClick={() => setPage(p => p + 1)} style={{ background: '#111', border: '1px solid #1E1E1E', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>Next →</button>
        )}
      </div>
    </div>
  )
}
