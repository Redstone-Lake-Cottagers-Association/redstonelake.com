'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default function HeroMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    // Load Mapbox GL JS
    if (!window.mapboxgl) {
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'
      script.onload = fetchMapboxTokenAndInitialize
      document.head.appendChild(script)

      const link = document.createElement('link')
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    } else {
      fetchMapboxTokenAndInitialize()
    }

    async function fetchMapboxTokenAndInitialize() {
      if (map.current) return // Initialize map only once
      
      try {
        const response = await fetch('/api/mapbox-token');
        const data = await response.json();
        
        if (!response.ok || !data.token) {
          console.error('Failed to fetch Mapbox token:', data.error);
          return;
        }
        
        window.mapboxgl.accessToken = data.token;
        initializeMap();
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    }

    function initializeMap() {
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-78.55000, 45.1900],
        zoom: 11,
        attributionControl: false,
        interactive: false,
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        dragPan: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false
      })

      // Lake locations - Precise RLCA coordinates
      const lakes = [
        { name: 'Redstone Lake', coordinates: [-78.53708715953942, 45.17283012667944], color: '#0284c7', slug: 'redstone-lake' },
        { name: 'Little Redstone Lake', coordinates: [-78.56998432916856, 45.207970577781346], color: '#0d9488', slug: 'little-redstone-lake' },
        { name: 'Pelaw Lake', coordinates: [-78.5408542205793, 45.22045294890792], color: '#0d9488', slug: 'pelaw-lake' },
        { name: 'Bitter Lake', coordinates: [-78.57648763236138, 45.17216205718878], color: '#059669', slug: 'bitter-lake' },
        { name: 'Tedious Lake', coordinates: [-78.57482565443063, 45.16500688295296], color: '#f97316', slug: 'tedious-lake' },
        { name: 'Burdock Lake', coordinates: [-78.58715595440152, 45.17247753540227], color: '#1e40af', slug: 'burdock-lake' },
        { name: 'Coleman Lake', coordinates: [-78.54504027355213, 45.15411155709159], color: '#0f172a', slug: 'coleman-lake' }
      ]

      // Add markers for each lake when map loads
      map.current.on('load', () => {
        lakes.forEach(lake => {
          const marker = new window.mapboxgl.Marker({
            color: lake.color,
            scale: 0.8
          })
          .setLngLat(lake.coordinates)
          .setPopup(new window.mapboxgl.Popup({ 
            offset: 25,
            className: 'lake-popup'
          }).setHTML(`
            <div style="color: #334155; font-family: 'Inter', sans-serif; line-height: 1.4;">
              <strong style="color: #0f172a; font-size: 14px;">${lake.name}</strong><br/>
              <span style="color: #64748b; font-size: 12px;">Protected by RLCA</span><br/>
              <a href="/lakes/${lake.slug}" style="color: #0284c7; font-size: 12px; text-decoration: none; font-weight: 500; margin-top: 6px; display: inline-block;">
                Learn more about this lake →
              </a>
            </div>
          `))
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
    <div className="hero-map mb-4">
      <div 
        ref={mapContainer}
        style={{
          height: '400px',
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
        .mapbox-container :global(.mapboxgl-popup-content) {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          padding: 12px !important;
        }
        .mapbox-container :global(.mapboxgl-popup-tip) {
          border-top-color: white !important;
        }
        .mapbox-container :global(.mapboxgl-popup-close-button) {
          outline: none !important;
          box-shadow: none !important;
        }
        .mapbox-container :global(.mapboxgl-popup-close-button):focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .mapbox-container :global(.mapboxgl-popup-content a) {
          outline: none !important;
          box-shadow: none !important;
        }
        .mapbox-container :global(.mapboxgl-popup-content a):focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}
