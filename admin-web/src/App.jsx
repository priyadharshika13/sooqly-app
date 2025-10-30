import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import NavBar from '../NavBar'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'
const FILTERS = ["Fast Delivery","Rating 4.0+","Less than ₹300","New on Sooqly"]
const TABS = ["All","Fishes","Spices","Add-ons"]
const ORANGE = "#f97316"

export default function Home(){
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('All')
  const [filters, setFilters] = useState([])
  const [products, setProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [recipes, setRecipes] = useState([])
  const [cart, setCart] = useState([])
  const [token, setToken] = useState(localStorage.getItem('sooqly_token'))
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

  const openRecipesForFish = async (product) => {
    const list = await axios.get(`${API}/recipes`).then(r=>r.data)
    const byFish = list.filter(r => (r.tags || '').toLowerCase().includes('fish'))
    setPanel({ type:'recipes', productId: product.id, items: byFish })
  }

  const openAddonsForFish = async (product) => {
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
        <div style={{margin:'16px 0', borderRadius:16, overflow:'hidden'}}>
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=60"
               style={{width:'100%',height:220,objectFit:'cover'}}/>
        </div>

        {/* Filters */}
        <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:12}}>
          {FILTERS.map(f => (
            <div
              key={f}
              onClick={()=>toggleFilter(f)}
              style={{
                padding:'8px 14px', borderRadius:999, whiteSpace:'nowrap',
                border:`1px solid ${filters.includes(f)?ORANGE:'#e5e7eb'}`,
                color:filters.includes(f)?ORANGE:'#111', background:'#fff', cursor:'pointer'
              }}>{f}</div>
          ))}
        </div>

        {/* Categories */}
        <h3 style={{marginBottom:8}}>Categories</h3>
        <div style={{display:'flex', gap:8, marginBottom:16}}>
          {TABS.map(t=>(
            <div key={t}
              onClick={()=>setTab(t)}
              style={{
                padding:'8px 16px', borderRadius:999, cursor:'pointer',
                background:tab===t?ORANGE:'#f1f5f9',
                color:tab===t?'#fff':'#111', fontWeight:tab===t?600:400
              }}>{t}</div>
          ))}
        </div>

        {/* Offers */}
        {offers.length>0 && (
          <div style={{
            background:'#fff7ed', border:`1px dashed ${ORANGE}`,
            borderRadius:12, padding:12, marginBottom:16
          }}>
            <strong style={{color:ORANGE}}>{offers[0].title}</strong> — {offers[0].description}
          </div>
        )}

        {/* Product Grid */}
        <div style={{display:'flex', flexWrap:'wrap', gap:16}}>
          {products.map(p=>(
            <div key={p.id} style={{
              flex:'1 1 calc(25% - 16px)', minWidth:240, background:'#fff',
              borderRadius:16, border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <img src={p.image_url || 'https://via.placeholder.com/400x240'} style={{width:'100%',height:140,objectFit:'cover',borderTopLeftRadius:16,borderTopRightRadius:16}}/>
              <div style={{padding:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:600}}>
                  <span>{p.name}</span><span>₹{p.price}</span>
                </div>
                <div style={{fontSize:12,opacity:.7,marginTop:4}}>
                  {p.rating.toFixed(1)} ★ {p.is_fast_delivery?'• Fast':''} {p.is_new?'• New':''}
                </div>
                {p.offer_pct>0 && <div style={{fontSize:12,color:ORANGE,marginTop:4}}>{p.offer_pct}% OFF</div>}

                <div style={{marginTop:8,background:ORANGE,color:'#fff',textAlign:'center',borderRadius:8,padding:'8px 0',cursor:'pointer'}}
                     onClick={()=>add(p)}>Add to Cart</div>

                {p.category_id===2 && (
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <div style={{flex:1,background:'#fb923c',color:'#fff',borderRadius:8,padding:'8px 0',textAlign:'center',cursor:'pointer'}}
                         onClick={()=>openRecipesForFish(p)}>Recipe</div>
                    <div style={{flex:1,background:'#c2410c',color:'#fff',borderRadius:8,padding:'8px 0',textAlign:'center',cursor:'pointer'}}
                         onClick={()=>openAddonsForFish(p)}>Add-ons</div>
                  </div>
                )}

                {panel.productId===p.id && panel.type==='recipes' && (
                  <div style={{marginTop:10,borderTop:'1px solid #eee',paddingTop:6}}>
                    <div style={{fontWeight:700,color:ORANGE}}>Recipes</div>
                    {panel.items.map(r=>(
                      <div key={r.id} style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:500}}>{r.title}</div>
                          <div style={{fontSize:12,opacity:.7}}>{r.description}</div>
                        </div>
                        <div style={{background:ORANGE,color:'#fff',borderRadius:6,padding:'4px 8px',cursor:'pointer'}}
                             onClick={()=>addRecipeIngredients(r)}>Add</div>
                      </div>
                    ))}
                  </div>
                )}

                {panel.productId===p.id && panel.type==='addons' && (
                  <div style={{marginTop:10,borderTop:'1px solid #eee',paddingTop:6}}>
                    <div style={{fontWeight:700,color:ORANGE}}>Popular Add-ons</div>
                    {panel.items.map(a=>(
                      <div key={a.id} style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                        <div>{a.name}</div>
                        <div style={{background:ORANGE,color:'#fff',borderRadius:6,padding:'4px 8px',cursor:'pointer'}}
                             onClick={()=>add(a)}>Add</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{marginTop:32,borderTop:'1px solid #e5e7eb',padding:'16px 0',textAlign:'center',color:'#555'}}>
          © {new Date().getFullYear()} Sooqly | Powered by Orange Vibes 🍊
        </footer>

        {/* Cart Bar */}
        <div style={{
          position:'sticky',bottom:0,left:0,right:0,background:'#fff',
          borderTop:`2px solid ${ORANGE}`,padding:'12px 16px',display:'flex',
          justifyContent:'space-between',alignItems:'center',boxShadow:'0 -2px 6px rgba(0,0,0,0.05)'
        }}>
          <strong>{totalQty} items • ₹ {totalAmt.toFixed(2)}</strong>
          <div style={{background:ORANGE,color:'#fff',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}
               onClick={()=>checkout()}>Checkout</div>
        </div>
      </div>
    </>
  )
}
