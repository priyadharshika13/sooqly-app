// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './ui/pages/Home'
import Track from './ui/pages/Track'
import Login from './ui/pages/Login'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/track" element={<Track />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
)
