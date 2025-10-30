import React, { useState } from 'react'
import axios from 'axios'
import NavBar from '../NavBar'
const API = import.meta.env.VITE_API || 'http://localhost:8000'

export default function Payments(){
  const [provider, setProvider] = useState('stripe')
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState(5000) // ₹50.00 as paise
  const [clientSecret, setClientSecret] = useState('')
  const [checkoutId, setCheckoutId] = useState('')
  const token = localStorage.getItem('sooqly_token')

  const start = async () => {
    const res = await axios.post(`${API}/payments/create-intent`, {
      provider, amount, currency:'INR', order_id: Number(orderId)
    }, { headers: token? {Authorization:`Bearer ${token}`} : {} })

    if(provider === 'stripe'){
      setClientSecret(res.data.client_secret)
      alert('Stripe client_secret created. Use Stripe Elements on this page to complete payment (next step).')
      // TODO: integrate Stripe Elements here if you want an in-page card form.
    } else {
      setCheckoutId(res.data.checkout_id)
      alert('HyperPay checkout_id created (stub). Redirect to hosted page in your real flow.')
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{maxWidth: 720}}>
        <h3>Payments</h3>
        <div style={{display:'grid', gap:8, marginTop:8}}>
          <select className="input" value={provider} onChange={e=>setProvider(e.target.value)}>
            <option value="stripe">Stripe</option>
            <option value="hyperpay">HyperPay (stub)</option>
          </select>
          <input className="input" placeholder="Order ID" value={orderId} onChange={e=>setOrderId(e.target.value)} />
          <input className="input" type="number" placeholder="Amount (paise)" value={amount} onChange={e=>setAmount(Number(e.target.value||0))} />
          <button className="btn" onClick={start}>Create Payment</button>

          {clientSecret && (
            <div style={{fontSize:12, opacity:.7}}>
              Stripe client_secret:<br/>{clientSecret}
            </div>
          )}
          {checkoutId && (
            <div style={{fontSize:12, opacity:.7}}>
              HyperPay checkout_id (stub):<br/>{checkoutId}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
