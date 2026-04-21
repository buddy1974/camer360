'use client'
import { useState, useEffect } from 'react'

type Drop = {
  id: number; artist: string; title: string; releaseDate: string
  type: string | null; streamUrl: string | null; coverUrl: string | null
  description: string | null; country: string | null
}

const BLANK: Omit<Drop, 'id'> = {
  artist: '', title: '', releaseDate: '', type: 'single',
  streamUrl: '', coverUrl: '', description: '', country: '',
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

export default function MusicDropsAdmin() {
  const [drops,   setDrops]   = useState<Drop[]>([])
  const [form,    setForm]    = useState<Omit<Drop, 'id'>>(BLANK)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg,     setMsg]     = useState('')

  async function load() {
    const r = await fetch('/api/admin/music-drops')
    const d = await r.json() as Drop[]
    setDrops(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    const method = editing ? 'PUT' : 'POST'
    const url    = editing ? `/api/admin/music-drops/${editing}` : '/api/admin/music-drops'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      artist:      form.artist,
      title:       form.title,
      releaseDate: form.releaseDate,
      type:        form.type || 'single',
      streamUrl:   form.streamUrl || null,
      coverUrl:    form.coverUrl || null,
      description: form.description || null,
      country:     form.country || null,
    })})
    const d = await r.json()
    if (d.ok || d.id) { setMsg('✓ Saved'); setForm(BLANK); setEditing(null); load() }
    else setMsg(`✗ ${d.error}`)
  }

  async function remove(id: number) {
    if (!confirm('Delete this drop?')) return
    await fetch(`/api/admin/music-drops/${id}`, { method: 'DELETE' })
    load()
  }

  function edit(d: Drop) {
    setEditing(d.id)
    setForm({ artist: d.artist, title: d.title, releaseDate: String(d.releaseDate).slice(0,10), type: d.type || 'single', streamUrl: d.streamUrl || '', coverUrl: d.coverUrl || '', description: d.description || '', country: d.country || '' })
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Music Drops</h1>
        {msg && <span style={{ fontSize: '0.75rem', color: msg.startsWith('✓') ? '#22C55E' : '#EF4444' }}>{msg}</span>}
      </div>

      {/* Form */}
      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
          {editing ? `Editing #${editing}` : 'Add New Drop'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Artist *',       key: 'artist',      placeholder: 'Salatiel' },
            { label: 'Title *',        key: 'title',       placeholder: 'New Single Name' },
            { label: 'Release Date *', key: 'releaseDate', placeholder: '', type: 'date' },
            { label: 'Country (2-letter)', key: 'country', placeholder: 'CM' },
            { label: 'Stream URL',     key: 'streamUrl',   placeholder: 'https://spotify.com/...' },
            { label: 'Cover Image URL', key: 'coverUrl',   placeholder: 'https://...' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type || 'text'}
                value={(form as Record<string, string>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Type</label>
            <select value={form.type ?? 'single'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['single','EP','album','mixtape'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="Optional short description..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button onClick={save} style={{ background: '#D4AF37', color: '#1A1A1A', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {editing ? 'Update' : 'Add Drop'}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm(BLANK) }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>

      {/* Setup reminder */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '0.72rem', color: '#555' }}>
        First time? <a href="#" onClick={async e => { e.preventDefault(); const r = await fetch('/api/admin/db/create-music-drops', { method: 'POST' }); const d = await r.json(); setMsg(d.ok ? '✓ Table created' : `✗ ${d.error}`) }} style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Create database table →</a>
      </div>

      {/* List */}
      {drops.length === 0 ? (
        <p style={{ color: '#555', fontSize: '0.82rem' }}>No drops yet — add the first one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drops.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#0A0A0A', border: '1px solid #1E1E1E',
              borderRadius: '10px', padding: '12px 16px',
            }}>
              {d.coverUrl && <img src={d.coverUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#EEE', fontSize: '0.88rem' }}>{d.artist} — {d.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#555' }}>{String(d.releaseDate).slice(0,10)} · {d.type ?? 'single'} {d.country ? `· ${d.country}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => edit(d)} style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#888', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(d.id)} style={{ background: 'transparent', border: '1px solid #C8102E', color: '#C8102E', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
