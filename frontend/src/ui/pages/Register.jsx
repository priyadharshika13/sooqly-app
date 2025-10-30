import React, { useState } from 'react'
import axios from 'axios'
import NavBar from '../NavBar'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API || 'https://sooqly-app.vercel.app/'

export default function Register(){
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API}/auth/register`, { email, mobile, password })
      localStorage.setItem('sooqly_token', res.data.access_token)
      navigate('/')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth:520, margin:'20px auto'}}>
        <h3>Register</h3>
        {error && <div style={{background:'#FEF2F2', border:'1px solid #FECACA', color:'#7F1D1D', padding:10, borderRadius:10, margin:'8px 0'}}>{error}</div>}
        <form onSubmit={submit} style={{display:'grid', gap:10, marginTop:10}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" type="submit">Create Account</button>
        </form>
      </div>
    </>
  )
}
