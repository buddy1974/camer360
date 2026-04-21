'use client'
import { useState, useEffect } from 'react'

type Birthday = { id:number; name:string; birthMonth:number; birthDay:number; birthYear:number|null; category:string|null; country:string|null; imageUrl:string|null; celebSlug:string|null }
const BLANK = { name:'', birthMonth:1, birthDay:1, birthYear:'', category:'', country:'', imageUrl:'', celebSlug:'' }
const inputS: React.CSSProperties = { width:'100%', background:'#0A0A0A', border:'1px solid #2A2A2A', borderRadius:'6px', padding:'8px 10px', color:'#EEE', fontSize:'0.82rem', outline:'none', boxSizing:'border-box' }
const labelS: React.CSSProperties = { display:'block', fontSize:'0.6rem', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BirthdaysAdmin() {
  const [rows,    setRows]    = useState<Birthday[]>([])
  const [form,    setForm]    = useState(BLANK)
  const [editing, setEditing] = useState<number|null>(null)
  const [msg,     setMsg]     = useState('')

  async function load() { const r=await fetch('/api/admin/birthdays');const d=await r.json();setRows(Array.isArray(d)?d:[]) }
  useEffect(()=>{load()},[])

  async function save() {
    const url=editing?`/api/admin/birthdays/${editing}`:'/api/admin/birthdays'
    const r=await fetch(url,{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      name:form.name,birthMonth:Number(form.birthMonth),birthDay:Number(form.birthDay),
      birthYear:form.birthYear?Number(form.birthYear):null,category:form.category||null,
      country:form.country||null,imageUrl:form.imageUrl||null,celebSlug:form.celebSlug||null
    })})
    const d=await r.json()
    if(d.ok||d.id){setMsg('✓ Saved');setForm(BLANK);setEditing(null);load()}else setMsg(`✗ ${d.error}`)
  }

  async function remove(id:number){if(!confirm('Delete?'))return;await fetch(`/api/admin/birthdays/${id}`,{method:'DELETE'});load()}

  return (
    <div style={{maxWidth:'960px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',margin:0}}>Celebrity Birthdays</h1>
        {msg&&<span style={{fontSize:'0.75rem',color:msg.startsWith('✓')?'#22C55E':'#EF4444'}}>{msg}</span>}
      </div>
      <div style={{background:'#111',border:'1px solid #1E1E1E',borderRadius:'8px',padding:'10px 16px',marginBottom:'16px',fontSize:'0.72rem',color:'#555'}}>
        First time? <a href="#" onClick={async e=>{e.preventDefault();const r=await fetch('/api/admin/db/create-birthdays',{method:'POST'});const d=await r.json();setMsg(d.ok?'✓ Table created':`✗ ${d.error}`)}} style={{color:'#D4AF37',textDecoration:'none',fontWeight:700}}>Create database table →</a>
      </div>
      <div style={{background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:'12px',padding:'20px',marginBottom:'24px'}}>
        <h3 style={{fontSize:'0.75rem',fontWeight:900,color:'#D4AF37',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 16px'}}>{editing?`Editing #${editing}`:'Add Birthday'}</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px',gap:'12px',marginBottom:'12px'}}>
          <div><label style={labelS}>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Samuel Eto'o" style={inputS}/></div>
          <div><label style={labelS}>Month</label><select value={form.birthMonth} onChange={e=>setForm(f=>({...f,birthMonth:Number(e.target.value)}))} style={{...inputS,cursor:'pointer'}}>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
          <div><label style={labelS}>Day</label><input type="number" min={1} max={31} value={form.birthDay} onChange={e=>setForm(f=>({...f,birthDay:Number(e.target.value)}))} style={inputS}/></div>
          <div><label style={labelS}>Year</label><input type="number" value={form.birthYear} onChange={e=>setForm(f=>({...f,birthYear:e.target.value}))} placeholder="1981" style={inputS}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {[{l:'Category',k:'category',p:'Singer, Footballer...'},{l:'Country',k:'country',p:'CM'},{l:'Celebrity Slug',k:'celebSlug',p:'samuel-etoo'}].map(({l,k,p})=>(
            <div key={k}><label style={labelS}>{l}</label><input value={(form as Record<string,string|number>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={p} style={inputS}/></div>
          ))}
        </div>
        <div><label style={labelS}>Image URL</label><input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." style={{...inputS,marginBottom:'12px'}}/></div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={save} style={{background:'#D4AF37',color:'#1A1A1A',border:'none',padding:'8px 18px',borderRadius:'8px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>{editing?'Update':'Add'}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(BLANK)}} style={{background:'transparent',border:'1px solid #333',color:'#888',padding:'8px 14px',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer'}}>Cancel</button>}
        </div>
      </div>
      {rows.length===0?<p style={{color:'#555',fontSize:'0.82rem'}}>No birthdays yet.</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {rows.map(b=>(
            <div key={b.id} style={{display:'flex',alignItems:'center',gap:'12px',background:'#0A0A0A',border:'1px solid #1E1E1E',borderRadius:'10px',padding:'12px 16px'}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontWeight:700,color:'#EEE',fontSize:'0.88rem'}}>{b.name}</p>
                <p style={{margin:'2px 0 0',fontSize:'0.68rem',color:'#555'}}>{MONTHS[b.birthMonth-1]} {b.birthDay}{b.birthYear?` · ${b.birthYear}`:''}{b.category?` · ${b.category}`:''}</p>
              </div>
              <button onClick={()=>{setEditing(b.id);setForm({name:b.name,birthMonth:b.birthMonth,birthDay:b.birthDay,birthYear:b.birthYear?String(b.birthYear):'',category:b.category||'',country:b.country||'',imageUrl:b.imageUrl||'',celebSlug:b.celebSlug||''})}} style={{background:'transparent',border:'1px solid #2A2A2A',color:'#888',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Edit</button>
              <button onClick={()=>remove(b.id)} style={{background:'transparent',border:'1px solid #C8102E',color:'#C8102E',padding:'4px 10px',borderRadius:'6px',fontSize:'0.68rem',cursor:'pointer'}}>Del</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
