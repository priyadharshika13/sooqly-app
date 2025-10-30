// src/ui/admin/AdminRecipes.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app/'
const ORANGE = '#f97316'

export default function AdminRecipes(){
  const token = localStorage.getItem('sooqly_token')
  const auth = token ? { Authorization: `Bearer ${token}` } : {}

  const [recipes, setRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [current, setCurrent] = useState({ id:null, title:'', description:'', image_url:'', tags:'' })
  const [ings, setIngs] = useState([]) // {id, product_id, name, qty}

  const loadAll = async () => {
    const rs = await axios.get(`${API}/recipes`); setRecipes(rs.data)
    const ps = await axios.get(`${API}/products`); setProducts(ps.data)
  }
  useEffect(()=>{ loadAll() }, [])

  const submitRecipe = async (e) => {
    e.preventDefault()
    const qs = new URLSearchParams(current)
    if(current.id) await axios.put(`${API}/recipes/${current.id}?${qs}`, null, { headers: auth })
    else {
      const res = await axios.post(`${API}/recipes?${qs}`, null, { headers: auth })
      current.id = res.data.id
    }
    loadAll()
  }

  const edit = async (r) => {
    setCurrent({ id:r.id, title:r.title, description:r.description || '', image_url:r.image_url || '', tags:r.tags || '' })
    const res = await axios.get(`${API}/recipes/${r.id}/ingredients`, { headers: auth })
    const items = (res.data.items || []).map((i, idx) => ({ key: `${i.product_id}-${idx}`, id:i.id, product_id:i.product_id, name:i.name, qty:i.qty }))
    setIngs(items)
  }

  const delRecipe = async (id) => {
    if(!confirm('Delete recipe?')) return
    await axios.delete(`${API}/recipes/${id}`, { headers: auth })
    setCurrent({ id:null, title:'', description:'', image_url:'', tags:'' })
    setIngs([]); loadAll()
  }

  // ingredient CRUD (client-side + server calls)
  const addIng = () => setIngs([...ings, { key: crypto.randomUUID(), id:null, product_id:'', name:'', qty:1 }])

  const saveIngs = async () => {
    if(!current.id){ alert('Save recipe first'); return }
    // Replace-all strategy: delete all then re-add
    await axios.delete(`${API}/recipes/${current.id}/ingredients`, { headers: auth })
    for(const i of ings){
      if(!i.product_id) continue
      await axios.post(`${API}/recipes/${current.id}/ingredients`, null, { params: { product_id:i.product_id, qty:i.qty }, headers: auth })
    }
    alert('Ingredients saved'); edit({ id: current.id, ...current })
  }

  const setProd = (rowIdx, productId) => {
    const p = products.find(x=>x.id === Number(productId))
    const copy = [...ings]; copy[rowIdx].product_id = Number(productId); copy[rowIdx].name = p?.name || ''; setIngs(copy)
  }

  const setQty = (rowIdx, qty) => {
    const copy = [...ings]; copy[rowIdx].qty = qty; setIngs(copy)
  }

  const removeRow = (rowIdx) => setIngs(ings.filter((_,i)=>i!==rowIdx))

  return (
    <div>
      <h2 style={{color:ORANGE, marginBottom:12}}>Recipes & Ingredients</h2>

      <form onSubmit={submitRecipe} style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:12}}>
        <input placeholder="Title" value={current.title} onChange={e=>setCurrent({...current, title:e.target.value})}/>
        <input placeholder="Image URL" value={current.image_url} onChange={e=>setCurrent({...current, image_url:e.target.value})}/>
        <input placeholder="Tags (comma, e.g., fish,spicy)" value={current.tags} onChange={e=>setCurrent({...current, tags:e.target.value})}/>
        <input placeholder="Description" style={{gridColumn:'1 / span 3'}} value={current.description} onChange={e=>setCurrent({...current, description:e.target.value})}/>
        <button style={{background:ORANGE, color:'#fff', border:'none', padding:'10px 12px', borderRadius:8, cursor:'pointer'}}>{current.id ? 'Update Recipe' : 'Create Recipe'}</button>
        {current.id && <button type="button" onClick={()=>delRecipe(current.id)} style={{border:'1px solid #fee2e2', background:'#fef2f2', color:'#b91c1c', borderRadius:8, padding:'10px 12px'}}>Delete Recipe</button>}
      </form>

      {current.id && (
        <div style={{marginTop:16}}>
          <h3 style={{marginBottom:8}}>Ingredients for: <span style={{color:ORANGE}}>{current.title}</span></h3>
          <div style={{background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:12}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{textAlign:'left'}}><th style={{width:'55%'}}>Product</th><th style={{width:'20%'}}>Qty</th><th></th></tr></thead>
              <tbody>
                {ings.map((row, idx)=>(
                  <tr key={row.key || idx} style={{borderTop:'1px solid #eee'}}>
                    <td>
                      <select value={row.product_id} onChange={e=>setProd(idx, e.target.value)} style={{width:'100%'}}>
                        <option value="">-- choose product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                      </select>
                    </td>
                    <td><input value={row.qty} onChange={e=>setQty(idx, e.target.value)} /></td>
                    <td style={{textAlign:'right'}}>
                      <button onClick={()=>removeRow(idx)} style={{border:'1px solid #fee2e2', background:'#fef2f2', color:'#b91c1c', borderRadius:6, padding:'6px 10px'}}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={addIng} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, padding:'8px 12px'}}>+ Add Row</button>
              <button onClick={saveIngs} style={{background:ORANGE, color:'#fff', border:'none', borderRadius:8, padding:'8px 12px'}}>Save Ingredients</button>
            </div>
          </div>
        </div>
      )}

      <div style={{marginTop:24}}>
        <h3>All Recipes</h3>
        <div style={{display:'grid', gap:8}}>
          {recipes.map(r => (
            <div key={r.id} style={{border:'1px solid #e5e7eb', borderRadius:12, padding:10, background:'#fff', display:'flex', alignItems:'center', gap:12}}>
              <img src={r.image_url || 'https://via.placeholder.com/120x80'} style={{width:120, height:80, objectFit:'cover', borderRadius:8}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{r.title}</div>
                <div style={{fontSize:12, opacity:.7}}>{r.tags}</div>
              </div>
              <button onClick={()=>edit(r)} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, padding:'8px 12px'}}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
