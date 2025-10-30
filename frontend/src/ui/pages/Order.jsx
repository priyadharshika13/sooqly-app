import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../NavBar'

const API = import.meta.env.VITE_API || 'http://localhost:8000'
const ORANGE = '#f97316'

export default function Order(){
  const { id } = useParams()
  const [data, setData] = useState(null)

  useEffect(()=>{
    (async()=>{
      const token = localStorage.getItem('sooqly_token')
      const res = await axios.get(`${API}/orders/${id}`, { headers: token ? {Authorization:`Bearer ${token}`} : {} })
      setData(res.data)
    })()
  }, [id])

  if(!data) return (<><NavBar /><div className="container">Loading…</div></>)

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth:900, margin:'0 auto'}}>
        <h3>Order #{data.id}</h3>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Items</div>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line</th></tr></thead>
              <tbody>
                {data.items.map((it, i)=>(
                  <tr key={i}>
                    <td>{it.name}</td>
                    <td>{it.qty}</td>
                    <td>₹ {it.price}</td>
                    <td>₹ {(it.qty*it.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
              <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Summary</div>
              <div>Status: <b>{data.status}</b></div>
              <div>Total: <b>₹ {data.total_amount.toFixed(2)}</b></div>
              <div style={{marginTop:8}}>
                <Link to={`/track?order=${data.id}`} className="btn" style={{textDecoration:'none', display:'inline-block'}}>Track now</Link>
              </div>
            </div>

            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12}}>
              <div style={{fontWeight:700, color:ORANGE, marginBottom:8}}>Delivery Address</div>
              {data.shipping ? (
                <div>
                  <div>{data.shipping.address_line}</div>
                  <div>{data.shipping.city} - {data.shipping.pincode}</div>
                  {(data.shipping.lat && data.shipping.lng) ? (
                    <div style={{fontSize:12, opacity:.7}}>({data.shipping.lat}, {data.shipping.lng})</div>
                  ) : null}
                </div>
              ) : <div style={{opacity:.7}}>Address not set</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
