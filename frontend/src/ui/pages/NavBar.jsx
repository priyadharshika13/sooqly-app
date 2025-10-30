// src/ui/NavBar.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export default function NavBar(){
  const [loc, setLoc] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const navigate = useNavigate()

  useEffect(()=>{ setSearchParams(p => { q ? p.set('q', q) : p.delete('q'); return p }) }, [q])

  const detect = () => {
    if(!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      pos => setLoc({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
      err => alert('Location blocked')
    )
  }

  const logged = !!localStorage.getItem('sooqly_token')

  return (
    <header style={{position:'sticky', top:0, zIndex:50, background:'#f7faf8', borderBottom:'1px solid #e5e7eb'}}>
      <div className="container" style={{display:'flex', gap:12, alignItems:'center', padding:'10px 12px'}}>
        <div style={{fontWeight:800, fontSize:20}}><Link to="/" style={{textDecoration:'none', color:'#111'}}>Sooqly</Link></div>

        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search for fish, spices, add-ons…"
          style={{flex:1, padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:12, background:'#fff'}}
        />

        <button onClick={detect} className="chip">📍 {loc ? `${loc.lat}, ${loc.lng}` : 'Detect'}</button>
      {/* <div className="btn" onClick={gotoCheckout}>Proceed to Checkout</div> */}

        {logged ? (
          <button className="chip" onClick={()=>{
            if(confirm('Logout?')){ localStorage.removeItem('sooqly_token'); navigate(0) }
          }}>👤 Logout</button>
        ) : (
          <Link to="/login" className="chip" style={{textDecoration:'none'}}>👤 Login</Link>
        )}

        <Link to="/track" className="chip" style={{textDecoration:'none'}}>🗺 Track</Link>
      </div>
    </header>
  )
}
