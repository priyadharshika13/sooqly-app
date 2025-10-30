import React, { useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
// import { loadCart, clearCart, saveCart } from '../../state/cart'

const API = import.meta.env.VITE_API || 'http://localhost:8000'
const ORANGE = '#f97316'

export default function Checkout(){
  const navigate = useNavigate()
  const [items, setItems] = useState(loadCart())
  const [addr, setAddr] = useState({ address_line:'', city:'', pincode:'' })
  const [geo, setGeo] = useState({ lat:'', lng:'' })
  const total = useMemo(()=> items.reduce((a,b)=>a + b.qty*b.price, 0), [items])

  const token = localStorage.getItem('sooqly_token')

  const changeQty = (i, qty) => {
    const q = Math.max(1, Number(qty)||1)
    const copy = [...items]; copy[i].qty = q; setItems(copy); saveCart(copy)
  }
  const remove = (i) => { const copy=[...items]; copy.splice(i,1); setItems(copy); saveCart(copy) }

  const detect = () => {
    if(!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      pos => setGeo({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }),
      () => alert('Location blocked')
    )
  }

  const ensureToken = async () => {
    if(token) return token
    const rand = Math.floor(Math.random()*999999)
    const res = await axios.post(`${API}/auth/register`, { email:`guest${rand}@sooqly.app`, password:"Guest@123" })
    localStorage.setItem('sooqly_token', res.data.access_token)
    return res.data.access_token
  }

  const placeOrder = async () => {
    if(items.length===0){ alert('Cart empty'); return }
    if(!addr.address_line || !addr.city || !addr.pincode){ alert('Please fill address'); return }
    const t = await ensureToken()
    // 1) place order
    const orderRes = await axios.post(`${API}/orders`, { items: items.map(i=>({product_id:i.product_id, qty:i.qty})) }, {
      headers:{ Authorization:`Bearer ${t}` }
    })
    const orderId = orderRes.data.id
    // 2) save shipping
    await axios.post(`${API}/shipping`, { order_id: orderId, ...addr, lat: geo.lat ? Number(geo.lat) : null, lng: geo.lng ? Number(geo.lng) : null }, {
      headers:{ Authorization:`Bearer ${t}` }
    })
    clearCart()
    navigate(`/order/${orderId}`)
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth: 920, margin:'0 auto'}}>
        <h3>Checkout</h3>

        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
          {/* Address */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Delivery Address</div>
            <div style={{display:'grid', gap:8}}>
              <input className="input" placeholder="Address line" value={addr.address_line} onChange={e=>setAddr({...addr, address_line:e.target.value})}/>
              <div style={{display:'flex', gap:8}}>
                <input className="input" placeholder="City" value={addr.city} onChange={e=>setAddr({...addr, city:e.target.value})}/>
                <input className="input" placeholder="Pincode" value={addr.pincode} onChange={e=>setAddr({...addr, pincode:e.target.value})}/>
              </div>
              <div className="row" style={{gap:8}}>
                <input className="input" placeholder="Lat" value={geo.lat} onChange={e=>setGeo({...geo, lat:e.target.value})} style={{flex:1}}/>
                <input className="input" placeholder="Lng" value={geo.lng} onChange={e=>setGeo({...geo, lng:e.target.value})} style={{flex:1}}/>
                <button className="chip" onClick={detect}>📍 Detect</button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Summary</div>
            <div style={{display:'grid', gap:8}}>
              {items.map((it, i)=>(
                <div key={i} className="row" style={{justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:600}}>{it.name}</div>
                    <div style={{fontSize:12, opacity:.7}}>₹ {it.price}</div>
                  </div>
                  <div className="row" style={{gap:8}}>
                    <input className="input" type="number" min="1" value={it.qty} onChange={e=>changeQty(i, e.target.value)} style={{width:70}}/>
                    <button className="chip" onClick={()=>remove(i)}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{borderTop:'1px dashed #ddd', paddingTop:8, display:'flex', justifyContent:'space-between'}}>
                <strong>Total</strong>
                <strong>₹ {total.toFixed(2)}</strong>
              </div>
              <button className="btn" onClick={placeOrder}>Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
