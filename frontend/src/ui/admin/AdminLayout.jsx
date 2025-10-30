// src/ui/admin/AdminLayout.jsx
import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const ORANGE = '#f97316'

export default function AdminLayout(){
  const nav = useNavigate()
  const logout = () => {
    localStorage.removeItem('sooqly_token')
    nav('/login')
  }

  const linkStyle = ({ isActive }) => ({
    display:'block', padding:'10px 12px', borderRadius:8, margin:'4px 0',
    color: isActive ? '#fff' : '#111', textDecoration:'none',
    background: isActive ? ORANGE : '#f3f4f6'
  })

  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh', background:'#fff'}}>
      <aside style={{padding:16, borderRight:'1px solid #e5e7eb'}}>
        <h3 style={{marginBottom:8, color:ORANGE}}>Admin Console</h3>
                <NavLink to="/admin/users" style={linkStyle}>Users</NavLink>

        <NavLink to="/admin/products" style={linkStyle}>Products</NavLink>
        <NavLink to="/admin/offers" style={linkStyle}>Offers</NavLink>
        <NavLink to="/admin/recipes" style={linkStyle}>Recipes & Ingredients</NavLink>
                <NavLink to="/admin/orders" style={linkStyle}>Orders</NavLink>

        <button onClick={logout} style={{marginTop:12, background:'#111827', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer'}}>Logout</button>
      </aside>
      <main style={{padding:20}}>
        <Outlet />
      </main>
    </div>
  )
}
