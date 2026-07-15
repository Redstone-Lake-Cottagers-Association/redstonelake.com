'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    mapboxgl: any;
  }
}

// Lake centroids from the County of Haliburton GIS lakes layer; each lake gets
// its own distinct pin colour, echoed in the legend below the map. `id`
// matches the lake-health explorer; hasGauge marks the one lake with a live
// water-level gauge (Parks Canada station 17 on Redstone).
const LAKES = [
  { id: 'redstone', name: 'Redstone Lake', coordinates: [-78.5328, 45.17969], color: '#0284c7', hasGauge: true },
  { id: 'little-redstone', name: 'Little Redstone Lake', coordinates: [-78.56998, 45.2157], color: '#0d9488', hasGauge: false },
  { id: 'pelaw', name: 'Pelaw Lake', coordinates: [-78.54372, 45.21756], color: '#7c3aed', hasGauge: false },
  { id: 'bitter', name: 'Bitter Lake', coordinates: [-78.57593, 45.17299], color: '#15803d', hasGauge: false },
  { id: 'tedious', name: 'Long (Tedious) Lake', coordinates: [-78.57552, 45.1639], color: '#ea580c', hasGauge: false },
  { id: 'burdock', name: 'Burdock Lake', coordinates: [-78.58639, 45.17215], color: '#1e3a8a', hasGauge: false },
  { id: 'coleman', name: 'Coleman Lake', coordinates: [-78.54549, 45.15417], color: '#be185d', hasGauge: false },
]

function popupHtml(lake: (typeof LAKES)[number]): string {
  const linkStyle = 'display:block;margin-top:4px;font-weight:600;color:#0f4c81;text-decoration:none;font-size:12.5px;'
  const waterLevel = lake.hasGauge
    ? `<a href="/lake-health#water-level" style="${linkStyle}">💧 Live water level →</a>`
    : `<span style="${linkStyle}color:#94a3b8;cursor:not-allowed;" title="No water-level gauge on this lake">💧 Water level — not available for this lake</span>`
  return `
    <div style="color:#334155;font-family:'Inter',sans-serif;line-height:1.45;min-width:210px;">
      <strong style="color:#0f172a;font-size:14px;">${lake.name}</strong>
      <a href="/lake-health?lake=${lake.id}#explore" style="${linkStyle}">🔬 Water quality data →</a>
      ${waterLevel}
      <a href="/lake-map?lat=${lake.coordinates[1]}&lng=${lake.coordinates[0]}&zoom=13.5" style="${linkStyle}">🗺️ Zoom in on the lake map →</a>
    </div>`
}

const MAP_CENTER = [-78.55, 45.19]

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// Static Images API fallback for browsers without WebGL (hardware acceleration
// off, older devices): same style, same pins, no interactivity.
function staticMapUrl(token: string): string {
  const pins = LAKES
    .map(l => `pin-s+${l.color.slice(1)}(${l.coordinates[0]},${l.coordinates[1]})`)
    .join(',')
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pins}/${MAP_CENTER[0]},${MAP_CENTER[1]},10.5/1280x400@2x?access_token=${token}&attribution=false&logo=false`
}

export default function HeroMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  // Last resort when Mapbox is unreachable entirely (ad blockers, offline):
  // a styled panel with no external dependencies.
  const [plain, setPlain] = useState(false)

  useEffect(() => {
    let token: string | null = null

    async function fetchToken(): Promise<string | null> {
      try {
        const response = await fetch('/api/mapbox-token')
        const data = await response.json()
        if (!response.ok || !data.token) {
          console.error('Failed to fetch Mapbox token:', data.error)
          return null
        }
        return data.token
      } catch (error) {
        console.error('Error fetching Mapbox token:', error)
        return null
      }
    }

    async function start() {
      token = await fetchToken()
      if (!token) { setPlain(true); return }

      if (!webglAvailable()) {
        setFallbackUrl(staticMapUrl(token))
        return
      }

      if (!window.mapboxgl) {
        const script = document.createElement('script')
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'
        script.onload = initializeMap
        script.onerror = () => setFallbackUrl(staticMapUrl(token!))
        document.head.appendChild(script)

        const link = document.createElement('link')
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      } else {
        initializeMap()
      }
    }

    function initializeMap() {
      if (map.current) return // Initialize map only once

      try {
        window.mapboxgl.accessToken = token
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: MAP_CENTER,
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
      } catch (error) {
        // WebGL init failed despite the pre-check (blocklisted GPU, etc.)
        console.error('Mapbox GL failed to initialize, using static map:', error)
        setFallbackUrl(staticMapUrl(token!))
        return
      }

      // Add markers for each lake when map loads
      map.current.on('load', () => {
        LAKES.forEach(lake => {
          const marker = new window.mapboxgl.Marker({
            color: lake.color,
            scale: 0.8
          })
          .setLngLat(lake.coordinates)
          .setPopup(new window.mapboxgl.Popup({
            offset: 25,
            className: 'lake-popup',
            focusAfterOpen: false
          }).setHTML(popupHtml(lake)))
          .addTo(map.current)
        })
      })
    }

    start()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  return (
    <div className="hero-map mb-4">
      {plain ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center p-4"
          style={{
            height: '400px',
            borderRadius: '12px',
            background: 'linear-gradient(160deg, #14536b 0%, #0369a1 60%, #0f766e 100%)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)'
          }}
        >
          <h4 style={{ color: '#fff' }} className="mb-2">The Redstone Group of Lakes</h4>
          <p className="mb-3" style={{ opacity: 0.9, maxWidth: '460px' }}>
            Seven lakes in the heart of Haliburton, protected by our association:
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2" style={{ maxWidth: '520px' }}>
            {LAKES.map(lake => (
              <span
                key={lake.name}
                className="badge"
                style={{ backgroundColor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)', fontWeight: 600 }}
              >
                {lake.name}
              </span>
            ))}
          </div>
          <small className="mt-3" style={{ opacity: 0.75 }}>Interactive map unavailable in this browser</small>
        </div>
      ) : fallbackUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackUrl}
          alt="Map of the Redstone group of lakes: Redstone, Little Redstone, Pelaw, Bitter, Tedious, Burdock and Coleman Lakes"
          onError={() => setPlain(true)}
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)'
          }}
        />
      ) : (
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
      )}

      {/* Legend: one distinct colour per lake; click a pin for actions */}
      {!plain && (
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-2 small text-muted">
          {LAKES.map(lake => (
            <span key={lake.id} className="d-inline-flex align-items-center gap-1">
              <svg width="11" height="14" viewBox="0 0 27 41" aria-hidden="true">
                <path
                  d="M13.5 0C6.04 0 0 6.04 0 13.5c0 9.8 12.1 26 13.5 27.5C14.9 39.5 27 23.3 27 13.5 27 6.04 20.96 0 13.5 0z"
                  fill={lake.color}
                />
              </svg>
              {lake.name.replace(/ Lake$/, '')}
            </span>
          ))}
          <span className="d-inline-flex align-items-center" style={{ fontSize: '0.72rem' }}>
            — click a pin for water data &amp; map
          </span>
        </div>
      )}

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
      `}</style>
    </div>
  )
}
