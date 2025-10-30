// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './ui/pages/Home'
import Track from './ui/pages/Track'
import Login from './ui/pages/Login'
import AdminLayout from './ui/admin/AdminLayout'
import AdminProducts from './ui/admin/AdminProducts'
import AdminOffers from './ui/admin/AdminOffers'
import AdminRecipes from './ui/admin/AdminRecipes'
import Checkout from './ui/pages/CheckOut'
import Order from './ui/pages/Order'
import Register from './ui/pages/Register'
import AdminOrders from './ui/admin/AdminOrders'
// import AdminUsers from './ui/admin/AdminUSers'
import Payments from './ui/pages/payments'

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('sooqly_token')
  return token ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/track" element={<Track />} />
      <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<Order />} />

<Route path="/register" element={<Register />} />
<Route path="/payments" element={<Payments />} />

      <Route path="/admin" element={
        <RequireAuth>
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="recipes" element={<AdminRecipes />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        {/* <Route path="/admin/users" element={<AdminUsers />} /> */}

      </Route>
    </Routes>
  </BrowserRouter>
)
