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

export default function WeatherModal({ isOpen, onClose }: WeatherModalProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'daily' | 'radar' | 'alerts'>('current')
  const [cachedAt, setCachedAt] = useState<string | null>(null)
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')
  const [chartVisibility, setChartVisibility] = useState({
    temperature: true,
    precipitation: true,
    humidity: true,
    wind: true
  })
  const [dailyChartVisibility, setDailyChartVisibility] = useState({
    temperature: true,
    precipitation: true,
    humidity: true,
    wind: true
  })

  useEffect(() => {
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

  // Toggle chart visibility
  const toggleChartVisibility = (metric: keyof typeof chartVisibility) => {
    setChartVisibility(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }))
  }

  // Toggle daily chart visibility
  const toggleDailyChartVisibility = (metric: keyof typeof dailyChartVisibility) => {
    setDailyChartVisibility(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }))
  }

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

                      {/* Hourly Weather Chart */}
                      <div className="mt-5">
                        <h6 className="text-white mb-3">24-Hour Forecast</h6>
                        <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <svg width="100%" height="200" viewBox="0 0 800 200" style={{ overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                              <line key={`grid-${i}`} x1="60" y1={20 + i * 30} x2="740" y2={20 + i * 30} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            ))}
                            
                            {/* Precipitation bars (background) */}
                            {chartVisibility.precipitation && hourlyForecast.map((hour, index) => {
                              const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                              const barHeight = (hour.pop / 100) * 120
                              return (
                                <rect
                                  key={`precip-${index}`}
                                  x={x - 10}
                                  y={140 - barHeight}
                                  width="20"
                                  height={barHeight}
                                  fill="rgba(54, 162, 235, 0.2)"
                                  stroke="rgba(54, 162, 235, 0.4)"
                                  strokeWidth="1"
                                />
                              )
                            })}
                            
                            {/* Temperature line */}
                            {chartVisibility.temperature && (
                              <polyline
                                points={hourlyForecast.map((hour, index) => {
                                  const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                  const tempRange = Math.max(...hourlyForecast.map(h => convertTemp(h.temp))) - Math.min(...hourlyForecast.map(h => convertTemp(h.temp)))
                                  const minTemp = Math.min(...hourlyForecast.map(h => convertTemp(h.temp)))
                                  const normalizedTemp = tempRange > 0 ? (convertTemp(hour.temp) - minTemp) / tempRange : 0.5
                                  const y = 140 - (normalizedTemp * 120)
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#ffc107"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            
                            {/* Humidity line */}
                            {chartVisibility.humidity && (
                              <polyline
                                points={hourlyForecast.map((hour, index) => {
                                  const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                  const humidity = hour.humidity ?? 50
                                  const y = 140 - ((humidity / 100) * 120)
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#17a2b8"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="5,5"
                              />
                            )}
                            
                            {/* Wind speed line */}
                            {chartVisibility.wind && (
                              <polyline
                                points={hourlyForecast.map((hour, index) => {
                                  const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                  const windSpeed = hour.wind_speed ?? 0
                                  const maxWind = Math.max(...hourlyForecast.map(h => h.wind_speed ?? 0))
                                  const normalizedWind = maxWind > 0 ? (windSpeed / maxWind) : 0
                                  const y = 140 - (normalizedWind * 120)
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#28a745"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="3,3"
                              />
                            )}
                            
                            {/* Temperature points and labels */}
                            {chartVisibility.temperature && hourlyForecast.map((hour, index) => {
                              const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                              const tempRange = Math.max(...hourlyForecast.map(h => convertTemp(h.temp))) - Math.min(...hourlyForecast.map(h => convertTemp(h.temp)))
                              const minTemp = Math.min(...hourlyForecast.map(h => convertTemp(h.temp)))
                              const normalizedTemp = tempRange > 0 ? (convertTemp(hour.temp) - minTemp) / tempRange : 0.5
                              const y = 140 - (normalizedTemp * 120)
                              return (
                                <g key={`temp-point-${index}`}>
                                  <circle cx={x} cy={y} r="4" fill="#ffc107" stroke="#fff" strokeWidth="2" />
                                  {(index % 2 === 0 || hourlyForecast.length <= 8) && (
                                    <text x={x} y={y - 10} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                                      {convertTemp(hour.temp)}°
                                    </text>
                                  )}
                                </g>
                              )
                            })}
                            
                            {/* Humidity points */}
                            {chartVisibility.humidity && hourlyForecast.map((hour, index) => {
                              if (hour.humidity !== undefined) {
                                const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                const y = 140 - ((hour.humidity / 100) * 120)
                                return (
                                  <circle key={`humidity-point-${index}`} cx={x} cy={y} r="3" fill="#17a2b8" stroke="#fff" strokeWidth="1" />
                                )
                              }
                              return null
                            })}
                            
                            {/* Wind points */}
                            {chartVisibility.wind && hourlyForecast.map((hour, index) => {
                              if (hour.wind_speed !== undefined) {
                                const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                const maxWind = Math.max(...hourlyForecast.map(h => h.wind_speed ?? 0))
                                const normalizedWind = maxWind > 0 ? ((hour.wind_speed ?? 0) / maxWind) : 0
                                const y = 140 - (normalizedWind * 120)
                                return (
                                  <circle key={`wind-point-${index}`} cx={x} cy={y} r="3" fill="#28a745" stroke="#fff" strokeWidth="1" />
                                )
                              }
                              return null
                            })}
                            
                            {/* Time labels */}
                            {hourlyForecast.map((hour, index) => {
                              if (index % 2 === 0 || hourlyForecast.length <= 8) {
                                const x = 60 + (index * (680 / (hourlyForecast.length - 1)))
                                return (
                                  <text key={`time-${index}`} x={x} y={165} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">
                                    {hour.time}
                                  </text>
                                )
                              }
                              return null
                            })}
                            
                            {/* Y-axis labels */}
                            <text x="50" y="25" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">High</text>
                            <text x="50" y="80" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">Mid</text>
                            <text x="50" y="145" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">Low</text>
                          </svg>
                          
                          {/* Interactive Legend Below Chart */}
                          <div className="d-flex justify-content-center gap-4 mt-3">
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: chartVisibility.temperature ? 1 : 0.5 }}
                              onClick={() => toggleChartVisibility('temperature')}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffc107', marginRight: '6px' }}></div>
                              <small className="text-white">Temperature</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: chartVisibility.precipitation ? 1 : 0.5 }}
                              onClick={() => toggleChartVisibility('precipitation')}
                            >
                              <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(54, 162, 235, 0.6)', marginRight: '6px' }}></div>
                              <small className="text-white">Rain %</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: chartVisibility.humidity ? 1 : 0.5 }}
                              onClick={() => toggleChartVisibility('humidity')}
                            >
                              <div style={{ width: '12px', height: '2px', backgroundColor: '#17a2b8', marginRight: '6px', borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
                              <small className="text-white">Humidity</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: chartVisibility.wind ? 1 : 0.5 }}
                              onClick={() => toggleChartVisibility('wind')}
                            >
                              <div style={{ width: '12px', height: '2px', backgroundColor: '#28a745', marginRight: '6px', borderStyle: 'dotted', borderWidth: '1px 0' }}></div>
                              <small className="text-white">Wind</small>
                            </div>
                          </div>
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
                      {/* 7-Day Weather Chart */}
                      <div className="mb-4">
                        <h6 className="text-white mb-3">7-Day Temperature & Rain Forecast</h6>
                        <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <svg width="100%" height="250" viewBox="0 0 800 250" style={{ overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4, 5].map(i => (
                              <line key={`grid-${i}`} x1="80" y1={30 + i * 30} x2="720" y2={30 + i * 30} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            ))}
                            
                            {/* Precipitation bars (background) */}
                            {dailyChartVisibility.precipitation && forecast.map((day, index) => {
                              const x = 80 + (index * (640 / (forecast.length - 1)))
                              const barHeight = (day.pop / 100) * 150
                              return (
                                <rect
                                  key={`precip-${index}`}
                                  x={x - 15}
                                  y={180 - barHeight}
                                  width="30"
                                  height={barHeight}
                                  fill="rgba(54, 162, 235, 0.2)"
                                  stroke="rgba(54, 162, 235, 0.4)"
                                  strokeWidth="1"
                                />
                              )
                            })}
                            
                            {/* Humidity line */}
                            {dailyChartVisibility.humidity && (
                              <polyline
                                points={forecast.map((day, index) => {
                                  const x = 80 + (index * (640 / (forecast.length - 1)))
                                  const y = 180 - ((day.humidity / 100) * 150)
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#17a2b8"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="5,5"
                              />
                            )}
                            
                            {/* Wind speed line */}
                            {dailyChartVisibility.wind && (
                              <polyline
                                points={forecast.map((day, index) => {
                                  const x = 80 + (index * (640 / (forecast.length - 1)))
                                  const maxWind = Math.max(...forecast.map(d => d.wind_speed))
                                  const normalizedWind = maxWind > 0 ? (day.wind_speed / maxWind) : 0
                                  const y = 180 - (normalizedWind * 150)
                                  return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#28a745"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="3,3"
                              />
                            )}
                            
                            {/* Temperature range bars */}
                            {dailyChartVisibility.temperature && forecast.map((day, index) => {
                              const x = 80 + (index * (640 / (forecast.length - 1)))
                              const allMaxTemps = forecast.map(d => convertTemp(d.temp_max))
                              const allMinTemps = forecast.map(d => convertTemp(d.temp_min))
                              const tempRange = Math.max(...allMaxTemps) - Math.min(...allMinTemps)
                              const minOverallTemp = Math.min(...allMinTemps)
                              
                              const maxTempY = 180 - ((convertTemp(day.temp_max) - minOverallTemp) / tempRange * 150)
                              const minTempY = 180 - ((convertTemp(day.temp_min) - minOverallTemp) / tempRange * 150)
                              const barHeight = minTempY - maxTempY
                              
                              return (
                                <g key={`temp-range-${index}`}>
                                  {/* Temperature range bar */}
                                  <rect
                                    x={x - 8}
                                    y={maxTempY}
                                    width="16"
                                    height={barHeight}
                                    fill="rgba(255, 193, 7, 0.3)"
                                    stroke="rgba(255, 193, 7, 0.6)"
                                    strokeWidth="2"
                                    rx="8"
                                  />
                                  
                                  {/* Max temp point */}
                                  <circle cx={x} cy={maxTempY} r="4" fill="#ffc107" stroke="#fff" strokeWidth="2" />
                                  <text x={x} y={maxTempY - 8} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                                    {convertTemp(day.temp_max)}°
                                  </text>
                                  
                                  {/* Min temp point */}
                                  <circle cx={x} cy={minTempY} r="4" fill="#17a2b8" stroke="#fff" strokeWidth="2" />
                                  <text x={x} y={minTempY + 18} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">
                                    {convertTemp(day.temp_min)}°
                                  </text>
                                </g>
                              )
                            })}
                            
                            {/* Humidity points */}
                            {dailyChartVisibility.humidity && forecast.map((day, index) => {
                              const x = 80 + (index * (640 / (forecast.length - 1)))
                              const y = 180 - ((day.humidity / 100) * 150)
                              return (
                                <circle key={`humidity-point-${index}`} cx={x} cy={y} r="3" fill="#17a2b8" stroke="#fff" strokeWidth="1" />
                              )
                            })}
                            
                            {/* Wind points */}
                            {dailyChartVisibility.wind && forecast.map((day, index) => {
                              const x = 80 + (index * (640 / (forecast.length - 1)))
                              const maxWind = Math.max(...forecast.map(d => d.wind_speed))
                              const normalizedWind = maxWind > 0 ? (day.wind_speed / maxWind) : 0
                              const y = 180 - (normalizedWind * 150)
                              return (
                                <circle key={`wind-point-${index}`} cx={x} cy={y} r="3" fill="#28a745" stroke="#fff" strokeWidth="1" />
                              )
                            })}
                            
                            {/* Day labels and weather icons */}
                            {forecast.map((day, index) => {
                              const x = 80 + (index * (640 / (forecast.length - 1)))
                              return (
                                <g key={`day-label-${index}`}>
                                  <text x={x} y={210} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="bold">
                                    {day.date}
                                  </text>
                                  <text x={x} y={225} textAnchor="middle" fontSize="16">
                                    {getWeatherIcon(day.icon)}
                                  </text>
                                </g>
                              )
                            })}
                            
                            {/* Y-axis labels */}
                            <text x="70" y="35" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">High</text>
                            <text x="70" y="105" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">Mid</text>
                            <text x="70" y="175" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="10">Low</text>
                          </svg>
                          
                          {/* Interactive Legend */}
                          <div className="d-flex justify-content-center gap-4 mt-3">
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: dailyChartVisibility.temperature ? 1 : 0.5 }}
                              onClick={() => toggleDailyChartVisibility('temperature')}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffc107', marginRight: '6px' }}></div>
                              <small className="text-white">Temperature</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: dailyChartVisibility.precipitation ? 1 : 0.5 }}
                              onClick={() => toggleDailyChartVisibility('precipitation')}
                            >
                              <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(54, 162, 235, 0.6)', marginRight: '6px' }}></div>
                              <small className="text-white">Rain %</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: dailyChartVisibility.humidity ? 1 : 0.5 }}
                              onClick={() => toggleDailyChartVisibility('humidity')}
                            >
                              <div style={{ width: '12px', height: '2px', backgroundColor: '#17a2b8', marginRight: '6px', borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
                              <small className="text-white">Humidity</small>
                            </div>
                            
                            <div 
                              className="d-flex align-items-center" 
                              style={{ cursor: 'pointer', opacity: dailyChartVisibility.wind ? 1 : 0.5 }}
                              onClick={() => toggleDailyChartVisibility('wind')}
                            >
                              <div style={{ width: '12px', height: '2px', backgroundColor: '#28a745', marginRight: '6px', borderStyle: 'dotted', borderWidth: '1px 0' }}></div>
                              <small className="text-white">Wind</small>
                            </div>
                          </div>
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
                  {activeTab === 'radar' && (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white-50">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                      </div>
                      <h6 className="text-white mb-3">Weather Radar</h6>
                      <p className="text-white-50 mb-4">Interactive radar map shows precipitation, storm movement, and weather patterns</p>
                      <a 
                        href="/radar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-light"
                      >
                        Open Radar Map
                      </a>
                      <p className="small text-white-50 mt-3 mb-0">
                        Updates every 10 minutes
                      </p>
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
