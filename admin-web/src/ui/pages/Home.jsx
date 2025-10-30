// src/ui/pages/Home.jsx
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import NavBar from '../NavBar'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'
const FILTERS = ["Fast Delivery","Rating 4.0+","Less than ₹300","New on Sooqly"]
const TABS = ["All","Fishes","Spices","Add-ons"]

export default function Home(){
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('All')
  const [filters, setFilters] = useState([])
  const [products, setProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [recipes, setRecipes] = useState([])
  const [cart, setCart] = useState([])
  const [token, setToken] = useState(localStorage.getItem('sooqly_token'))

  // panels under a product card
  const [panel, setPanel] = useState({ type: null, productId: null, items: [] })

  const q = searchParams.get('q') || ''

  useEffect(()=>{ (async()=>{
    const off = await axios.get(`${API}/offers`).catch(()=>({data:[]})); setOffers(off.data)
    const rec = await axios.get(`${API}/recipes`).catch(()=>({data:[]})); setRecipes(rec.data)
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

  const saveToken = (t) => { setToken(t); localStorage.setItem('sooqly_token', t) }

  const ensureToken = async () => {
    if(token) return token
    const rand = Math.floor(Math.random()*999999)
    const res = await axios.post(`${API}/auth/register`, { email:`guest${rand}@sooqly.app`, password:"Guest@123" })
    saveToken(res.data.access_token)
    return res.data.access_token
  }

  const add = (p) => {
    setCart(c=>{
      const i = c.findIndex(ci => ci.product_id===p.id)
      if(i>=0){ const copy=[...c]; copy[i].qty+=1; return copy }
      return [...c, {product_id:p.id, name:p.name, price:p.price, qty:1}]
    })
  }

  const checkout = async (recipeTitle=null) => {
    const t = await ensureToken()
    if(cart.length===0){ alert("Cart empty"); return }
    const payload = { items: cart.map(c=>({product_id:c.product_id, qty:c.qty})) }
    if(recipeTitle) payload.recipe_title = recipeTitle
    const res = await axios.post(`${API}/orders`, payload, { headers:{ Authorization:`Bearer ${t}`}})
    alert(`Order #${res.data.id} ₹${res.data.total_amount.toFixed(2)}\\n${res.data.notes || ""}`)
    setCart([])
  }

  // --- fish-specific helpers
  const openRecipesForFish = async (product) => {
    // use tag-based match: recipes?tag=fish (backend supports tags field on Recipe)
    const list = await axios.get(`${API}/recipes`, { params: {} }).then(r=>r.data)
    const byFish = list.filter(r => (r.tags || '').toLowerCase().includes('fish'))
    setPanel({ type:'recipes', productId: product.id, items: byFish })
  }

  const openAddonsForFish = async (product) => {
    // show add-ons like lemon/spices via tag=addon
    const list = await axios.get(`${API}/products`, { params: { tag:'addon' } }).then(r=>r.data)
    setPanel({ type:'addons', productId: product.id, items: list })
  }

  const addRecipeIngredients = async (recipe) => {
    const ing = await axios.get(`${API}/recipes/${recipe.id}/ingredients`).then(r=>r.data)
    const items = ing.items || []
    setCart(c=>{
      const copy=[...c]
      items.forEach(i=>{
        const idx = copy.findIndex(ci=>ci.product_id===i.product_id)
        if(idx>=0) copy[idx].qty += i.qty
        else copy.push({ product_id:i.product_id, name:i.name, price:i.price, qty:i.qty })
      })
      return copy
    })
    alert(`Added ingredients for ${recipe.title}`)
  }

  const totalQty = cart.reduce((a,b)=>a+b.qty,0)
  const totalAmt = cart.reduce((a,b)=>a+b.qty*b.price,0)

  return (
    <>
      <NavBar />

      <div className="container">
        {/* Banner */}
        <div className="banner">
          <img src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=60"
               style={{width:'100%',height:220,objectFit:'cover'}}/>
        </div>

        {/* Filters */}
        <div className="chips">
          {FILTERS.map(f => <div key={f} className={'chip ' + (filters.includes(f)?'active':'')} onClick={()=>toggleFilter(f)}>{f}</div>)}
        </div>

        {/* Categories (Tabs) */}
        <h3 style={{marginTop:12}}>Categories</h3>
        <div className="tabs">
          {TABS.map(t => <div key={t} className={'tab ' + (tab===t?'active':'')} onClick={()=>setTab(t)}>{t}</div>)}
        </div>

        {/* Offers (optional) */}
        {offers.length>0 && (
          <div className="offer">
            <strong>{offers[0].title}</strong> — {offers[0].description} ({offers[0].offer_pct}% off)
          </div>
        )}

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
                {p.offer_pct>0 && <div style={{fontSize:12, color:'#2f855a', marginTop:4}}>{p.offer_pct}% OFF</div>}

                <div className="btn" style={{marginTop:8}} onClick={()=>add(p)}>Add to Cart</div>

                {/* If Fishes category, show extra actions */}
                {p.category_id === 2 && (
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <div className="btn" style={{background:'#1565c0', flex:1}} onClick={()=>openRecipesForFish(p)}>Recipe</div>
                    <div className="btn" style={{background:'#111827', flex:1}} onClick={()=>openAddonsForFish(p)}>Add-ons</div>
                  </div>
                )}

                {/* Inline panel under the fish card */}
                {panel.productId === p.id && panel.type === 'recipes' && (
                  <div style={{marginTop:10, borderTop:'1px solid #eee', paddingTop:8}}>
                    <div style={{fontWeight:700, marginBottom:6}}>Recipes for fish</div>
                    <div style={{display:'grid', gap:8}}>
                      {panel.items.map(r => (
                        <div key={r.id} style={{display:'flex', justifyContent:'space-between', gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600}}>{r.title}</div>
                            <div style={{fontSize:12, opacity:.7}}>{r.description || 'Tasty kit'}</div>
                          </div>
                          <div className="btn" onClick={()=>addRecipeIngredients(r)}>Add ingredients</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {panel.productId === p.id && panel.type === 'addons' && (
                  <div style={{marginTop:10, borderTop:'1px solid #eee', paddingTop:8}}>
                    <div style={{fontWeight:700, marginBottom:6}}>Popular add-ons</div>
                    <div style={{display:'grid', gap:8}}>
                      {panel.items.map(a => (
                        <div key={a.id} style={{display:'flex', justifyContent:'space-between', gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600}}>{a.name}</div>
                            <div style={{fontSize:12, opacity:.7}}>₹ {a.price}</div>
                          </div>
                          <div className="btn" onClick={()=>add(a)}>Add</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer">
          <div>© {new Date().getFullYear()} Sooqly</div>
          <div className="nav"><a href="/">Home</a><a href="/track">Track</a><a href="/login">Login</a></div>
        </div>

        {/* Cart bar */}
        <div className="cart">
          <strong>{totalQty} items • ₹ {totalAmt.toFixed(2)}</strong>
          <div className="btn" onClick={()=>checkout()}>Checkout</div>
        </div>
      </div>
    </>
  )
}
