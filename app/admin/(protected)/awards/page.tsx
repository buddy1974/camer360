'use client'
import { useState, useEffect } from 'react'

type Award = { id:number; awardShow:string; year:number; category:string; winner:string|null; nominees:string|null; ceremonyDate:string|null; status:string|null; description:string|null }
const BLANK = { awardShow:'', year:new Date().getFullYear(), category:'', winner:'', nominees:'', ceremonyDate:'', status:'upcoming', description:'' }
const inputS: React.CSSProperties = { width:'100%', background:'#0A0A0A', border:'1px solid #2A2A2A', borderRadius:'6px', padding:'8px 10px', color:'#EEE', fontSize:'0.82rem', outline:'none', boxSizing:'border-box' }
const labelS: React.CSSProperties = { display:'block', fontSize:'0.6rem', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }

export default function AwardsAdmin() {
  const [rows,    setRows]    = useState<Award[]>([])
  const [form,    setForm]    = useState(BLANK)
  const [editing, setEditing] = useState<number|null>(null)
  const [msg,     setMsg]     = useState('')

  async function load(){const r=await fetch('/api/admin/awards');const d=await r.json();setRows(Array.isArray(d)?d:[])}
  useEffect(()=>{load()},[])

  async function save(){
    const url=editing?`/api/admin/awards/${editing}`:'/api/admin/awards'
    const r=await fetch(url,{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      awardShow:form.awardShow,year:Number(form.year),category:form.category,
      winner:form.winner||null,nominees:form.nominees||null,
      ceremonyDate:form.ceremonyDate||null,status:form.status||'upcoming',description:form.description||null
    })})
    const d=await r.json()
    if(d.ok||d.id){setMsg('✓ Saved');setForm(BLANK);setEditing(null);load()}else setMsg(`✗ ${d.error}`)
  }

  async function remove(id:number){if(!confirm('Delete?'))return;await fetch(`/api/admin/awards/${id}`,{method:'DELETE'});load()}

  return (
    <div style={{maxWidth:'960px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',margin:0}}>Awards Tracker</h1>
        {msg&&<span style={{fontSize:'0.75rem',color:msg.startsWith('✓')?'#22C55E':'#EF4444'}}>{msg}</span>}
      </div>
      <div style={{background:'#111',border:'1px solid #1E1E1E',borderRadius:'8px',padding:'10px 16px',marginBottom:'16px',fontSize:'0.72rem',color:'#555'}}>
        First time? <a href="#" onClick={async e=>{e.preventDefault();const r=await fetch('/api/admin/db/create-awards',{method:'POST'});const d=await r.json();setMsg(d.ok?'✓ Table created':`✗ ${d.error}`)}} style={{color:'#D4AF37',textDecoration:'none',fontWeight:700}}>Create database table →</a>
      </div>
      <div style={{background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:'12px',padding:'20px',marginBottom:'24px'}}>
        <h3 style={{fontSize:'0.75rem',fontWeight:900,color:'#D4AF37',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 16px'}}>{editing?`Editing #${editing}`:'Add Award'}</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:'12px',marginBottom:'12px'}}>
          <div><label style={labelS}>Award Show *</label><input value={form.awardShow} onChange={e=>setForm(f=>({...f,awardShow:e.target.value}))} placeholder="AFRIMA, Channel O..." style={inputS}/></div>
          <div><label style={labelS}>Year *</label><input type="number" value={form.year} onChange={e=>setForm(f=>({...f,year:Number(e.target.value)}))} style={inputS}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          <div><label style={labelS}>Category *</label><input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Best Male Artist" style={inputS}/></div>
          <div><label style={labelS}>Winner</label><input value={form.winner} onChange={e=>setForm(f=>({...f,winner:e.target.value}))} placeholder="Leave blank if upcoming" style={inputS}/></div>
          <div><label style={labelS}>Ceremony Date</label><input type="date" value={form.ceremonyDate} onChange={e=>setForm(f=>({...f,ceremonyDate:e.target.value}))} style={inputS}/></div>
          <div><label style={labelS}>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{...inputS,cursor:'pointer'}}>{['upcoming','announced','closed'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div style={{marginBottom:'12px'}}><label style={labelS}>Nominees (comma-separated)</label><input value={form.nominees} onChange={e=>setForm(f=>({...f,nominees:e.target.value}))} placeholder="Artist 1, Artist 2, Artist 3" style={inputS}/></div>
        <div style={{marginBottom:'12px'}}><label style={labelS}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} style={{...inputS,resize:'vertical'}}/></div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={save} style={{background:'#D4AF37',color:'#1A1A1A',border:'none',padding:'8px 18px',borderRadius:'8px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>{editing?'Update':'Add'}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(BLANK)}} style={{background:'transparent',border:'1px solid #333',color:'#888',padding:'8px 14px',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer'}}>Cancel</button>}
        </div>
      </div>
      {rows.length===0?<p style={{color:'#555',fontSize:'0.82rem'}}>No awards yet.</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {rows.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:'12px',background:'#0A0A0A',border:'1px solid #1E1E1E',borderRadius:'10px',padding:'12px 16px'}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontWeight:700,color:'#EEE',fontSize:'0.85rem'}}>{a.awardShow} {a.year} — {a.category}</p>
                <p style={{margin:'2px 0 0',fontSize:'0.68rem',color:'#555'}}>{a.status}{a.winner?` · 🏆 ${a.winner}`:''}</p>
              </div>
              <button onClick={()=>{setEditing(a.id);setForm({awardShow:a.awardShow,year:a.year,category:a.category,winner:a.winner||'',nominees:a.nominees||'',ceremonyDate:a.ceremonyDate?String(a.ceremonyDate).slice(0,10):'',status:a.status||'upcoming',description:a.description||''})}} style={{background:'transparent',border:'1px solid #2A2A2A',color:'#888',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Edit</button>
              <button onClick={()=>remove(a.id)} style={{background:'transparent',border:'1px solid #C8102E',color:'#C8102E',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Del</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
