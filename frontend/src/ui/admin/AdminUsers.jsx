import React, { useEffect, useState } from 'react'
import axios from 'axios'
import NavBar from '../NavBar'
const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'

export default function AdminUsers(){
  const [rows, setRows] = useState([])
  const token = localStorage.getItem('sooqly_token')
  const hdr = token ? { Authorization:`Bearer ${token}` } : {}

  const load = async () => {
    const r = await axios.get(`${API}/admin/users`, { headers: hdr })
    setRows(r.data)
  }
  useEffect(()=>{ load() }, [])

  return (
    <>
      <NavBar />
      <div className="container">
        <h3>Admin • Users</h3>
        <table>
          <thead><tr><th>ID</th><th>Email</th><th>Mobile</th><th>Name</th><th>Role</th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.mobile || '-'}</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
