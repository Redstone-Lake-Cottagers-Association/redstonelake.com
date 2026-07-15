'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface WeatherData {
  temp: number
  humidity: number
  clouds: number
  wind: {
    speed: number
    deg: number
  }
  desc: string
  icon: string
  location: string
  feels_like: number
  pressure: number
  visibility: number
  uv_index: number
  pop?: number // probability of precipitation
  alerts: Array<{
    sender_name: string
    event: string
    start: number
    end: number
    description: string
  }>
}

interface ForecastDay {
  date: string
  temp_max: number
  temp_min: number
  desc: string
  icon: string
  humidity: number
  wind_speed: number
  pop: number // probability of precipitation
}

interface HourlyForecast {
  time: string
  temp: number
  icon: string
  pop: number
  wind_speed?: number
  wind_deg?: number
  humidity?: number
  uvi?: number
}

interface WeatherModalProps {
  isOpen: boolean
  onClose: () => void
}

// RainViewer Radar Component
function RadarMap() {
  const [loading, setLoading] = useState(true)
  
  // RainViewer iframe URL centered on Redstone Lake
  const rainviewerUrl = 'https://www.rainviewer.com/map.html?loc=45.0576,-78.4186,10&oFa=0&oC=0&oU=0&oCS=1&oF=0&oAP=0&rmt=4&c=1&o=83&lm=0&layer=radar&sm=1&sn=1&oP=0'

  const handleIframeLoad = () => {
    setLoading(false)
  }

  return (
    <div className="position-relative" style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1a2332' }}>
      {loading && (
        <div className="d-flex justify-content-center align-items-center position-absolute w-100 h-100" style={{ zIndex: 2 }}>
          <div className="text-white-50">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading radar data...
          </div>
        </div>
      )}
      
      <iframe
        src={rainviewerUrl}
        width="100%"
        height="100%"
        style={{ 
          border: 'none',
          borderRadius: '8px'
        }}
        onLoad={handleIframeLoad}
        title="RainViewer Weather Radar"
      />

      {/* Data source attribution */}
      <div 
        className="position-absolute" 
        style={{ 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0, 0, 0, 0.7)', 
          padding: '4px 8px', 
          borderRadius: '4px',
          zIndex: 3
        }}
      >
        <small className="text-white-50" style={{ fontSize: '9px' }}>
          RainViewer
        </small>
      </div>
    </div>
  )
}

