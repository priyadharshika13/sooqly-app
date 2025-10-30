import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
import { loadCart, clearCart, saveCart } from '../../state/cart'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'
const ORANGE = '#f97316'

export default function Checkout(){
  const navigate = useNavigate()

  // Always start with a usable array (never null/undefined)
  const [items, setItems] = useState(() => {
    try { return Array.isArray(loadCart()) ? loadCart() : [] } catch { return [] }
  })

  const [addr, setAddr] = useState({ address_line:'', city:'', pincode:'' })
  const [geo, setGeo] = useState({ lat:'', lng:'' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Persist on change, and protect against non-array states
  useEffect(() => {
    try { saveCart(Array.isArray(items) ? items : []) } catch {}
  }, [items])

  const total = useMemo(() => {
    try {
      return (Array.isArray(items) ? items : []).reduce((a,b) => a + (Number(b.qty||0) * Number(b.price||0)), 0)
    } catch { return 0 }
  }, [items])

  const token = typeof window !== 'undefined' ? localStorage.getItem('sooqly_token') : null

  const changeQty = (i, qty) => {
    const q = Math.max(1, Number(qty) || 1)
    setItems(prev => {
      const arr = Array.isArray(prev) ? [...prev] : []
      if (!arr[i]) return arr
      arr[i] = { ...arr[i], qty: q }
      return arr
    })
  }

  const remove = (i) => {
    setItems(prev => {
      const arr = Array.isArray(prev) ? [...prev] : []
      arr.splice(i,1)
      return arr
    })
  }

  const detect = () => {
    if(!navigator.geolocation) { alert('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      pos => setGeo({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }),
      () => alert('Location blocked')
    )
  }

  const ensureToken = async () => {
    if(token) return token
    const rand = Math.floor(Math.random()*999999)
    const res = await axios.post(`${API}/auth/register`, { email:`guest${rand}@sooqly.app`, password:"Guest@123" })
    const t = res.data?.access_token
    if(!t) throw new Error('Token not received')
    localStorage.setItem('sooqly_token', t)
    return t
  }

  const placeOrder = async () => {
    setErr('')
    if(!Array.isArray(items) || items.length===0){ setErr('Cart is empty.'); return }
    if(!addr.address_line || !addr.city || !addr.pincode){ setErr('Please fill address.'); return }
    setBusy(true)
    try {
      const t = await ensureToken()
      // Normalize payload to contain product_id/qty (defensive against bad items)
      const normalized = items
        .filter(Boolean)
        .map(i => ({
          product_id: Number(i.product_id ?? i.id),
          qty: Number(i.qty || 1)
        }))
        .filter(i => i.product_id && i.qty > 0)

      if(normalized.length === 0) { throw new Error('No valid items to order') }

      const orderRes = await axios.post(`${API}/orders`, { items: normalized }, {
        headers:{ Authorization:`Bearer ${t}` }
      })
      const orderId = orderRes.data?.id
      if(!orderId) throw new Error('Order ID missing from response')

      await axios.post(`${API}/shipping`, {
        order_id: orderId,
        address_line: addr.address_line,
        city: addr.city,
        pincode: addr.pincode,
        lat: geo.lat ? Number(geo.lat) : null,
        lng: geo.lng ? Number(geo.lng) : null
      }, { headers:{ Authorization:`Bearer ${t}` } })

      clearCart()
      navigate(`/order/${orderId}`)
    } catch (e) {
      console.error(e)
      setErr(e?.response?.data?.detail || e?.message || 'Failed to place order')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth: 920, margin:'0 auto'}}>
        <h3>Checkout</h3>

        {err && (
          <div style={{background:'#FEF2F2', border:'1px solid #FECACA', color:'#7F1D1D', padding:10, borderRadius:10, margin:'8px 0'}}>
            {err}
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
          {/* Address */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Delivery Address</div>
            <div style={{display:'grid', gap:8}}>
              <input className="input" placeholder="Address line"
                     value={addr.address_line} onChange={e=>setAddr({...addr, address_line:e.target.value})}/>
              <div style={{display:'flex', gap:8}}>
                <input className="input" placeholder="City"
                       value={addr.city} onChange={e=>setAddr({...addr, city:e.target.value})}/>
                <input className="input" placeholder="Pincode"
                       value={addr.pincode} onChange={e=>setAddr({...addr, pincode:e.target.value})}/>
              </div>
              <div className="row" style={{gap:8}}>
                <input className="input" placeholder="Lat" value={geo.lat}
                       onChange={e=>setGeo({...geo, lat:e.target.value})} style={{flex:1}}/>
                <input className="input" placeholder="Lng" value={geo.lng}
                       onChange={e=>setGeo({...geo, lng:e.target.value})} style={{flex:1}}/>
                <button className="chip" onClick={detect}>📍 Detect</button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Summary</div>
            <div style={{display:'grid', gap:8}}>
              {(Array.isArray(items) ? items : []).map((it, i)=>(
                <div key={i} className="row" style={{justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:600}}>{it?.name || 'Item'}</div>
                    <div style={{fontSize:12, opacity:.7}}>₹ {Number(it?.price||0)}</div>
                  </div>
                  <div className="row" style={{gap:8}}>
                    <input className="input" type="number" min="1"
                           value={Number(it?.qty||1)}
                           onChange={e=>changeQty(i, e.target.value)} style={{width:70}}/>
                    <button className="chip" onClick={()=>remove(i)}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{borderTop:'1px dashed #ddd', paddingTop:8, display:'flex', justifyContent:'space-between'}}>
                <strong>Total</strong>
                <strong>₹ {Number(total||0).toFixed(2)}</strong>
              </div>
              <button className="btn" disabled={busy} onClick={placeOrder}>{busy ? 'Placing…' : 'Place Order'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
