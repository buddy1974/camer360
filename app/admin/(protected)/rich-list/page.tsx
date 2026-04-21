'use client'
import { useState, useEffect } from 'react'

type Entry = {
  id: number; rank: number; name: string; country: string
  industry: string | null; netWorthM: number; changeDir: string | null
}

const BLANK: Omit<Entry, 'id'> = {
  rank: 0, name: '', country: '', industry: '', netWorthM: 0, changeDir: 'stable',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0A0A0A', border: '1px solid #2A2A2A',
  borderRadius: '6px', padding: '8px 10px', color: '#EEE',
  fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.6rem', fontWeight: 700,
  color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px',
}

function formatW(m: number) {
  return m >= 1000 ? `$${(m / 1000).toFixed(1)}B` : `$${m}M`
}

export default function RichListAdmin() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [form,    setForm]    = useState<Omit<Entry, 'id'>>(BLANK)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg,     setMsg]     = useState('')

  async function load() {
    const r = await fetch('/api/admin/rich-list')
    const d = await r.json() as Entry[]
    setEntries(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    const method = editing ? 'PUT' : 'POST'
    const url    = editing ? `/api/admin/rich-list/${editing}` : '/api/admin/rich-list'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      rank: Number(form.rank), name: form.name, country: form.country,
      industry: form.industry || null, netWorthM: Number(form.netWorthM),
      changeDir: form.changeDir || 'stable',
    })})
    const d = await r.json()
    if (d.ok || d.id) { setMsg('✓ Saved'); setForm(BLANK); setEditing(null); load() }
    else setMsg(`✗ ${d.error}`)
  }

  async function remove(id: number) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/rich-list/${id}`, { method: 'DELETE' })
    load()
  }

  function edit(e: Entry) {
    setEditing(e.id)
    setForm({ rank: e.rank, name: e.name, country: e.country, industry: e.industry || '', netWorthM: e.netWorthM, changeDir: e.changeDir || 'stable' })
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Rich List</h1>
        {msg && <span style={{ fontSize: '0.75rem', color: msg.startsWith('✓') ? '#22C55E' : '#EF4444' }}>{msg}</span>}
      </div>

      {/* Form */}
      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
          {editing ? `Editing #${editing}` : 'Add Entry'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 80px', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Rank *</label>
            <input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: Number(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Industry</label>
            <input value={form.industry ?? ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Cement, Banking..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value.toUpperCase().slice(0,2) }))} placeholder="NG" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Net Worth (USD millions) *</label>
            <input type="number" value={form.netWorthM} onChange={e => setForm(f => ({ ...f, netWorthM: Number(e.target.value) }))} placeholder="e.g. 14000 for $14B" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Trend</label>
            <select value={form.changeDir ?? 'stable'} onChange={e => setForm(f => ({ ...f, changeDir: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="up">↑ Up</option>
              <option value="stable">— Stable</option>
              <option value="down">↓ Down</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button onClick={save} style={{ background: '#D4AF37', color: '#1A1A1A', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {editing ? 'Update' : 'Add Entry'}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm(BLANK) }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>

      {/* Setup */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '0.72rem', color: '#555' }}>
        First time? <a href="#" onClick={async e => { e.preventDefault(); const r = await fetch('/api/admin/db/create-rich-list', { method: 'POST' }); const d = await r.json(); setMsg(d.ok ? '✓ Table created and seeded' : `✗ ${d.error}`); load() }} style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Create + seed database table →</a>
      </div>

      {/* List */}
      {entries.length === 0 ? (
        <p style={{ color: '#555', fontSize: '0.82rem' }}>No entries yet — create the table and seed it, or add entries above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {entries.map(e => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#0A0A0A', border: '1px solid #1E1E1E',
              borderRadius: '10px', padding: '12px 16px',
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#D4AF37', minWidth: '32px' }}>#{e.rank}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#EEE', fontSize: '0.88rem' }}>{e.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#555' }}>
                  {formatW(e.netWorthM)} · {e.country} {e.industry ? `· ${e.industry}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => edit(e)} style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#888', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(e.id)} style={{ background: 'transparent', border: '1px solid #C8102E', color: '#C8102E', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
