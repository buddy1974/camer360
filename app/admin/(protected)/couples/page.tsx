'use client'
import { useState, useEffect } from 'react'

type Couple = {
  id: number; name1: string; name2: string; status: string | null
  since: string | null; imageUrl: string | null; description: string | null; country: string | null
}

const BLANK = { name1:'', name2:'', status:'dating', since:'', imageUrl:'', description:'', country:'' }
const inputS: React.CSSProperties = { width:'100%', background:'#0A0A0A', border:'1px solid #2A2A2A', borderRadius:'6px', padding:'8px 10px', color:'#EEE', fontSize:'0.82rem', outline:'none', boxSizing:'border-box' }
const labelS: React.CSSProperties = { display:'block', fontSize:'0.6rem', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }

export default function CouplesAdmin() {
  const [rows,    setRows]    = useState<Couple[]>([])
  const [form,    setForm]    = useState(BLANK)
  const [editing, setEditing] = useState<number|null>(null)
  const [msg,     setMsg]     = useState('')

  async function load() {
    const r = await fetch('/api/admin/couples'); const d = await r.json(); setRows(Array.isArray(d)?d:[])
  }
  useEffect(()=>{ load() },[])

  async function save() {
    const url = editing ? `/api/admin/couples/${editing}` : '/api/admin/couples'
    const r = await fetch(url, { method:editing?'PUT':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      name1:form.name1, name2:form.name2, status:form.status||'dating',
      since:form.since||null, imageUrl:form.imageUrl||null, description:form.description||null, country:form.country||null
    })})
    const d = await r.json()
    if (d.ok||d.id) { setMsg('✓ Saved'); setForm(BLANK); setEditing(null); load() }
    else setMsg(`✗ ${d.error}`)
  }

  async function remove(id:number) {
    if(!confirm('Delete?')) return
    await fetch(`/api/admin/couples/${id}`,{method:'DELETE'}); load()
  }

  return (
    <div style={{maxWidth:'960px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',margin:0}}>Celebrity Couples</h1>
        {msg && <span style={{fontSize:'0.75rem',color:msg.startsWith('✓')?'#22C55E':'#EF4444'}}>{msg}</span>}
      </div>

      {/* DB Setup */}
      <div style={{background:'#111',border:'1px solid #1E1E1E',borderRadius:'8px',padding:'10px 16px',marginBottom:'16px',fontSize:'0.72rem',color:'#555'}}>
        First time? <a href="#" onClick={async e=>{e.preventDefault();const r=await fetch('/api/admin/db/create-couples',{method:'POST'});const d=await r.json();setMsg(d.ok?'✓ Table created':`✗ ${d.error}`)}} style={{color:'#D4AF37',textDecoration:'none',fontWeight:700}}>Create database table →</a>
      </div>

      {/* Form */}
      <div style={{background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:'12px',padding:'20px',marginBottom:'24px'}}>
        <h3 style={{fontSize:'0.75rem',fontWeight:900,color:'#D4AF37',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 16px'}}>{editing?`Editing #${editing}`:'Add Couple'}</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {[{l:'Person 1 *',k:'name1',p:'e.g. Locko'},{l:'Person 2 *',k:'name2',p:'e.g. Name'},{l:'Since (year)',k:'since',p:'2020',t:'date'},{l:'Country',k:'country',p:'CM'}].map(({l,k,p,t})=>(
            <div key={k}><label style={labelS}>{l}</label><input type={t||'text'} value={(form as Record<string,string>)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={p} style={inputS}/></div>
          ))}
          <div><label style={labelS}>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{...inputS,cursor:'pointer'}}>{['dating','engaged','married','on_break','split','rumoured'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div><label style={labelS}>Image URL</label><input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." style={inputS}/></div>
        </div>
        <div style={{marginBottom:'12px'}}><label style={labelS}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} style={{...inputS,resize:'vertical'}} placeholder="Optional context..."/></div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={save} style={{background:'#D4AF37',color:'#1A1A1A',border:'none',padding:'8px 18px',borderRadius:'8px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>{editing?'Update':'Add'}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(BLANK)}} style={{background:'transparent',border:'1px solid #333',color:'#888',padding:'8px 14px',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer'}}>Cancel</button>}
        </div>
      </div>

      {/* List */}
      {rows.length===0 ? <p style={{color:'#555',fontSize:'0.82rem'}}>No couples yet.</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {rows.map(c=>(
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:'12px',background:'#0A0A0A',border:'1px solid #1E1E1E',borderRadius:'10px',padding:'12px 16px'}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontWeight:700,color:'#EEE',fontSize:'0.88rem'}}>{c.name1} &amp; {c.name2}</p>
                <p style={{margin:'2px 0 0',fontSize:'0.68rem',color:'#555'}}>{c.status}{c.country?` · ${c.country}`:''}</p>
              </div>
              <button onClick={()=>{setEditing(c.id);setForm({name1:c.name1,name2:c.name2,status:c.status||'dating',since:c.since?String(c.since).slice(0,10):'',imageUrl:c.imageUrl||'',description:c.description||'',country:c.country||''})}} style={{background:'transparent',border:'1px solid #2A2A2A',color:'#888',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Edit</button>
              <button onClick={()=>remove(c.id)} style={{background:'transparent',border:'1px solid #C8102E',color:'#C8102E',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Del</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
