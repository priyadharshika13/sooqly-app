// src/ui/admin/AdminOffers.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API || 'http://localhost:8000'
const ORANGE = '#f97316'

export default function AdminOffers(){
  const token = localStorage.getItem('sooqly_token')
  const auth = token ? { Authorization: `Bearer ${token}` } : {}

  const [list, setList] = useState([])
  const [form, setForm] = useState({ id:null, title:'', description:'', offer_pct:0, banner_image:'', active:true })

  const load = async () => {
    const res = await axios.get(`${API}/offers`)
    setList(res.data)
  }
  useEffect(()=>{ load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const qs = new URLSearchParams(form)
    if(form.id){
      await axios.put(`${API}/offers/${form.id}?${qs}`, null, { headers: auth })
    } else {
      await axios.post(`${API}/offers?${qs}`, null, { headers: auth })
    }
    setForm({ id:null, title:'', description:'', offer_pct:0, banner_image:'', active:true })
    load()
  }

  const edit = (o) => setForm({ id:o.id, title:o.title, description:o.description || '', offer_pct:o.offer_pct, banner_image:o.banner_image || '', active:o.active })
  const del = async (id) => { if(confirm('Delete offer?')){ await axios.delete(`${API}/offers/${id}`, { headers: auth }); load() } }

  return (
    <div>
      <h2 style={{color:ORANGE, marginBottom:12}}>Offers</h2>

      <form onSubmit={submit} style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:12}}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input placeholder="Offer % (e.g., 20)" value={form.offer_pct} onChange={e=>setForm({...form, offer_pct:e.target.value})}/>
        <input placeholder="Banner image URL" value={form.banner_image} onChange={e=>setForm({...form, banner_image:e.target.value})}/>
        <input placeholder="Description" style={{gridColumn:'1 / span 2'}} value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})}/> Active</label>
        <button style={{background:ORANGE, color:'#fff', border:'none', padding:'10px 12px', borderRadius:8, cursor:'pointer'}}>{form.id ? 'Update' : 'Create'}</button>
      </form>

      <div style={{marginTop:16}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{textAlign:'left'}}><th>Title</th><th>%</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {list.map(o=>(
              <tr key={o.id} style={{borderTop:'1px solid #eee'}}>
                <td>{o.title}</td>
                <td>{o.offer_pct}</td>
                <td>{o.active ? 'Yes' : 'No'}</td>
                <td style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                  <button onClick={()=>edit(o)} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:6, padding:'6px 10px'}}>Edit</button>
                  <button onClick={()=>del(o.id)} style={{border:'1px solid #fee2e2', background:'#fef2f2', color:'#b91c1c', borderRadius:6, padding:'6px 10px'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
