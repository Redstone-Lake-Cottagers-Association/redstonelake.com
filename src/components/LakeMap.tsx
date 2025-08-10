'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default function LakeMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    // Load Mapbox GL JS
    if (!window.mapboxgl) {
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'
      script.onload = initializeMap
      document.head.appendChild(script)

      const link = document.createElement('link')
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    } else {
      initializeMap()
    }

    function initializeMap() {
      if (map.current) return // Initialize map only once
      
      if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
        console.error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set');
        return;
      }
      
      window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Simple, clean style that highlights water
        center: [-78.5434900880115, 45.18726445910608], // Correct Redstone Lake coordinates
        zoom: 11,
        attributionControl: false
      })

      // Lake locations (approximate - you may need to adjust these)
      const lakes = [
        { name: 'Redstone Lake', coordinates: [-78.5434900880115, 45.18726445910608], color: '#0284c7' },
        { name: 'Little Redstone Lake', coordinates: [-78.5234900880115, 45.19726445910608], color: '#0d9488' },
        { name: 'Bitter Lake', coordinates: [-78.5634900880115, 45.17726445910608], color: '#059669' },
        { name: 'Burdock Lake', coordinates: [-78.5834900880115, 45.19726445910608], color: '#1e40af' },
        { name: 'Coleman Lake', coordinates: [-78.5034900880115, 45.17726445910608], color: '#0f172a' },
        { name: 'Long (Tedious) Lake', coordinates: [-78.5134900880115, 45.20726445910608], color: '#f97316' },
        { name: 'Pelaw Lake', coordinates: [-78.5734900880115, 45.16726445910608], color: '#0d9488' }
      ]

      // Add markers for each lake when map loads
      map.current.on('load', () => {
        lakes.forEach(lake => {
          // Create a simple marker
          const marker = new window.mapboxgl.Marker({
            color: lake.color,
            scale: 0.8
          })
          .setLngLat(lake.coordinates)
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${lake.name}</strong><br/>Protected by RLCA`))
          .addTo(map.current)
        })
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  return (
    <div className="weather-widget mt-4">
      <div className="d-flex align-items-center mb-3">
        <div className="me-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="var(--lake-blue)" strokeWidth="2" fill="var(--lake-blue)" fillOpacity="0.2"/>
            <circle cx="12" cy="10" r="3" stroke="var(--lake-blue)" strokeWidth="2" fill="var(--lake-blue)"/>
          </svg>
        </div>
        <h5 className="mb-0">Our Lakes</h5>
      </div>
      
      <div 
        ref={mapContainer}
        style={{
          height: '250px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)'
        }}
        className="mapbox-container"
      />
      
      <style jsx>{`
        .mapbox-container :global(.mapboxgl-ctrl-logo) {
          display: none !important;
        }
        .mapbox-container :global(.mapboxgl-ctrl-attrib) {
          display: none !important;
        }
      `}</style>
      

    </div>
  )
} 