'use client'

import { useState, useEffect, useRef } from 'react'
import EnhancedWeatherWidget from './EnhancedWeatherWidget'
import WeatherModal from './WeatherModal'
import { createPortal } from 'react-dom'
import { Droplets, ChevronUp, ChevronDown } from 'lucide-react'

interface WeatherData {
  temp: number
  humidity: number
  clouds: number
  wind: {
    speed: number
    deg: number
  }
  desc: string
}

interface WaterDataPoint {
  t: number
  y: string
}

interface WaterData {
  current: WaterDataPoint[]
  average?: WaterDataPoint[]
  min?: WaterDataPoint[]
  max?: WaterDataPoint[]
}

interface FireBanAlert {
  title: string;
  description: string;
  color: string;
}

type BanType = 'total' | 'restricted' | 'none';

interface DysartFireBanResponse {
  source: 'Dysart et al';
  sourceUrl: string;
  alerts: FireBanAlert[];
  hasActiveBan: boolean;
  cachedAt?: string;
  aiAnalysis?: {
    hasFireBan: boolean;
    banType?: BanType;
    effectiveFrom?: string;
    effectiveTo?: string;
    summary?: string;
    confidence?: number;
  };
  detection?: {
    matchedKeywords?: string[];
    matchedColor?: string | null;
    confidence: number;
  };
  summary: {
    status: 'active' | 'none' | 'error';
    primaryAlert?: FireBanAlert;
    lastUpdated: string;
  };
}

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default function LakeInfo() {
  const [waterData, setWaterData] = useState<WaterData | null>(null)
  const [waterLoading, setWaterLoading] = useState(true)
  const [fireBanData, setFireBanData] = useState<DysartFireBanResponse | null>(null)
  const [fireBanLoading, setFireBanLoading] = useState(true)
  const [showFireBanModal, setShowFireBanModal] = useState(false)
  const [showWeatherModal, setShowWeatherModal] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    // Fetch water level data
    fetchWaterLevelData()
    
    // Fetch fire ban data
    fetchFireBanData()
  }, [])

  const fetchWaterLevelData = async () => {
    try {
      const response = await fetch('/api/water-levels?stationId=17&lang=EN')
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch data')
      }
      
      setWaterData(data)
    } catch (error) {
      console.error('Error fetching water level data:', error)
      setWaterData(null)
    } finally {
      setWaterLoading(false)
    }
  }

  // Formats a timestamp into a friendly relative string like "2h 15m ago"
  const formatRelativeTime = (input: number | string | Date): string => {
    try {
      const t = typeof input === 'number' ? input : new Date(input).getTime();
      const diffSeconds = Math.max(0, Math.floor((Date.now() - t) / 1000));
      const minutes = Math.floor(diffSeconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (diffSeconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) {
        const remM = minutes % 60;
        return remM > 0 ? `${hours}h ${remM}m ago` : `${hours}h ago`;
      }
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } catch {
      return '';
    }
  };

  const formatAsOf = (iso?: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const fetchFireBanData = async () => {
    try {
      // Coordinates no longer needed server-side, but kept for future use
      const lat = 45.05757247096108;
      const lng = -78.41860331417699;
      
      // Check for fireban query parameter for UI testing
      const urlParams = new URLSearchParams(window.location.search);
      const fireBanTest = urlParams.get('fireban');
      
      let apiUrl = `/api/fire-ban?lat=${lat}&lng=${lng}`;
      if (fireBanTest && ['none', 'restricted', 'total'].includes(fireBanTest)) {
        apiUrl += `&test=${fireBanTest}`;
      }
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch fire ban data')
      }
      
      setFireBanData(data)
    } catch (error) {
      console.error('Error fetching fire ban data:', error)
      setFireBanData(null)
    } finally {
      setFireBanLoading(false)
    }
  }

  const getFireBanStatus = () => {
    if (fireBanLoading) return { 
      status: 'loading', 
      message: 'Loading...', 
      color: '#6c757d', 
      alert: null,
      data: null
    }
    
    if (!fireBanData) return { 
      status: 'safe', 
      message: 'No fire ban', 
      color: '#198754', 
      alert: null,
      data: null
    }
    
    const { summary, aiAnalysis } = fireBanData;
    const banType: BanType = (aiAnalysis?.banType as BanType) || (summary.status === 'active' ? 'total' : 'none');
    const hasBan = banType !== 'none';
    const primaryAlert = fireBanData.summary.primaryAlert || fireBanData.alerts[0] || null;

    // Color by ban type (Bootstrap palette)
    const color = banType === 'total'
      ? '#dc3545' // red
      : banType === 'restricted'
        ? '#fd7e14' // orange
        : '#198754'; // green

    if (summary.status === 'error') {
      return { status: 'error', message: 'Status unavailable', color: '#dc3545', alert: primaryAlert, data: fireBanData };
    }

    if (hasBan) {
      const message = banType === 'total' ? 'Total fire ban' : 'Restricted fire use';
      const status = banType === 'total' ? 'banned' : 'restricted';
      return {
        status,
        message,
        color,
        alert: primaryAlert,
        data: fireBanData
      };
    }

    return {
      status: 'safe',
      message: 'No fire ban',
      color: '#198754',
      alert: null,
      data: fireBanData
    };
  }

  const formatFireBanDescription = (description: string) => {
    return description
      .replace(/\s+/g, ' ')
      .trim()
      .split('. ')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
  }

  const getCurrentLevel = () => {
    if (!waterData?.current?.length) return null
    const latest = waterData.current[waterData.current.length - 1]
    return {
      level: parseFloat(latest.y),
      date: new Date(latest.t).toLocaleDateString()
    }
  }

  const get30DayChange = () => {
    if (!waterData?.current?.length || waterData.current.length < 30) return null
    
    const currentLevel = parseFloat(waterData.current[waterData.current.length - 1].y)
    const thirtyDaysAgo = parseFloat(waterData.current[waterData.current.length - 30].y)
    
    const change = currentLevel - thirtyDaysAgo
    const percentChange = (change / thirtyDaysAgo) * 100
    
    return {
      change,
      percentChange
    }
  }

  const scrollToWaterLevelSection = () => {
    const element = document.getElementById('water-level-monitor')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
      
      window.mapboxgl.accessToken = 'pk.eyJ1IjoiY290dGFnZW1hcHMiLCJhIjoiY2tqdTU1Z2Z0MGRwczJ0cDM2ZnpjdHNtdyJ9.zRSIwbTmRr0d7PFv0lf7lQ'
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-78.5434900880115, 45.18726445910608],
        zoom: 10.8,
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

      // Lake locations
      const lakes = [
        { name: 'Redstone Lake', coordinates: [-78.5434900880115, 45.18726445910608], color: '#0284c7', slug: 'redstone-lake' },
        { name: 'Little Redstone Lake', coordinates: [-78.5234900880115, 45.19726445910608], color: '#0d9488', slug: 'little-redstone-lake' },
        { name: 'Bitter Lake', coordinates: [-78.5634900880115, 45.17726445910608], color: '#059669', slug: 'bitter-lake' },
        { name: 'Burdock Lake', coordinates: [-78.5834900880115, 45.19726445910608], color: '#1e40af', slug: 'burdock-lake' },
        { name: 'Coleman Lake', coordinates: [-78.5034900880115, 45.17726445910608], color: '#0f172a', slug: 'coleman-lake' },
        { name: 'Long (Tedious) Lake', coordinates: [-78.5134900880115, 45.20726445910608], color: '#f97316', slug: 'long-tedious-lake' },
        { name: 'Pelaw Lake', coordinates: [-78.5734900880115, 45.16726445910608], color: '#0d9488', slug: 'pelaw-lake' }
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
    <div className="weather-widget">

      {/* Enhanced Weather Section: header and link in one row (no shift) */}
      <div className="mb-3 position-relative w-100">
        <EnhancedWeatherWidget showForecast={true} onExpand={() => setShowWeatherModal(true)} />
      </div>

      {/* Fire Ban Section */}
      <div className="mb-3">
        {(() => {
          const fireBanStatus = getFireBanStatus()
          const hasDetails = Boolean(fireBanStatus.data && (fireBanStatus.data.hasActiveBan || fireBanStatus.data.aiAnalysis?.hasFireBan))
          
          return (
            <div>
              <div
                className={`fireban-banner d-flex align-items-center ${hasDetails ? 'is-clickable' : ''}`}
                style={{
                  // CSS custom properties consumed in globals.css
                  ['--fb-bg' as any]: fireBanStatus.color + '16',
                  ['--fb-border' as any]: fireBanStatus.color + '40',
                  ['--fb-color' as any]: fireBanStatus.color
                }}
                onClick={() => hasDetails && setShowFireBanModal(true)}
              >
                <div className="fireban-icon me-2" style={{ filter: fireBanStatus.status === 'loading' ? 'grayscale(1)' : 'none' }}>
                  {fireBanStatus.status === 'banned' ? (
                    <span style={{ position: 'relative', display: 'inline-block', width: 22, height: 22 }} aria-hidden>
                      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: '1.05rem', lineHeight: 1 }}>🔥</span>
                      <svg viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, transform: 'translateY(1px)' }} focusable="false" aria-hidden>
                        <circle cx="12" cy="12" r="10.5" stroke="#dc3545" strokeWidth="2" fill="none" opacity="1" />
                        <line x1="6" y1="19" x2="18" y2="6" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                  ) : fireBanStatus.status === 'restricted' ? '⚠️' : fireBanStatus.status === 'safe' ? '✅' : fireBanStatus.status === 'loading' ? '🔥' : '❌'}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <span className="fireban-title me-2">{fireBanStatus.message}</span>
                  </div>


                  <div className="mt-1" style={{ minHeight: '18px' }}>
                    {(() => {
                      const asOf = fireBanStatus.data?.cachedAt || fireBanStatus.data?.summary?.lastUpdated
                      const label = asOf ? `Updated: ${formatRelativeTime(asOf)}` : ''
                      if (label ) {
                        return <span className="fireban-updated"
                        style={{
                          width: '140px',
                          borderRadius: '9999px',
                        }}
                        >{label}</span>
                      }
                      // skeleton chip to reserve space when loading/unknown
                      const skBg = fireBanStatus.color + '26'
                      const skBorder = fireBanStatus.color + '40'
                      return (
                        <span
                        className="fireban-updated"
                          aria-hidden
                          style={{
                            opacity: 0,
                            width: '140px',
                            borderRadius: '9999px',
                            minWidth: '140px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            color: '#64748b'
                          }}
                        >
                          Loading...
                        </span>
                      )
                    })()}
                  </div>
                </div>
                {/* Always render chevron to keep width stable; dim when not actionable */}
                <span
                  className="fireban-cta ms-auto align-self-center"
                  aria-hidden="true"
                  style={{ opacity: hasDetails ? 1 : 0.35, cursor: hasDetails ? 'pointer' : 'default' }}
                >
                  ›
                </span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Water Level Section */}
      <div className="mb-3">
        
        <div 
          className="p-3 rounded-3"
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0891b2)',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={scrollToWaterLevelSection}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(2, 132, 199, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div aria-label="Water level card">
              {waterLoading ? (
                <div>
                  {/* Label matches loaded state */}
                  <div className="d-inline-flex align-items-center mb-2">
                    <span className="badge me-2 px-2 py-1" style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>Water level</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      {/* Placeholder uses transparent text so line metrics match exactly */}
                      <div className="h3 mb-1 fw-bold" style={{color: 'transparent'}}>0.000 m</div>
                      <div className="small mb-2 opacity-90" style={{color: 'transparent'}}>Updated: 0m ago</div>
                    </div>
                    <div style={{width: 60, height: 60}} className="d-flex align-items-center justify-content-end">
                      <Droplets size={60} className="opacity-25" />
                    </div>
                  </div>

                  {/* Reserve space for metric rows to avoid layout shift */}
                  <div aria-hidden style={{minHeight: '57px'}}>
                    
                    {/* reserve seasonal comparison row height */}
                    <div style={{height: '22px'}} />
                  </div>
                </div>
              ) : (() => {
                const currentLevel = getCurrentLevel()
                const thirtyDayChange = get30DayChange()
                
                if (!currentLevel) {
                  return (
                    <div>
                      <div className="d-inline-flex align-items-center mb-2">
                        <span className="badge me-2 px-2 py-1" style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>Water level</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="h3 mb-1 text-white fw-bold" aria-live="polite">-.--- m</div>
                          <div className="small text-white mb-2">Data unavailable</div>
                        </div>
                        <Droplets size={60} className="opacity-25" />
                      </div>
                    </div>
                  )
                }
                
                return (
                                       <div>
                       <div className="d-inline-flex align-items-center mb-2">
                         <span className="badge me-2 px-2 py-1" style={{
                           backgroundColor: 'rgba(255,255,255,0.2)',
                           border: '1px solid rgba(255,255,255,0.6)',
                           color: 'white',
                           fontWeight: 700,
                           fontSize: '0.75rem'
                         }}>Water level</span>
                       </div>
                       <div className="d-flex align-items-center justify-content-between">
                         <div>
                           <div className="h3 mb-1 text-white fw-bold" aria-live="polite">{currentLevel.level.toFixed(3)} m</div>
                           <div className="small text-white mb-2 opacity-90">Updated: {formatRelativeTime(waterData!.current[waterData!.current.length - 1].t)}</div>
                         </div>
                         <Droplets size={60} className="opacity-25" />
                       </div>
                       
                        {/* 30-day change */}
                        <div className="water-metrics" style={{minHeight: '30px'}}>
                          {thirtyDayChange && (
                            <div className="metric-row">
                              {(() => {
                                const pct = Math.abs(thirtyDayChange.percentChange);
                                const sev = pct >= 15 ? 'severe' : (pct >= 7.5 ? 'moderate' : 'mild');
                                const isUp = thirtyDayChange.percentChange >= 0;
                                return (
                                  <span className={`metric-chip ${isUp ? 'up' : 'down'} sev-${sev}`}>
                                    {isUp ? <ChevronUp size={12} className="me-1" /> : <ChevronDown size={12} className="me-1" />}
                                    {pct.toFixed(1)}%
                                  </span>
                                );
                              })()}
                              <span className="metric-text">
                                {thirtyDayChange.change >= 0 ? '+' : ''}{thirtyDayChange.change.toFixed(2)} m over 30 days
                              </span>
                            </div>
                          )}
                        </div>
                       
                       {/* Comparison to historical average */}
                         {!waterLoading && currentLevel && waterData?.average && (
                          <div style={{minHeight: '20px'}}>
                           {(() => {
                             if (!waterData?.current?.length || !waterData?.average?.length) return null;
                             
                             const currentValue = currentLevel.level;
                             
                             // Find the historical average for the same time of year as the current reading
                             const currentData = waterData.current;
                             const latestCurrentEntry = currentData[currentData.length - 1];
                             const currentDate = new Date(latestCurrentEntry.t);
                             const currentMonth = currentDate.getMonth();
                             const currentDay = currentDate.getDate();
                             
                             // Find the closest historical average data point for the same date
                             const historicalAvgForDate = waterData.average.find(item => {
                               const avgDate = new Date(item.t);
                               return avgDate.getMonth() === currentMonth && avgDate.getDate() === currentDay;
                             });
                             
                             if (!historicalAvgForDate) return null;
                             
                             const historicalValue = parseFloat(historicalAvgForDate.y);
                             const difference = currentValue - historicalValue;
                             const percentDiff = Math.abs((difference / historicalValue) * 100);
                             
                              if (Math.abs(difference) < 0.01) {
                                return (
                                  <div className="metric-row">
                                    <span className="metric-chip neutral">≈</span>
                                    <span className="metric-text">Near seasonal average</span>
                                  </div>
                                );
                              } else if (difference > 0) {
                                const severity = percentDiff >= 15 ? 'severe' : (percentDiff >= 7.5 ? 'moderate' : 'mild');
                                return (
                                  <div className="metric-row">
                                    <span className={`metric-chip up sev-${severity}`}>
                                      <ChevronUp size={12} className="me-1" />
                                      {percentDiff.toFixed(1)}%
                                    </span>
                                    <span className="metric-text">above seasonal average</span>
                                  </div>
                                );
                              } else {
                                const severity = percentDiff >= 15 ? 'severe' : (percentDiff >= 7.5 ? 'moderate' : 'mild');
                                return (
                                  <div className="metric-row" style={{marginBottom: '0px'}}>
                                    <span className={`metric-chip down sev-${severity}`}>
                                      <ChevronDown size={12} className="me-1" />
                                      {percentDiff.toFixed(1)}%
                                    </span>
                                    <span className="metric-text">below seasonal average</span>
                                  </div>
                                );
                              }
                           })()}
                         </div>
                       )}
                  </div>
                )
              })()}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div>
        
        
        <div 
          ref={mapContainer}
          style={{
            height: '200px',
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

      {/* Fire Ban Details Modal - Rendered as Portal */}
      {showFireBanModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFireBanModal(false)
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" style={{maxWidth: '1100px'}}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center">
                  <span className="me-2">🔥</span>
                  Fire Restrictions & Bans
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowFireBanModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const fireBanStatus = getFireBanStatus()
                  if (!fireBanStatus.data) {
                    return <div className="text-center text-muted">No fire ban information available.</div>
                  }

                  return (
                    <div>
                      {/* Overall Status */}
                      <div className="text-center mb-2">
                        <div className="fireban-status-badge">{fireBanStatus.message.toUpperCase()}</div>
                      </div>
                      <div className="text-center mb-4 small text-muted">
                        {(() => {
                          const asOf = fireBanStatus.data?.cachedAt || fireBanStatus.data?.summary?.lastUpdated
                          const label = formatAsOf(asOf)
                          return label ? `As of ${label}` : ''
                        })()}
                      </div>

                      {/* Fire Ban Details */}
                      {fireBanStatus.data.hasActiveBan && fireBanStatus.alert && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-3">
                            <h6 className="mb-0 text-danger fw-bold">Local Fire Ban</h6>
                          </div>
                          <div className="fireban-alert-card">
                            <div className="p-3">
                              <h6 className="card-title text-danger">
                                {fireBanStatus.alert.title}
                              </h6>
                              <div className="card-text" style={{lineHeight: '1.6'}}>
                                {formatFireBanDescription(fireBanStatus.alert.description).map((sentence, index) => (
                                  <p key={index} className="mb-2">
                                    {sentence.endsWith('.') ? sentence : sentence + '.'}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Summary */}
                      {fireBanStatus.data.aiAnalysis?.summary && (
                        <div className="mb-4">
                          <div className="fireban-summary-card">
                            <div className="p-3">
                              <div className="small text-muted mb-1">Summary</div>
                              <div>{fireBanStatus.data.aiAnalysis.summary}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      
                    </div>
                  )
                })()}
              </div>
              <div className="modal-footer">
                <div className="d-flex gap-2 justify-content-center flex-wrap w-100">
                  {(() => {
                    const fireBanStatus = getFireBanStatus()
                    return (
                      <>
                        <a 
                            href={'https://www.dysartetal.ca/en/index.aspx'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline-danger"
                          >
                            Source: Dysart et al →
                          </a>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => setShowFireBanModal(false)}
                        >
                          Close
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Weather Modal */}
      <WeatherModal 
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
      />
    </div>
  )
} 