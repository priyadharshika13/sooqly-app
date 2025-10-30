import React, { useEffect, useRef } from 'react'
import axios from 'axios'

export default function TrackingMap({ api, orderId }){
  const mapRef = useRef(null)
  const divRef = useRef(null)      // container ref
  const markerRef = useRef(null)

  useEffect(()=>{
    if(divRef.current && !mapRef.current){
      mapRef.current = L.map(divRef.current).setView([13.0827, 80.2707], 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current)
    }
  }, [])

  useEffect(()=>{
    let t
    const poll = async () => {
      if(!orderId) return
      try {
        const token = localStorage.getItem('sooqly_token')
        const hdr = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(`${api}/tracking/${orderId}`, { headers: hdr })
        const events = res.data || []
        if(events.length>0){
          const last = events[events.length-1]
          if(last.lat && last.lng && mapRef.current){
            if(!markerRef.current){
              markerRef.current = L.marker([last.lat, last.lng]).addTo(mapRef.current)
            } else {
              markerRef.current.setLatLng([last.lat, last.lng])
            }
            mapRef.current.setView([last.lat, last.lng], 13)
          }
        }
      } catch(e) {}
    }
    poll()
    t = setInterval(poll, 4000)
    return ()=> clearInterval(t)
  }, [orderId])

  return <div ref={divRef} id={`map-${orderId||'new'}`} style={{height:360, borderRadius:12, border:'1px solid #e5e7eb'}} />
}
