import React, { useEffect, useState } from 'react'
import axios from 'axios'
import NavBar from '../NavBar'
const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app/'

export default function AdminOrders(){
  const [rows, setRows] = useState([])
  const token = localStorage.getItem('sooqly_token')
  const hdr = token ? { Authorization:`Bearer ${token}` } : {}

  const load = async () => {
    const r = await axios.get(`${API}/admin/orders`, { headers: hdr })
    setRows(r.data)
  }
  useEffect(()=>{ load() }, [])

  return (
    <>
      <NavBar />
      <div className="container">
        <h3>Admin • Orders</h3>
        <table>
          <thead><tr><th>ID</th><th>User</th><th>Status</th><th>Total</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_id}</td>
                <td>{o.status}</td>
                <td>₹ {o.total_amount}</td>
                <td>{o.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