export default function WeatherModal({ isOpen, onClose }: WeatherModalProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'daily' | 'air' | 'radar' | 'alerts'>('current')
  const [cachedAt, setCachedAt] = useState<string | null>(null)
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')
  const [aqHourly, setAqHourly] = useState<{ time: string[]; aqi: number[] } | null>(null)
  const [aqDaily, setAqDaily] = useState<{ date: string; aqi: number; past: boolean }[] | null>(null)
  const [aqMeta, setAqMeta] = useState<{ aqi: number; category: string; source: string; station?: string; distanceKm?: number } | null>(null)

  useEffect(() => {
    fetch('/api/air-quality')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && !d.error) {
          setAqMeta(d)
          if (d.hourly?.time?.length) setAqHourly(d.hourly)
          if (d.daily?.length) setAqDaily(d.daily)
        }
      })
      .catch(() => {})
    if (isOpen) {
      fetchDetailedWeatherData()
    }
  }, [isOpen])

  // Load temperature unit preference from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem('weather-temp-unit') as 'C' | 'F'
    if (savedUnit && (savedUnit === 'C' || savedUnit === 'F')) {
      setTempUnit(savedUnit)
    }

    // Listen for temperature unit changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather-temp-unit' && e.newValue) {
        const newUnit = e.newValue as 'C' | 'F'
        if (newUnit === 'C' || newUnit === 'F') {
          setTempUnit(newUnit)
        }
      }
    }

    const handleCustomTempUnitChange = (e: CustomEvent<'C' | 'F'>) => {
      setTempUnit(e.detail)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('tempUnitChanged', handleCustomTempUnitChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tempUnitChanged', handleCustomTempUnitChange as EventListener)
    }
  }, [])

  // Save temperature unit preference to localStorage and notify other components
  const handleTempUnitChange = (unit: 'C' | 'F') => {
    setTempUnit(unit)
    localStorage.setItem('weather-temp-unit', unit)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('tempUnitChanged', { detail: unit }))
  }

  // Convert temperature based on user preference
  const convertTemp = (celsius: number): number => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9/5) + 32)
    }
    return Math.round(celsius)
  }

  // Toggle daily chart visibility
  const fetchDetailedWeatherData = async () => {
    try {
      setLoading(true)

      // Fetch all weather data
      const [currentResponse, forecastResponse, hourlyResponse] = await Promise.all([
        fetch('/api/weather?type=current'),
        fetch('/api/weather?type=forecast'),
        fetch('/api/weather?type=hourly')
      ])

      if (currentResponse.ok && forecastResponse.ok && hourlyResponse.ok) {
        const currentData = await currentResponse.json()
        const forecastData = await forecastResponse.json()
        const hourlyData = await hourlyResponse.json()

        setWeather(currentData)
        setForecast(forecastData.forecast || [])
        setHourlyForecast(hourlyData.hourlyForecast || [])
        // Prefer current's cachedAt, fall back to forecast/hourly
        setCachedAt(currentData.cachedAt || forecastData.cachedAt || hourlyData.cachedAt || null)
      } else {
        throw new Error('Failed to fetch weather data')
      }

    } catch (err) {
      console.error('Error fetching detailed weather data:', err)
      
      // Fallback to mock data
      const mockWeather: WeatherData = {
        temp: 22,
        humidity: 65,
        clouds: 40,
        wind: {
          speed: 8,
          deg: 180
        },
        desc: 'Partly cloudy',
        icon: '02d',
        location: 'Redstone Lake, ON',
        feels_like: 25,
        pressure: 1013,
        visibility: 10,
        uv_index: 6,
        alerts: []
      }

      const mockForecast: ForecastDay[] = [
        { date: 'Today', temp_max: 24, temp_min: 18, desc: 'Partly cloudy', icon: '02d', humidity: 65, wind_speed: 8, pop: 20 },
        { date: 'Tomorrow', temp_max: 26, temp_min: 19, desc: 'Sunny', icon: '01d', humidity: 58, wind_speed: 12, pop: 0 },
        { date: 'Wednesday', temp_max: 23, temp_min: 16, desc: 'Light rain', icon: '10d', humidity: 78, wind_speed: 15, pop: 80 },
        { date: 'Thursday', temp_max: 25, temp_min: 17, desc: 'Cloudy', icon: '03d', humidity: 62, wind_speed: 10, pop: 30 },
        { date: 'Friday', temp_max: 28, temp_min: 20, desc: 'Sunny', icon: '01d', humidity: 55, wind_speed: 6, pop: 0 },
        { date: 'Saturday', temp_max: 27, temp_min: 21, desc: 'Partly cloudy', icon: '02d', humidity: 60, wind_speed: 9, pop: 10 },
        { date: 'Sunday', temp_max: 24, temp_min: 18, desc: 'Thunderstorms', icon: '11d', humidity: 82, wind_speed: 18, pop: 90 }
      ]

      const mockHourly: HourlyForecast[] = [
        { time: 'Now', temp: 22, icon: '02d', pop: 20, humidity: 65, wind_speed: 8, wind_deg: 180, uvi: 6 },
        { time: '1 PM', temp: 24, icon: '02d', pop: 15, humidity: 62, wind_speed: 10, wind_deg: 175, uvi: 7 },
        { time: '2 PM', temp: 25, icon: '01d', pop: 10, humidity: 58, wind_speed: 12, wind_deg: 170, uvi: 8 },
        { time: '3 PM', temp: 26, icon: '01d', pop: 5, humidity: 55, wind_speed: 15, wind_deg: 165, uvi: 9 },
        { time: '4 PM', temp: 25, icon: '02d', pop: 10, humidity: 60, wind_speed: 13, wind_deg: 160, uvi: 7 },
        { time: '5 PM', temp: 23, icon: '02d', pop: 20, humidity: 68, wind_speed: 10, wind_deg: 155, uvi: 5 },
        { time: '6 PM', temp: 21, icon: '03d', pop: 30, humidity: 72, wind_speed: 8, wind_deg: 150, uvi: 3 },
        { time: '7 PM', temp: 20, icon: '03d', pop: 25, humidity: 75, wind_speed: 6, wind_deg: 145, uvi: 1 }
      ]

      setWeather(mockWeather)
      setForecast(mockForecast)
      setHourlyForecast(mockHourly)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '☀️'
  }

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(deg / 22.5) % 16]
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="modal fade show d-block"
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1100px' }}>
        <div className="modal-content" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="modal-header border-bottom border-light border-opacity-10 d-flex justify-content-between align-items-center">
            <h5 className="modal-title text-white mb-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                <path d="M12 2v2m6.364.636l-1.414 1.414M22 12h-2M19.778 17.778l-1.414-1.414M12 20v2m-6.364-.636l1.414-1.414M2 12h2m2.222-5.778l1.414 1.414" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="4" stroke="#f59e0b" strokeWidth="2" fill="#fbbf24"/>
              </svg>
              Weather Forecast
            </h5>
            <div className="d-flex align-items-center gap-3">
              {/* Temperature Unit Toggle */}
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => handleTempUnitChange('C')}
                  style={{ 
                    borderRadius: '0', 
                    fontSize: '0.8rem', 
                    padding: '0.25rem 0.5rem',
                    transition: 'none',
                    transform: 'none',
                    border: tempUnit === 'C' ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                    backgroundColor: 'transparent',
                    color: tempUnit === 'C' ? 'white' : 'rgba(255,255,255,0.6)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'none'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  °C
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => handleTempUnitChange('F')}
                  style={{ 
                    borderRadius: '0', 
                    fontSize: '0.8rem', 
                    padding: '0.25rem 0.5rem',
                    transition: 'none',
                    transform: 'none',
                    border: tempUnit === 'F' ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                    backgroundColor: 'transparent',
                    color: tempUnit === 'F' ? 'white' : 'rgba(255,255,255,0.6)',
                    borderLeft: '1px solid rgba(255,255,255,0.5)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'none'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  °F
                </button>
              </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>
          
          <div className="modal-body p-0">
            {/* Tab Navigation */}
            <nav className="nav nav-tabs border-bottom border-light border-opacity-10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <style jsx global>{`
              .modal .nav-link {
                color: white !important;
              }
              .modal .nav-link:hover {
                color: white !important;
              }
              .modal .nav-link:focus {
                color: white !important;
              }
              .modal .nav-link.active {
                color: white !important;
              }
              .modal .nav-link:visited {
                color: white !important;
              }
              .modal .nav-link:link {
                color: white !important;
              }
              .modal button.nav-link {
                color: white !important;
              }
              .modal button.nav-link:hover {
                color: white !important;
              }
              .modal button.nav-link:focus {
                color: white !important;
              }
              .modal button.nav-link.active {
                color: white !important;
              }
              .modal .btn {
                transform: none !important;
                transition: none !important;
              }
              .modal .btn:hover {
                transform: none !important;
              }
              .modal .btn:focus {
                transform: none !important;
              }
              .modal .btn:active {
                transform: none !important;
              }
            `}</style>
              <button 
                className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
                style={{ 
                  color: activeTab === 'current' ? 'white !important' : 'white !important',
                  backgroundColor: activeTab === 'current' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'current') {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'current') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Current Conditions
              </button>
              <button 
                className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveTab('daily')}
                style={{ 
                  color: activeTab === 'daily' ? 'white !important' : 'white !important',
                  backgroundColor: activeTab === 'daily' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'daily') {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'daily') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                7-Day
              </button>
              <button
                className={`nav-link ${activeTab === 'air' ? 'active' : ''}`}
                onClick={() => setActiveTab('air')}
                style={{
                  color: 'white !important',
                  backgroundColor: activeTab === 'air' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'air') {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'air') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Air Quality
              </button>
              <button 
                className={`nav-link ${activeTab === 'radar' ? 'active' : ''}`}
                onClick={() => setActiveTab('radar')}
                style={{ 
                  color: activeTab === 'radar' ? 'white !important' : 'white !important',
                  backgroundColor: activeTab === 'radar' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'radar') {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'radar') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Radar
              </button>
              <button 
                className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setActiveTab('alerts')}
                style={{ 
                  color: activeTab === 'alerts' ? 'white !important' : 'white !important',
                  backgroundColor: activeTab === 'alerts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '0'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'alerts') {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'alerts') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Alerts {weather?.alerts && weather.alerts.length > 0 && (
                  <span className="badge bg-warning ms-1">{weather.alerts.length}</span>
                )}
              </button>
            </nav>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-white-50 mt-2">Loading weather data...</p>
                </div>
              ) : (
                <>
                  {/* Current Weather & Hourly Tab */}
                  {activeTab === 'current' && weather && (
                    <div className="text-white">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-4">
                            <span className="display-4 me-3">{getWeatherIcon(weather.icon)}</span>
                            <div>
                              <div className="display-3 fw-bold">{convertTemp(weather.temp)}°{tempUnit}</div>
                              <div className="text-white-50">Feels like {convertTemp(weather.feels_like)}°{tempUnit}</div>
                            </div>
                          </div>
                          <h6 className="text-capitalize mb-3">{weather.desc}</h6>
                          <p className="text-white-50 mb-0">📍 {weather.location}</p>
                        </div>
                        <div className="col-md-6">
                          <div className="row g-3">
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">Rain Chance</div>
                                <div className="h6 mb-0">☔️ {weather.pop !== undefined ? `${weather.pop}%` : '0%'}</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">Humidity</div>
                                <div className="h6 mb-0">💧 {weather.humidity}%</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">Wind</div>
                                <div className="h6 mb-0">💨 {weather.wind.speed} km/h {getWindDirection(weather.wind.deg)}</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">Pressure</div>
                                <div className="h6 mb-0">🌡️ {weather.pressure} hPa</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">UV Index</div>
                                <div className="h6 mb-0">☀️ {weather.uv_index}</div>
                          </div>
                        </div>
                            <div className="col-6">
                              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="small text-white-50 mb-1">Clouds</div>
                                <div className="h6 mb-0">☁️ {weather.clouds}%</div>
                      </div>
                    </div>
                          </div>
                        </div>
                      </div>

                      {/* Hourly Weather Charts — one real scale per unit */}
                      <div className="mt-5">
                        <h6 className="text-white mb-3">24-Hour Forecast</h6>
                        <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          {(() => {
                            const W = 800
                            const PADL = 48
                            const PADR = 14
                            const n = hourlyForecast.length
                            const xAt = (i: number) => PADL + i * ((W - PADL - PADR) / Math.max(1, n - 1))
                            const temps = hourlyForecast.map(h => convertTemp(h.temp))
                            const tMin = Math.floor(Math.min(...temps)) - 1
                            const tMax = Math.ceil(Math.max(...temps)) + 1
                            const winds = hourlyForecast.map(h => Math.round(h.wind_speed ?? 0))
                            const wMax = Math.max(10, Math.ceil(Math.max(...winds) / 5) * 5)

                            const grid = (y: number) => (
                              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                            )
                            const tick = (y: number, label: string) => (
                              <text x={PADL - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">{label}</text>
                            )

                            // Temperature panel: real degree scale
                            const T_TOP = 16
                            const T_BOT = 108
                            const tY = (v: number) => T_BOT - ((v - tMin) / (tMax - tMin)) * (T_BOT - T_TOP)
                            const tMid = Math.round((tMin + tMax) / 2)

                            // Percent panel: true 0–100 axis shared by rain chance and humidity
                            const P_TOP = 12
                            const P_BOT = 104
                            const pY = (v: number) => P_BOT - (v / 100) * (P_BOT - P_TOP)

                            // Wind panel: km/h from zero
                            const W_TOP = 12
                            const W_BOT = 96
                            const wY = (v: number) => W_BOT - (v / wMax) * (W_BOT - W_TOP)

                            return (
                              <>
                                <div className="small text-white-50 mb-1">Temperature (°{tempUnit})</div>
                                <svg width="100%" height="124" viewBox={`0 0 ${W} 124`} style={{ overflow: 'visible' }}>
                                  {[tMin, tMid, tMax].map(v => (
                                    <g key={v}>{grid(tY(v))}{tick(tY(v), `${v}°`)}</g>
                                  ))}
                                  <polyline
                                    points={temps.map((t, i) => `${xAt(i)},${tY(t)}`).join(' ')}
                                    fill="none" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                  />
                                  {temps.map((t, i) => (
                                    <g key={i}>
                                      <circle cx={xAt(i)} cy={tY(t)} r="4" fill="#ffc107" stroke="#fff" strokeWidth="2" />
                                      {(i % 2 === 0 || n <= 8) && (
                                        <text x={xAt(i)} y={tY(t) - 10} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{t}°</text>
                                      )}
                                    </g>
                                  ))}
                                </svg>

                                <div className="small text-white-50 mb-1 mt-3 d-flex align-items-center gap-3">
                                  <span>Rain chance &amp; humidity (%)</span>
                                  <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                    <span style={{ width: '10px', height: '10px', background: 'rgba(54,162,235,0.55)', display: 'inline-block' }} /> rain chance
                                  </span>
                                  <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                    <span style={{ width: '14px', borderTop: '2px dashed #17a2b8', display: 'inline-block' }} /> humidity
                                  </span>
                                </div>
                                <svg width="100%" height="112" viewBox={`0 0 ${W} 112`} style={{ overflow: 'visible' }}>
                                  {[0, 50, 100].map(v => (
                                    <g key={v}>{grid(pY(v))}{tick(pY(v), `${v}%`)}</g>
                                  ))}
                                  {hourlyForecast.map((hour, i) => {
                                    const h = Math.max(0, pY(0) - pY(hour.pop ?? 0))
                                    return (
                                      <rect key={i} x={xAt(i) - 9} y={pY(hour.pop ?? 0)} width="18" height={h}
                                        fill="rgba(54,162,235,0.35)" stroke="rgba(54,162,235,0.6)" strokeWidth="1" />
                                    )
                                  })}
                                  <polyline
                                    points={hourlyForecast.map((hour, i) => `${xAt(i)},${pY(hour.humidity ?? 50)}`).join(' ')}
                                    fill="none" stroke="#17a2b8" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round"
                                  />
                                </svg>

                                <div className="small text-white-50 mb-1 mt-3">Wind (km/h)</div>
                                <svg width="100%" height="128" viewBox={`0 0 ${W} 128`} style={{ overflow: 'visible' }}>
                                  {[0, wMax / 2, wMax].map(v => (
                                    <g key={v}>{grid(wY(v))}{tick(wY(v), `${v}`)}</g>
                                  ))}
                                  <polyline
                                    points={winds.map((w, i) => `${xAt(i)},${wY(w)}`).join(' ')}
                                    fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  />
                                  {winds.map((w, i) => (
                                    <circle key={i} cx={xAt(i)} cy={wY(w)} r="3" fill="#28a745" stroke="#fff" strokeWidth="1" />
                                  ))}
                                  {hourlyForecast.map((hour, i) =>
                                    i % 2 === 0 || n <= 8 ? (
                                      <text key={i} x={xAt(i)} y={122} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">{hour.time}</text>
                                    ) : null
                                  )}
                                </svg>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Detailed hourly data */}
                      <div className="mt-4">
                        <h6 className="text-white mb-3">Hourly Details</h6>
                        {hourlyForecast.map((hour, index) => (
                          <div key={index} className="p-2 rounded mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <span className="fs-5 me-3">{getWeatherIcon(hour.icon)}</span>
                                <div>
                                  <div className="text-white fw-semibold">{hour.time}</div>
                                  <div className="text-white-50 small">{convertTemp(hour.temp)}°{tempUnit}</div>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="small text-white-50">
                                  ☔️ {hour.pop}%{hour.humidity !== undefined ? ` • 💧 ${hour.humidity}%` : ''}{hour.wind_speed !== undefined ? ` • 💨 ${hour.wind_speed} km/h` : ''}{hour.wind_deg !== undefined ? ` ${getWindDirection(hour.wind_deg)}` : ''}{hour.uvi !== undefined ? ` • ☀️ UV ${Math.round(hour.uvi)}` : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* 7-Day Forecast Tab */}
                  {activeTab === 'daily' && (
                    <div>
                      {/* 7-Day Weather Charts — one real scale per unit */}
                      <div className="mb-4">
                        <h6 className="text-white mb-3">7-Day Forecast</h6>
                        <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          {(() => {
                            const W = 800
                            const PADL = 48
                            const PADR = 14
                            const n = forecast.length
                            const xAt = (i: number) => PADL + i * ((W - PADL - PADR) / Math.max(1, n - 1))
                            const highs = forecast.map(d => convertTemp(d.temp_max))
                            const lows = forecast.map(d => convertTemp(d.temp_min))
                            const tMin = Math.floor(Math.min(...lows)) - 1
                            const tMax = Math.ceil(Math.max(...highs)) + 1
                            const winds = forecast.map(d => Math.round((d as any).wind_speed ?? 0))
                            const wMax = Math.max(10, Math.ceil(Math.max(...winds) / 5) * 5)

                            const grid = (y: number) => (
                              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                            )
                            const tick = (y: number, label: string) => (
                              <text x={PADL - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">{label}</text>
                            )

                            const T_TOP = 18
                            const T_BOT = 116
                            const tY = (v: number) => T_BOT - ((v - tMin) / (tMax - tMin)) * (T_BOT - T_TOP)
                            const tMid = Math.round((tMin + tMax) / 2)

                            const P_TOP = 12
                            const P_BOT = 104
                            const pY = (v: number) => P_BOT - (v / 100) * (P_BOT - P_TOP)

                            const W_TOP = 12
                            const W_BOT = 96
                            const wY = (v: number) => W_BOT - (v / wMax) * (W_BOT - W_TOP)

                            return (
                              <>
                                <div className="small text-white-50 mb-1">Daily high &amp; low (°{tempUnit})</div>
                                <svg width="100%" height="164" viewBox={`0 0 ${W} 164`} style={{ overflow: 'visible' }}>
                                  {[tMin, tMid, tMax].map(v => (
                                    <g key={v}>{grid(tY(v))}{tick(tY(v), `${v}°`)}</g>
                                  ))}
                                  {forecast.map((day, i) => {
                                    const hi = convertTemp(day.temp_max)
                                    const lo = convertTemp(day.temp_min)
                                    return (
                                      <g key={i}>
                                        <rect x={xAt(i) - 6} y={tY(hi)} width="12" height={Math.max(4, tY(lo) - tY(hi))}
                                          rx="6" fill="rgba(255,193,7,0.35)" stroke="#ffc107" strokeWidth="1.5" />
                                        <text x={xAt(i)} y={tY(hi) - 8} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{hi}°</text>
                                        <text x={xAt(i)} y={tY(lo) + 16} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10">{lo}°</text>
                                        <text x={xAt(i)} y={146} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="600">{day.date}</text>
                                        <text x={xAt(i)} y={161} textAnchor="middle" fontSize="12">{getWeatherIcon(day.icon)}</text>
                                      </g>
                                    )
                                  })}
                                </svg>

                                <div className="small text-white-50 mb-1 mt-3 d-flex align-items-center gap-3">
                                  <span>Rain chance &amp; humidity (%)</span>
                                  <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                    <span style={{ width: '10px', height: '10px', background: 'rgba(54,162,235,0.55)', display: 'inline-block' }} /> rain chance
                                  </span>
                                  <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                    <span style={{ width: '14px', borderTop: '2px dashed #17a2b8', display: 'inline-block' }} /> humidity
                                  </span>
                                </div>
                                <svg width="100%" height="112" viewBox={`0 0 ${W} 112`} style={{ overflow: 'visible' }}>
                                  {[0, 50, 100].map(v => (
                                    <g key={v}>{grid(pY(v))}{tick(pY(v), `${v}%`)}</g>
                                  ))}
                                  {forecast.map((day, i) => {
                                    const pop = (day as any).pop ?? 0
                                    return (
                                      <rect key={i} x={xAt(i) - 9} y={pY(pop)} width="18" height={Math.max(0, pY(0) - pY(pop))}
                                        fill="rgba(54,162,235,0.35)" stroke="rgba(54,162,235,0.6)" strokeWidth="1" />
                                    )
                                  })}
                                  <polyline
                                    points={forecast.map((day, i) => `${xAt(i)},${pY(day.humidity ?? 50)}`).join(' ')}
                                    fill="none" stroke="#17a2b8" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round"
                                  />
                                </svg>

                                <div className="small text-white-50 mb-1 mt-3">Wind (km/h)</div>
                                <svg width="100%" height="112" viewBox={`0 0 ${W} 112`} style={{ overflow: 'visible' }}>
                                  {[0, wMax / 2, wMax].map(v => (
                                    <g key={v}>{grid(wY(v))}{tick(wY(v), `${v}`)}</g>
                                  ))}
                                  <polyline
                                    points={winds.map((w, i) => `${xAt(i)},${wY(w)}`).join(' ')}
                                    fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  />
                                  {winds.map((w, i) => (
                                    <circle key={i} cx={xAt(i)} cy={wY(w)} r="3" fill="#28a745" stroke="#fff" strokeWidth="1" />
                                  ))}
                                  {forecast.map((day, i) => (
                                    <text key={i} x={xAt(i)} y={108} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">{day.date}</text>
                                  ))}
                                </svg>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Detailed 7-Day Data */}
                      <div>
                        <h6 className="text-white mb-3">Daily Details</h6>
                        {forecast.map((day, index) => (
                          <div key={index} className="p-3 rounded mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <span className="fs-4 me-3">{getWeatherIcon(day.icon)}</span>
                              <div>
                                  <div className="text-white fw-semibold">{day.date}</div>
                                  <div className="text-white-50 small">{day.desc}</div>
                              </div>
                            </div>
                            <div className="text-end">
                                <div className="mb-2">
                                  <span className="text-white fw-bold fs-5">{convertTemp(day.temp_max)}°{tempUnit}</span>
                                  <span className="text-white-50 ms-2">{convertTemp(day.temp_min)}°{tempUnit}</span>
                              </div>
                              <div className="small text-white-50">
                                  ☔️ {day.pop}% • 💨 {day.wind_speed} km/h • 💧 {day.humidity}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Radar Tab */}
                  {/* Air Quality Tab */}
                  {activeTab === 'air' && (
                    <div>
                      <div className="mb-4">
                        <h6 className="text-white mb-1">Air Quality — US AQI</h6>
                        {aqMeta && (
                          <div className="text-white-50 small mb-3">
                            Now: <span className="text-white fw-semibold">{aqMeta.aqi} ({aqMeta.category})</span>
                            {aqMeta.source === 'openaq'
                              ? ` — observed at the ${aqMeta.station} monitor, ${aqMeta.distanceKm} km away. History and forecast are modelled (Open-Meteo/CAMS).`
                              : ' — modelled for the lakes (Open-Meteo/CAMS).'}
                          </div>
                        )}
                        <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          {(() => {
                            const W = 800
                            const PADL = 48
                            const PADR = 14
                            const grid = (y: number) => (
                              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                            )
                            const tick = (y: number, label: string) => (
                              <text x={PADL - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">{label}</text>
                            )
                            const hourLabel = (t: string) => {
                              const h = new Date(t).getHours()
                              return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
                            }
                            return (
                              <>
                                {aqHourly && aqHourly.aqi.length > 1 && (() => {
                                  const an = aqHourly.aqi.length
                                  const axAt = (i: number) => PADL + i * ((W - PADL - PADR) / Math.max(1, an - 1))
                                  const aMax = Math.max(100, Math.ceil(Math.max(...aqHourly.aqi) / 25) * 25)
                                  const A_TOP = 12
                                  const A_BOT = 96
                                  const aY = (v: number) => A_BOT - (v / aMax) * (A_BOT - A_TOP)
                                  return (
                                    <>
                                      <div className="small text-white-50 mb-1">Next 24 hours</div>
                                      <svg width="100%" height="128" viewBox={`0 0 ${W} 128`} style={{ overflow: 'visible' }}>
                                        {grid(aY(0))}{tick(aY(0), '0')}
                                        {grid(aY(50))}{tick(aY(50), '50')}
                                        <text x={PADL + 4} y={aY(50) - 4} fill="rgba(255,255,255,0.45)" fontSize="9">≤50 good · ≤100 moderate</text>
                                        {grid(aY(100))}{tick(aY(100), '100')}
                                        {aMax > 100 && <>{grid(aY(aMax))}{tick(aY(aMax), `${aMax}`)}</>}
                                        <polyline
                                          points={aqHourly.aqi.map((v, i) => `${axAt(i)},${aY(v)}`).join(' ')}
                                          fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        />
                                        {aqHourly.aqi.map((v, i) => (
                                          <circle key={i} cx={axAt(i)} cy={aY(v)} r="3" fill="#a78bfa" stroke="#fff" strokeWidth="1" />
                                        ))}
                                        {aqHourly.time.map((t, i) =>
                                          i % 3 === 0 ? (
                                            <text key={i} x={axAt(i)} y={122} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">{hourLabel(t)}</text>
                                          ) : null
                                        )}
                                      </svg>
                                    </>
                                  )
                                })()}

                                {aqDaily && aqDaily.length > 1 && (() => {
                                  const dn = aqDaily.length
                                  const step = (W - PADL - PADR) / dn
                                  const dxAt = (i: number) => PADL + i * step + step / 2
                                  const dMax = Math.max(100, Math.ceil(Math.max(...aqDaily.map(d => d.aqi)) / 25) * 25)
                                  const D_TOP = 12
                                  const D_BOT = 108
                                  const dY = (v: number) => D_BOT - (v / dMax) * (D_BOT - D_TOP)
                                  return (
                                    <>
                                      <div className="small text-white-50 mb-1 mt-4 d-flex align-items-center gap-3">
                                        <span>Daily worst-hour AQI — past 30 days &amp; week ahead</span>
                                        <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                          <span style={{ width: '10px', height: '10px', background: 'rgba(148,163,184,0.5)', display: 'inline-block' }} /> past
                                        </span>
                                        <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                          <span style={{ width: '10px', height: '10px', background: 'rgba(167,139,250,0.8)', display: 'inline-block' }} /> forecast
                                        </span>
                                      </div>
                                      <svg width="100%" height="140" viewBox={`0 0 ${W} 140`} style={{ overflow: 'visible' }}>
                                        {grid(dY(0))}{tick(dY(0), '0')}
                                        {grid(dY(50))}{tick(dY(50), '50')}
                                        {grid(dY(100))}{tick(dY(100), '100')}
                                        {dMax > 100 && <>{grid(dY(dMax))}{tick(dY(dMax), `${dMax}`)}</>}
                                        {aqDaily.map((d, i) => (
                                          <rect key={d.date} x={dxAt(i) - Math.max(2, step * 0.32)} y={dY(d.aqi)}
                                            width={Math.max(4, step * 0.64)} height={Math.max(1, dY(0) - dY(d.aqi))}
                                            fill={d.past ? 'rgba(148,163,184,0.5)' : 'rgba(167,139,250,0.8)'}>
                                            <title>{`${d.date}: worst hour AQI ${d.aqi}`}</title>
                                          </rect>
                                        ))}
                                        {aqDaily.map((d, i) =>
                                          i % 7 === 0 || i === dn - 1 ? (
                                            <text key={d.date} x={dxAt(i)} y={134} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
                                              {new Date(d.date + 'T12:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                                            </text>
                                          ) : null
                                        )}
                                      </svg>
                                    </>
                                  )
                                })()}
                                <div className="text-white-50 mt-2" style={{ fontSize: '0.7rem' }}>
                                  US AQI from PM2.5 and other pollutants. ≤50 good · 51–100 moderate · 101–150 unhealthy for
                                  sensitive groups. Sources: OpenAQ (Ontario MECP Dorset monitor) and the Open-Meteo/CAMS model.
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'radar' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="text-white mb-0">Weather Radar</h6>
                        <small className="text-white-50">Real-time precipitation data</small>
                            </div>
                      <RadarMap />
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <small className="text-white-50">
                          Interactive radar map for Redstone Lake area
                        </small>
                        <a 
                          href="/radar" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-light btn-sm"
                              >
                          Open Full Screen
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Weather Alerts Tab */}
                  {activeTab === 'alerts' && (
                    <div>
                      {weather?.alerts && weather.alerts.length > 0 ? (
                        <div>
                          {weather.alerts.map((alert, index) => (
                            <div key={index} className="p-4 rounded mb-3" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                              <div className="d-flex align-items-start">
                                <span className="me-3 text-warning fs-4">⚠️</span>
                                <div className="flex-grow-1">
                                  <h6 className="text-warning mb-3">{alert.event}</h6>
                                  <div className="text-white-50 mb-3">
                                    <div>From: {new Date(alert.start * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    <div>Until: {new Date(alert.end * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    <div>Source: {alert.sender_name}</div>
                                </div>
                                  <div className="text-white" style={{ lineHeight: '1.5' }}>
                                {alert.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-success">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h6 className="text-white mb-2">No Weather Alerts</h6>
                          <p className="text-white-50 mb-0">All clear for the Redstone Lake area</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="modal-footer border-top border-light border-opacity-10 d-flex justify-content-between">
            <div className="small text-white-50">
              {cachedAt && (
                <>Updated {new Date(cachedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</>
              )}
        </div>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
      </div>
    </div>,
    document.body
  )


}
