// src/ui/admin/AdminProducts.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'
const ORANGE = '#f97316'

export default function AdminProducts(){
  const token = localStorage.getItem('sooqly_token')
  const auth = token ? { Authorization: `Bearer ${token}` } : {}

  const [list, setList] = useState([])
  const [form, setForm] = useState({
    id:null, name:'', price:'', category_id:2, rating:4.5, is_fast_delivery:false,
    offer_pct:0, image_url:'', in_stock:true, is_new:false, tags:''
  })

  const load = async () => {
    const res = await axios.get(`${API}/products`)
    setList(res.data)
  }
  useEffect(()=>{ load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const data = new URLSearchParams(form)
    if(form.id){
      await axios.put(`${API}/products/${form.id}?${data}`, null, { headers: auth })
    } else {
      await axios.post(`${API}/products?${data}`, null, { headers: auth })
    }
    setForm({ id:null, name:'', price:'', category_id:2, rating:4.5, is_fast_delivery:false, offer_pct:0, image_url:'', in_stock:true, is_new:false, tags:'' })
    load()
  }

  const edit = (p) => {
    setForm({
      id: p.id, name: p.name, price: p.price, category_id: p.category_id ?? 2,
      rating: p.rating, is_fast_delivery: p.is_fast_delivery, offer_pct: p.offer_pct,
      image_url: p.image_url || '', in_stock: p.in_stock, is_new: p.is_new, tags: p.tags || ''
    })
  }

  const del = async (id) => {
    if(!confirm('Delete product?')) return
    await axios.delete(`${API}/products/${id}`, { headers: auth })
    load()
  }

  return (
    <div>
      <h2 style={{color:ORANGE, marginBottom:12}}>Products</h2>

      <form onSubmit={submit} style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:12}}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <select value={form.category_id} onChange={e=>setForm({...form, category_id: Number(e.target.value)})}>
          <option value={2}>Fishes</option>
          <option value={3}>Spices</option>
          <option value={4}>Add-ons</option>
        </select>
        <input placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}/>

        <input placeholder="Rating" value={form.rating} onChange={e=>setForm({...form, rating:e.target.value})}/>
        <input placeholder="Offer %" value={form.offer_pct} onChange={e=>setForm({...form, offer_pct:e.target.value})}/>
        <input placeholder="Tags (comma)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <label><input type="checkbox" checked={form.is_fast_delivery} onChange={e=>setForm({...form, is_fast_delivery: e.target.checked})}/> Fast</label>
          <label><input type="checkbox" checked={form.in_stock} onChange={e=>setForm({...form, in_stock: e.target.checked})}/> In stock</label>
          <label><input type="checkbox" checked={form.is_new} onChange={e=>setForm({...form, is_new: e.target.checked})}/> New</label>
        </div>

        <button style={{gridColumn:'1 / span 2', background:ORANGE, color:'#fff', border:'none', padding:'10px 12px', borderRadius:8, cursor:'pointer'}}>{form.id ? 'Update' : 'Create'}</button>
        {form.id && <button type="button" onClick={()=>setForm({ id:null, name:'', price:'', category_id:2, rating:4.5, is_fast_delivery:false, offer_pct:0, image_url:'', in_stock:true, is_new:false, tags:'' })} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, cursor:'pointer'}}>Cancel</button>}
      </form>

      <div style={{marginTop:16}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{textAlign:'left'}}><th>Name</th><th>₹</th><th>Cat</th><th>Tags</th><th>Rating</th><th>Flags</th><th></th></tr></thead>
          <tbody>
            {list.map(p=>(
              <tr key={p.id} style={{borderTop:'1px solid #eee'}}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category_id}</td>
                <td>{p.tags}</td>
                <td>{p.rating}</td>
                <td style={{fontSize:12, opacity:.7}}>{p.is_fast_delivery?'Fast ':''}{p.is_new?'New ':''}{!p.in_stock?'(OOS)':''}</td>
                <td style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                  <button onClick={()=>edit(p)} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:6, padding:'6px 10px'}}>Edit</button>
                  <button onClick={()=>del(p.id)} style={{border:'1px solid #fee2e2', background:'#fef2f2', color:'#b91c1c', borderRadius:6, padding:'6px 10px'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
