import React, { useEffect, useRef } from 'react'
import axios from 'axios'

export default function TrackingMap({ api, orderId }){
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markerRef = useRef(null)

  useEffect(()=>{
    if(!mapRef.current){
      mapRef.current = L.map('map').setView([13.0827, 80.2707], 11) // Chennai default
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current)
    }
  }, [])

  useEffect(()=>{
    let t
    const poll = async () => {
      if(!orderId) return
      try {
        // NOTE: public demo poll without auth; for real use, attach Bearer token of the user
        const res = await axios.get(`${api}/tracking/${orderId}`, { headers: {} })
        const events = res.data || []
        if(events.length>0){
          const last = events[events.length-1]
          if(last.lat && last.lng){
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
    t = setInterval(poll, 4000)
    return ()=> clearInterval(t)
  }, [orderId])

  return <div id="map"></div>
}
