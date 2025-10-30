// src/ui/pages/Login.jsx
import React, { useState } from 'react'
import axios from 'axios'
import NavBar from '../NavBar'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    const form = new URLSearchParams({ username: email, password })
    const res = await axios.post(`${API}/auth/login`, form)
    localStorage.setItem('sooqly_token', res.data.access_token)
    navigate('/')
  }

  const register = async (e) => {
    e.preventDefault()
    const res = await axios.post(`${API}/auth/register`, { email, password })
    localStorage.setItem('sooqly_token', res.data.access_token)
    navigate('/')
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth:520, margin:'20px auto'}}>
        <h3>Login / Register</h3>
        <form style={{display:'grid', gap:10, marginTop:10}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
                 style={{padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:10, background:'#fff'}}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
                 style={{padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:10, background:'#fff'}}/>
          <button onClick={login} className="btn">Login</button>
          <button onClick={register} className="btn" style={{background:'#111827'}}>Register</button>
        </form>
      </div>
    </>
  )
}
