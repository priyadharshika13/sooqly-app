import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import TrackingMap from './TrackingMap'

const API = import.meta.env.VITE_API || 'http://localhost:8000'
const FILTERS = ["Fast Delivery","Rating 4.0+","Less than ₹300","New on Sooqly"]
const TABS = ["All","Fishes","Spices","Add-ons"]

export default function App(){
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const [filters, setFilters] = useState([])
  const [products, setProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [recipes, setRecipes] = useState([])
  const [cart, setCart] = useState([])
  const [token, setToken] = useState(null)
  const [orderForTracking, setOrderForTracking] = useState('')

  useEffect(()=>{ (async()=>{
    const off = await axios.get(`${API}/offers`); setOffers(off.data)
    const rec = await axios.get(`${API}/recipes`); setRecipes(rec.data)
  })() }, [])

  const load = async () => {
    const params = {}
    if(q) params.q = q
    if(tab!=='All'){
      const slugToId = { 'Fishes':2,'Spices':3,'Add-ons':4 }
      params.category_id = slugToId[tab]
    }
    if(filters.includes("Fast Delivery")) params.fast = true
    if(filters.includes("Rating 4.0+")) params.rating_gte = 4.0
    if(filters.includes("Less than ₹300")) params.price_lte = 300
    if(filters.includes("New on Sooqly")) params.is_new = true
    const res = await axios.get(`${API}/products`, { params })
    setProducts(res.data)
  }
  useEffect(()=>{ load() }, [q, tab, filters.join(',')])

  const toggleFilter = (f) => setFilters(fs => fs.includes(f) ? fs.filter(x=>x!==f) : [...fs, f])

  const add = (p) => {
    setCart(c=>{
      const i = c.findIndex(ci => ci.product_id===p.id)
      if(i>=0){ const copy=[...c]; copy[i].qty += 1; return copy }
      return [...c, {product_id:p.id, name:p.name, price:p.price, qty:1}]
    })
  }

  const registerAnon = async () => {
    const rand = Math.floor(Math.random()*999999)
    const res = await axios.post(`${API}/auth/register`, { email:`guest${rand}@sooqly.app`, password:"Guest@123" })
    setToken(res.data.access_token); return res.data.access_token
  }

  const checkout = async (recipeTitle=null) => {
    const t = token || await registerAnon()
    if(cart.length===0){ alert("Cart empty"); return }
    const payload = { items: cart.map(c=>({product_id:c.product_id, qty:c.qty})) }
    if(recipeTitle) payload.recipe_title = recipeTitle
    const res = await axios.post(`${API}/orders`, payload, { headers: { Authorization:`Bearer ${t}`}})
    alert(`Order #${res.data.id} ₹${res.data.total_amount.toFixed(2)}\n${res.data.notes || ""}`)
    setOrderForTracking(String(res.data.id))
    setCart([])
  }

  const addRecipe = async (rec) => {
    const r = await axios.get(`${API}/recipes/${rec.id}/ingredients`)
    const list = r.data.items || []
    setCart(c=>{
      const copy=[...c]
      list.forEach(i=>{
        const idx = copy.findIndex(ci => ci.product_id===i.product_id)
        if(idx>=0) copy[idx].qty+=i.qty
        else copy.push({ product_id:i.product_id, name:i.name, price:i.price, qty:i.qty })
      })
      return copy
    })
    alert(`Added ingredients for ${rec.title}`)
  }

  const totalQty = cart.reduce((a,b)=>a+b.qty,0)
  const totalAmt = cart.reduce((a,b)=>a+b.qty*b.price,0)

  return (
    <div className="container">
      <header style={{display:'flex',alignItems:'center',gap:12}}>
        <h2 style={{fontWeight:800}}>Sooqly</h2>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for fish, spices..." style={{flex:1,padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:12,background:'#fff'}}/>
      </header>

      {/* Banner */}
      <div className="banner">
        <img src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=60" style={{width:'100%',height:220,objectFit:'cover'}}/>
      </div>

      {/* Offers */}
      {offers.length>0 && (
        <div className="offer">
          <strong>{offers[0].title}</strong> — {offers[0].description} ({offers[0].offer_pct}% off)
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => <div key={t} className={'tab ' + (tab===t?'active':'')} onClick={()=>setTab(t)}>{t}</div>)}
      </div>

      {/* Filters */}
      <div className="chips">
        {FILTERS.map(f => <div key={f} className={'chip ' + (filters.includes(f)?'active':'')} onClick={()=>toggleFilter(f)}>{f}</div>)}
      </div>

      {/* Grid */}
      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <img src={p.image_url || 'https://via.placeholder.com/400x240'} />
            <div className="body">
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{fontWeight:700}}>{p.name}</div>
                <div>₹ {p.price}</div>
              </div>
              <div style={{fontSize:12,opacity:.7,marginTop:4}}>{p.rating.toFixed(1)} ★ {p.is_fast_delivery?'• Fast':''} {p.is_new?'• New':''}</div>
              {p.offer_pct>0 && <div style={{fontSize:12, color:'#f97316', marginTop:4}}>{p.offer_pct}% OFF</div>}
              <div className="btn" style={{marginTop:8}} onClick={()=>add(p)}>Add</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipes */}
      <h3 style={{marginTop:16}}>Recipes</h3>
      <div style={{display:'flex', gap:12, overflowX:'auto', paddingBottom:4}}>
        {recipes.map(r => (
          <div key={r.id} style={{minWidth:260, background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, overflow:'hidden'}}>
            <img src={r.image_url || 'https://images.unsplash.com/photo-1543353071-087092ec393e?auto=format&fit=crop&w=1200&q=60'} style={{width:'100%', height:120, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700}}>{r.title}</div>
              <div style={{fontSize:12,opacity:.7}}>{r.description || 'Tasty kit'}</div>
              <div className="btn" style={{marginTop:8, background:'#1565c0'}} onClick={()=>addRecipe(r)}>Add ingredients</div>
              <div className="btn" style={{marginTop:8, background:'#111827'}} onClick={()=>checkout(r.title)}>Buy recipe (cart)</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Map */}
      <section style={{marginTop:20}}>
        <h3>Track your order</h3>
        <input placeholder="Order ID" value={orderForTracking} onChange={e=>setOrderForTracking(e.target.value)} style={{padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, marginRight:8}}/>
        <TrackingMap api={API} orderId={orderForTracking} />
      </section>

      {/* Footer */}
      <div className="footer">
        <div>© {new Date().getFullYear()} Sooqly</div>
        <div className="nav"><a>Home</a><a>Offers</a><a>Recipes</a><a>Cart</a></div>
      </div>

      {/* Cart */}
      <div className="cart">
        <strong>{totalQty} items • ₹ {totalAmt.toFixed(2)}</strong>
        <div className="btn" onClick={()=>checkout()}>Checkout</div>
      </div>
    </div>
  )
}
