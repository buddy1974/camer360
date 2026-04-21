'use client'
import { useState, useEffect } from 'react'

type Poll = { id: number; question: string; options: string; active: boolean; articleId: number | null }
const inputS: React.CSSProperties = { width: '100%', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '8px 10px', color: '#EEE', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }
const labelS: React.CSSProperties = { display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }

const BLANK = { question: '', opts: ['', '', '', ''], articleId: '' }

export default function PollsAdmin() {
  const [rows,    setRows]    = useState<Poll[]>([])
  const [form,    setForm]    = useState(BLANK)
  const [editing, setEditing] = useState<number | null>(null)
  const [msg,     setMsg]     = useState('')

  async function load() {
    const r = await fetch('/api/admin/polls'); const d = await r.json(); setRows(Array.isArray(d) ? d : [])
  }
  useEffect(() => { load() }, [])

  function setOpt(i: number, v: string) {
    setForm(f => { const opts = [...f.opts]; opts[i] = v; return { ...f, opts } })
  }

  async function save() {
    const options = form.opts.map(o => o.trim()).filter(Boolean)
    if (!form.question.trim() || options.length < 2) { setMsg('✗ Question + 2+ options required'); return }
    const body = { question: form.question, options, articleId: form.articleId ? Number(form.articleId) : undefined }
    const url    = editing ? `/api/admin/polls/${editing}` : '/api/admin/polls'
    const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    if (d.ok || d.id) { setMsg('✓ Saved'); setForm(BLANK); setEditing(null); load() } else setMsg(`✗ ${d.error}`)
  }

  async function remove(id: number) {
    if (!confirm('Delete poll and all its votes?')) return
    await fetch(`/api/admin/polls/${id}`, { method: 'DELETE' }); load()
  }

  function startEdit(p: Poll) {
    const opts = (JSON.parse(p.options) as string[]).concat(['', '', '', '']).slice(0, 4)
    setEditing(p.id)
    setForm({ question: p.question, opts, articleId: p.articleId ? String(p.articleId) : '' })
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Interactive Polls</h1>
        {msg && <span style={{ fontSize: '0.75rem', color: msg.startsWith('✓') ? '#22C55E' : '#EF4444' }}>{msg}</span>}
      </div>

      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '0.72rem', color: '#555' }}>
        First time? <a href="#" onClick={async e => { e.preventDefault(); const r = await fetch('/api/admin/db/create-polls', { method: 'POST' }); const d = await r.json(); setMsg(d.ok ? '✓ Tables created' : `✗ ${d.error}`) }} style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>Create database tables →</a>
        <span style={{ marginLeft: '16px' }}>Embed in articles with: <code style={{ color: '#D4AF37' }}>&lt;PollWidget pollId=&#123;N&#125; /&gt;</code></span>
      </div>

      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
          {editing ? `Editing #${editing}` : 'New Poll'}
        </h3>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelS}>Question *</label>
          <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Who won this beef?" style={inputS} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {form.opts.map((o, i) => (
            <div key={i}>
              <label style={labelS}>Option {i + 1}{i < 2 ? ' *' : ''}</label>
              <input value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} style={inputS} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelS}>Article ID (optional — link to specific article)</label>
          <input type="number" value={form.articleId} onChange={e => setForm(f => ({ ...f, articleId: e.target.value }))} placeholder="Leave blank for standalone poll" style={{ ...inputS, maxWidth: '200px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} style={{ background: '#D4AF37', color: '#1A1A1A', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {editing ? 'Update' : 'Create Poll'}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm(BLANK) }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>

      {rows.length === 0 ? <p style={{ color: '#555', fontSize: '0.82rem' }}>No polls yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map(p => {
            const opts: string[] = JSON.parse(p.options)
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#EEE', fontSize: '0.85rem' }}>{p.question}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#555' }}>{opts.join(' · ')} {!p.active && '· [inactive]'}</p>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: 700 }}>ID: {p.id}</span>
                <button onClick={() => startEdit(p)} style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#888', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(p.id)} style={{ background: 'transparent', border: '1px solid #C8102E', color: '#C8102E', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Del</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
