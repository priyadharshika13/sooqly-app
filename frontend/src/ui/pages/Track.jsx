// src/ui/pages/Track.jsx
import React, { useState } from 'react'
import NavBar from '../NavBar'
import TrackingMap from '../TrackingMap'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app/'

export default function Track(){
  const [orderId, setOrderId] = useState('')
  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:12}}>
        <h3>Track your delivery</h3>
        <p style={{opacity:.7, marginTop:4}}>Enter your Order ID to view live updates.</p>
        <div style={{display:'flex', gap:8, alignItems:'center', margin:'8px 0 12px'}}>
          <input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="Order ID"
                 style={{padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8}}/>
        </div>
        <TrackingMap api={API} orderId={orderId} />
      </div>
    </>
  )
}
