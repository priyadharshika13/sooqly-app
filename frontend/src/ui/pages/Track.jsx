import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import NavBar from '../NavBar'
import TrackingMap from '../TrackingMap'

const API = import.meta.env.VITE_API || 'http://localhost:8000'
const ORANGE = '#f97316'

export default function Track(){
  const [search] = useSearchParams()
  const [orderId, setOrderId] = useState(search.get('order') || '')
  const [timeline, setTimeline] = useState([])
  const [order, setOrder] = useState(null)

  const token = localStorage.getItem('sooqly_token')
  const hdr = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(()=>{
    let t
    const fetchAll = async () => {
      if(!orderId) return
      try{
        const [ord, tr] = await Promise.all([
          axios.get(`${API}/orders/${orderId}`, { headers: hdr }).then(r=>r.data),
          axios.get(`${API}/tracking/${orderId}`, { headers: hdr }).then(r=>r.data)
        ])
        setOrder(ord)
        setTimeline(tr)
      }catch(e){}
    }
    fetchAll()
    t = setInterval(fetchAll, 5000)
    return ()=> clearInterval(t)
  }, [orderId])

  const last = useMemo(()=> timeline.length ? timeline[timeline.length-1] : null, [timeline])

  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:12, maxWidth:1000, margin:'0 auto'}}>
        <h3>Track your delivery</h3>
        <div className="row" style={{gap:8, margin:'8px 0 12px'}}>
          <input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="Order ID" className="input"/>
        </div>

        {order && (
          <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16}}>
            <div>
              <TrackingMap api={API} orderId={orderId} />
            </div>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
              <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Status</div>
              <div style={{marginBottom:8}}>Order #{order.id} • Total <b>₹ {order.total_amount.toFixed(2)}</b></div>
              <div style={{display:'grid', gap:8}}>
                {timeline.length===0 && <div style={{opacity:.7}}>No updates yet…</div>}
                {timeline.map((t,i)=>(
                  <div key={i} style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{width:10, height:10, borderRadius:999, background:i===timeline.length-1?ORANGE:'#d1d5db'}}></div>
                    <div>
                      <div style={{fontWeight:600}}>{t.status}</div>
                      {(t.lat && t.lng) ? <div style={{fontSize:12, opacity:.7}}>{t.lat}, {t.lng}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
              {last && <div style={{marginTop:10, fontSize:12, opacity:.7}}>Last update: {last.status}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
