'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface ArticleRow {
  id: number; title: string; slug: string; status: string
  publishedAt: string | null; category: string; catSlug: string; hits?: number
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published:   { bg: 'rgba(0,122,61,0.15)',   color: '#22c55e' },
  draft:       { bg: 'rgba(255,255,255,0.04)', color: '#555'    },
  unpublished: { bg: 'rgba(245,166,35,0.12)', color: '#F5A623' },
  scheduled:   { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
  archived:    { bg: '#111',                   color: '#333'    },
}

export default function ArticlesListPage() {
  const urlParams    = useSearchParams()
  const router       = useRouter()
  const statusFilter = urlParams.get('status') || ''

  const [articles,       setArticles]       = useState<ArticleRow[]>([])
  const [total,          setTotal]          = useState(0)
  const [page,           setPage]           = useState(1)
  const [search,         setSearch]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [selectedIds,    setSelectedIds]    = useState<Set<number>>(new Set())
  const [selectAllPages, setSelectAllPages] = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [publishing,     setPublishing]     = useState(false)
  const [unpublishing,   setUnpublishing]   = useState(false)
  const [inlineAction,   setInlineAction]   = useState<number | null>(null) // row ID being acted on

  const totalPages = Math.ceil(total / 20) || 1

  const load = useCallback(async () => {
    setLoading(true)
    setSelectAllPages(false)
    setSelectedIds(new Set())
    const params = new URLSearchParams({ page: String(page), q: search })
    if (statusFilter) params.set('status', statusFilter)
    try {
      const res  = await fetch(`/api/admin/articles?${params}`, { credentials: 'include' })
      const data = await res.json() as { articles: ArticleRow[]; total: number }
      setArticles(data.articles ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setArticles([])
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [statusFilter])

  // ── Inline single-row publish ───────────────────────────────────────────
  async function publishOne(id: number) {
    setInlineAction(id)
    try {
      await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      load()
    } finally { setInlineAction(null) }
  }

  // ── Bulk actions ────────────────────────────────────────────────────────
  async function bulkPublish() {
    if (!confirm(`Publish ${selectAllPages ? total : selectedIds.size} article(s)?`)) return
    setPublishing(true)
    if (selectAllPages && statusFilter === 'draft') {
      // Single DB call: publish every draft at once
      await fetch('/api/admin/articles', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromStatus: 'draft', toStatus: 'published' }),
      })
    } else {
      // Bulk update selected IDs
      await fetch('/api/admin/articles', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds], status: 'published' }),
      })
    }
    setPublishing(false)
    setSelectedIds(new Set())
    setSelectAllPages(false)
    load()
  }

  async function bulkUnpublish() {
    if (!confirm(`Unpublish ${selectedIds.size} article(s)? They'll be hidden but not deleted.`)) return
    setUnpublishing(true)
    await Promise.all([...selectedIds].map(id =>
      fetch(`/api/admin/articles/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unpublished' }),
      })
    ))
    setUnpublishing(false)
    setSelectedIds(new Set())
    load()
  }

  async function bulkDelete() {
    const count = selectAllPages ? total : selectedIds.size
    if (!confirm(`Permanently delete ${count} article(s)? This cannot be undone.`)) return
    setDeleting(true)
    if (selectAllPages && statusFilter) {
      // Delete all by status via bulk endpoint
      await fetch('/api/admin/articles', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusFilter }),
      })
    } else {
      await fetch('/api/admin/articles', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      })
    }
    setDeleting(false)
    setSelectedIds(new Set())
    setSelectAllPages(false)
    load()
  }

  const busy = deleting || publishing || unpublishing

  const tabs = [
    { label: 'All',         value: '' },
    { label: 'Published',   value: 'published' },
    { label: 'Drafts',      value: 'draft' },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Archived',    value: 'archived' },
  ]

  const selCount = selectAllPages ? total : selectedIds.size

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>
          Articles <span style={{ color: '#333', fontWeight: 400, fontSize: '0.95rem' }}>({total.toLocaleString()})</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/admin/quick-publish" style={{
            background: '#D4AF37', color: '#000', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            ⚡ Quick Publish
          </Link>
          <Link href="/admin/articles/new" style={{
            background: '#C8102E', color: '#fff', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
            textDecoration: 'none',
          }}>
            + New Article
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px', borderBottom: '1px solid #1A1A1A' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/articles${tab.value ? `?status=${tab.value}` : ''}`)}
            style={{
              padding: '8px 16px', fontSize: '0.72rem', fontWeight: 600,
              background: 'transparent', border: 'none',
              borderBottom: statusFilter === tab.value ? '2px solid #D4AF37' : '2px solid transparent',
              color: statusFilter === tab.value ? '#D4AF37' : '#555',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '-1px', transition: 'color 0.15s',
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
          flexWrap: 'wrap',
        }}>
          <span style={{ color: '#888', fontSize: '0.82rem', flex: 1 }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>{selCount.toLocaleString()}</span> article{selCount !== 1 ? 's' : ''} selected
            {!selectAllPages && total > articles.length && (
              <button onClick={() => setSelectAllPages(true)} style={{
                background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700, marginLeft: '10px', padding: 0,
              }}>
                Select all {total.toLocaleString()} {statusFilter || 'articles'}
              </button>
            )}
            {selectAllPages && (
              <button onClick={() => { setSelectAllPages(false); setSelectedIds(new Set()) }} style={{
                background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                fontSize: '0.78rem', marginLeft: '10px', padding: 0,
              }}>
                ✕ Clear selection
              </button>
            )}
          </span>

          {/* Publish bulk — only show for drafts */}
          {(statusFilter === 'draft' || statusFilter === '') && (
            <button disabled={busy} onClick={bulkPublish} style={{
              background: busy ? '#1A1A1A' : 'rgba(212,175,55,0.12)',
              color: busy ? '#555' : '#D4AF37',
              border: '1px solid rgba(212,175,55,0.3)',
              padding: '6px 16px', borderRadius: '6px',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem', fontWeight: 700,
            }}>
              {publishing ? 'Publishing…' : '⚡ Publish Selected'}
            </button>
          )}

          <button disabled={busy} onClick={bulkUnpublish} style={{
            background: busy ? '#1A1A1A' : 'rgba(245,166,35,0.08)',
            color: busy ? '#555' : '#F5A623',
            border: '1px solid rgba(245,166,35,0.2)',
            padding: '6px 16px', borderRadius: '6px',
            cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            {unpublishing ? 'Working…' : 'Unpublish'}
          </button>

          <button disabled={busy} onClick={bulkDelete} style={{
            background: busy ? '#1A1A1A' : 'rgba(200,16,46,0.1)',
            color: busy ? '#555' : '#C8102E',
            border: '1px solid rgba(200,16,46,0.25)',
            padding: '6px 16px', borderRadius: '6px',
            cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            {deleting ? 'Deleting…' : '🗑 Delete Selected'}
          </button>

          <button onClick={() => { setSelectedIds(new Set()); setSelectAllPages(false) }} style={{
            background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.78rem',
          }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#333', fontSize: '0.8rem' }}>
            <div style={{ marginBottom: '8px', fontSize: '1.2rem' }}>⏳</div>Loading articles…
          </div>
        ) : articles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#333', fontSize: '0.8rem' }}>
            No articles found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #181818' }}>
                <th style={{ width: '40px', padding: '10px 14px' }}>
                  <input type="checkbox"
                    checked={selectedIds.size === articles.length && articles.length > 0}
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(articles.map(a => a.id)))
                      else { setSelectedIds(new Set()); setSelectAllPages(false) }
                    }} />
                </th>
                {['Title', 'Category', 'Status', 'Date', 'Reads', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontSize: '0.6rem',
                    fontWeight: 700, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a, idx) => {
                const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.draft
                const acting = inlineAction === a.id
                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: idx < articles.length - 1 ? '1px solid #0D0D0D' : 'none',
                      background: selectedIds.has(a.id) ? 'rgba(212,175,55,0.03)' : undefined,
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ padding: '9px 14px' }}>
                      <input type="checkbox" checked={selectedIds.has(a.id)}
                        onChange={e => {
                          const next = new Set(selectedIds)
                          if (e.target.checked) next.add(a.id)
                          else next.delete(a.id)
                          setSelectAllPages(false)
                          setSelectedIds(next)
                        }} />
                    </td>
                    <td style={{ padding: '9px 14px', maxWidth: '360px' }}>
                      <Link href={`/admin/articles/${a.id}/edit`} style={{
                        color: '#CCC', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
                        lineHeight: 1.4, display: 'block',
                      }}>
                        {a.title}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: '0.7rem', color: '#444', whiteSpace: 'nowrap' }}>{a.category}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                        background: st.bg, color: st.color, textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: '0.7rem', color: '#444', whiteSpace: 'nowrap' }}>
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: '0.7rem', color: '#444', whiteSpace: 'nowrap' }}>
                      {(a.hits || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <Link href={`/admin/articles/${a.id}/edit`} style={{
                          fontSize: '0.68rem', color: '#555', textDecoration: 'none',
                          padding: '3px 9px', border: '1px solid #1E1E1E', borderRadius: '5px',
                          whiteSpace: 'nowrap',
                        }}>
                          Edit
                        </Link>

                        {/* One-click publish for drafts */}
                        {a.status === 'draft' && (
                          <button
                            disabled={acting}
                            onClick={() => publishOne(a.id)}
                            style={{
                              fontSize: '0.68rem', fontWeight: 700,
                              color: acting ? '#555' : '#D4AF37',
                              background: acting ? 'transparent' : 'rgba(212,175,55,0.08)',
                              border: '1px solid rgba(212,175,55,0.2)',
                              padding: '3px 9px', borderRadius: '5px', cursor: acting ? 'wait' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {acting ? '…' : '⚡ Publish'}
                          </button>
                        )}

                        {a.status === 'published' && (
                          <Link href={`/${a.catSlug}/${a.slug}`} target="_blank" style={{
                            fontSize: '0.68rem', color: '#555', textDecoration: 'none',
                            padding: '3px 9px', border: '1px solid #1E1E1E', borderRadius: '5px',
                            whiteSpace: 'nowrap',
                          }}>
                            View ↗
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
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{ background: '#111', border: '1px solid #1E1E1E', color: page > 1 ? '#888' : '#333', padding: '6px 14px', borderRadius: '6px', cursor: page > 1 ? 'pointer' : 'default', fontSize: '0.75rem' }}
          >← Prev</button>
          <span style={{ padding: '6px 14px', fontSize: '0.75rem', color: '#444' }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ background: '#111', border: '1px solid #1E1E1E', color: page < totalPages ? '#888' : '#333', padding: '6px 14px', borderRadius: '6px', cursor: page < totalPages ? 'pointer' : 'default', fontSize: '0.75rem' }}
          >Next →</button>
        </div>
      )}
    </div>
  )
}
