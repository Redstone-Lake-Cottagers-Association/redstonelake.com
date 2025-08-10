'use client'

import { useState, useEffect } from 'react'

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
}

interface ForecastDay {
  date: string
  temp_max: number
  temp_min: number
  desc: string
  icon: string
  humidity: number
}

interface WeatherWidgetProps {
  onExpand?: () => void
  showForecast?: boolean
}

export default function EnhancedWeatherWidget({ onExpand, showForecast = true }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')

  useEffect(() => {
    fetchWeatherData()
  }, [])

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

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch current weather and forecast data
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch('/api/weather?type=current'),
        fetch('/api/weather?type=forecast')
      ])

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const currentData = await currentResponse.json()
      const forecastData = await forecastResponse.json()

      setWeather(currentData)
      setForecast(forecastData.forecast || [])

    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError('Using demo data - API key may still be activating (can take up to 2 hours)')
      
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
        location: 'Redstone Lake, ON'
      }

      const mockForecast: ForecastDay[] = [
        { date: 'Today', temp_max: 24, temp_min: 18, desc: 'Partly cloudy', icon: '02d', humidity: 65 },
        { date: 'Tomorrow', temp_max: 26, temp_min: 19, desc: 'Sunny', icon: '01d', humidity: 58 },
        { date: 'Wed', temp_max: 23, temp_min: 16, desc: 'Light rain', icon: '10d', humidity: 78 },
        { date: 'Thu', temp_max: 25, temp_min: 17, desc: 'Cloudy', icon: '03d', humidity: 62 },
        { date: 'Fri', temp_max: 28, temp_min: 20, desc: 'Sunny', icon: '01d', humidity: 55 },
        { date: 'Sat', temp_max: 27, temp_min: 21, desc: 'Partly cloudy', icon: '02d', humidity: 60 },
        { date: 'Sun', temp_max: 24, temp_min: 18, desc: 'Thunderstorms', icon: '11d', humidity: 82 }
      ]

      setWeather(mockWeather)
      setForecast(mockForecast)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    // Simple weather icons based on OpenWeatherMap icon codes
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

  // Click handling is delegated to the parent wrapper so the entire card is clickable

  const renderHeader = () => (
    <div className="d-flex align-items-center justify-content-between mb-3 weather-header" style={{minHeight: '28px'}}>
      <div className="d-flex align-items-center">
        <div className="me-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v2m6.364.636l-1.414 1.414M22 12h-2M19.778 17.778l-1.414-1.414M12 20v2m-6.364-.636l1.414-1.414M2 12h2m2.222-5.778l1.414 1.414" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="4" stroke="#f59e0b" strokeWidth="2" fill="#fbbf24"/>
          </svg>
        </div>
        <h5 className="mb-0">Lake Weather</h5>
      </div>
      <button
        type="button"
        className="btn btn-link p-0 small weather-cta-link"
        onClick={onExpand}
        aria-label="Open full forecast"
      >
        Full forecast ›
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="weather-widget weather-compact">
        <div className="weather-current-section position-relative">
          {renderHeader()}
          <div className="row align-items-center">
            <div className="col-7">
              <div className="position-relative" style={{ marginTop: '16px' }}>
                <div className="h2 mb-1" style={{ display: 'inline-block', minWidth: '80px', textAlign: 'left' }}>--°{tempUnit}</div>
                {/* Temperature Unit Toggle - Superscript style placeholder */}
                <div 
                  className="btn-group btn-group-sm" 
                  role="group"
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '0px',
                    fontSize: '6px'
                  }}
                >
                  <button 
                    type="button" 
                    className="btn"
                    style={{ 
                      borderRadius: '0', 
                      fontSize: '6px', 
                      padding: '0px 2px',
                      lineHeight: '1',
                      minWidth: '10px',
                      height: '12px',
                      transition: 'none',
                      transform: 'none',
                      border: tempUnit === 'C' ? '1px solid #6c757d' : '1px solid transparent',
                      backgroundColor: 'transparent',
                      color: tempUnit === 'C' ? '#000' : '#6c757d'
                    }}
                  >
                    C
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                    style={{ 
                      borderRadius: '0', 
                      fontSize: '6px', 
                      padding: '0px 2px',
                      lineHeight: '1',
                      minWidth: '10px',
                      height: '12px',
                      transition: 'none',
                      transform: 'none',
                      border: tempUnit === 'F' ? '1px solid #6c757d' : '1px solid transparent',
                      backgroundColor: 'transparent',
                      color: tempUnit === 'F' ? '#000' : '#6c757d',
                      borderLeft: '1px solid #6c757d'
                    }}
                  >
                    F
                  </button>
                </div>
              </div>
              <div className="text-muted fw-medium" style={{ marginTop: '4px' }}>Loading...</div>
            </div>
            <div className="col-5">
              <div className="small">
                <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                  <span>☔️</span>
                  <span>--%</span>
                </div>
                <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                  <span>💧</span>
                  <span>--%</span>
                </div>
                <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                  <span>☁️</span>
                  <span>--%</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>💨</span>
                  <span>-- km/h</span>
                </div>
              </div>
            </div>
          </div>
          {showForecast && (
            <div className="weather-forecast-section mt-3" aria-hidden="true">
              <div className="row g-0" style={{ height: '30px' }}>
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="col text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '30px' }}>
                    <div className="icon-box skeleton" />
                    <div className="temps-box skeleton mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="weather-widget weather-compact">
        <div className="weather-current-section position-relative">
          {renderHeader()}
          <div className="text-muted">Unable to load weather data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="weather-widget weather-compact">
      {/* Current Weather */}
      <div className="weather-current-section position-relative">
        {renderHeader()}
        
        <div className="row align-items-center">
          <div className="col-7">
            <div className="d-flex align-items-center mb-1" style={{ marginTop: '16px' }}>
              <div className="position-relative">
                <span className="h2 mb-0 me-2" style={{ display: 'inline-block', minWidth: '80px', textAlign: 'left' }}>{convertTemp(weather.temp)}°{tempUnit}</span>
                {/* Temperature Unit Toggle - Superscript style */}
                <div 
                  className="btn-group btn-group-sm" 
                  role="group"
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '0px',
                    fontSize: '6px'
                  }}
                >
                  <button 
                    type="button" 
                    className={`btn ${tempUnit === 'C' ? 'btn-warning' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTempUnitChange('C')
                    }}
                    style={{ 
                      borderRadius: '0', 
                      fontSize: '6px', 
                      padding: '0px 2px',
                      lineHeight: '1',
                      minWidth: '10px',
                      height: '12px',
                      transition: 'none',
                      transform: 'none',
                      border: tempUnit === 'C' ? '1px solid #6c757d' : '1px solid transparent',
                      backgroundColor: 'transparent',
                      color: tempUnit === 'C' ? '#000' : '#6c757d'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'none'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    C
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${tempUnit === 'F' ? 'btn-warning' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTempUnitChange('F')
                    }}
                    style={{ 
                      borderRadius: '0', 
                      fontSize: '6px', 
                      padding: '0px 2px',
                      lineHeight: '1',
                      minWidth: '10px',
                      height: '12px',
                      transition: 'none',
                      transform: 'none',
                      border: tempUnit === 'F' ? '1px solid #6c757d' : '1px solid transparent',
                      backgroundColor: 'transparent',
                      color: tempUnit === 'F' ? '#000' : '#6c757d',
                      borderLeft: '1px solid #6c757d'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'none'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    F
                  </button>
                </div>
              </div>
              <span className="fs-3">{getWeatherIcon(weather.icon)}</span>
            </div>
            <div className="text-muted fw-medium" style={{ marginTop: '4px' }}>{weather.desc}</div>
          </div>
          <div className="col-5">
            <div className="small">
              <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                <span>☔️</span>
                <span className="fw-medium">{weather.pop !== undefined ? `${weather.pop}%` : '0%'}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                <span>💧</span>
                <span className="fw-medium">{weather.humidity}%</span>
              </div>
              <div className="d-flex justify-content-between" style={{ marginBottom: '2px' }}>
                <span>☁️</span>
                <span className="fw-medium">{weather.clouds}%</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>💨</span>
                <span className="fw-medium">{weather.wind.speed} km/h</span>
              </div>
            </div>
          </div>
        </div>



        {error && (
          <div className="mt-2">
            <small className="text-warning">⚠️ {error}</small>
          </div>
        )}
      </div>

      {/* 7-Day Forecast - Minimal */}
      {showForecast && (
        <div className="weather-forecast-section mt-3">
          <div className="row g-0" style={{ height: '30px' }}>
            {forecast.slice(0, 7).map((day, index) => (
              <div key={index} className="col text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '30px' }}>
                <div className="icon-box">
                  <span className="icon-emoji">{getWeatherIcon(day.icon)}</span>
                </div>
                <div className="temps-box text-muted mt-1">
                  <span className="fw-bold">{convertTemp(day.temp_max)}°</span>
                  <span className="opacity-75">|{convertTemp(day.temp_min)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .weather-current-section {
          transition: all 0.2s ease;
          border-radius: 8px;
          padding: 4px;
          margin: -4px;
        }
        /* Ensure identical footprint for forecast icons/temps in all states */
        .icon-box {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          line-height: 1;
        }
        .icon-emoji { display: inline-block; width: 1em; text-align: center; }
        .temps-box {
          width: 42px;
          height: 10px;
          font-size: 9px;
          line-height: 1;
        }
        .skeleton {
          background: rgba(0,0,0,0.12);
          border-radius: 4px;
        }
        .weather-header .weather-cta-link { text-decoration: underline; }
        
        /* Remove inner lift; hover handled at container level */
        .weather-current-section:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: none;
        }
        
        /* Force no transforms on all buttons */
        .btn {
          transform: none !important;
          transition: none !important;
        }
        .btn:hover {
          transform: none !important;
        }
        .btn:focus {
          transform: none !important;
        }
        .btn:active {
          transform: none !important;
        }

        /* Reserve room for overlay chevron so borders don’t clip */
        :global(.weather-widget .chevron-overlay) {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          color: rgba(15, 23, 42, 0.55);
          font-size: 18px;
          line-height: 1;
          pointer-events: none;
          z-index: 2;
        }
        
        .weather-forecast-section .col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .weather-forecast-section .col:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
}
