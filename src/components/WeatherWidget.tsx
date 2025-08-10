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
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock weather data for demonstration
    // In a real app, you'd fetch from a weather API
    const mockWeather: WeatherData = {
      temp: 22,
      humidity: 65,
      clouds: 40,
      wind: {
        speed: 8,
        deg: 180
      },
      desc: 'Partly cloudy'
    }
    
    setTimeout(() => {
      setWeather(mockWeather)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="weather-widget">
        <div className="d-flex align-items-center mb-3">
          <div className="me-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v2m6.364.636l-1.414 1.414M22 12h-2M19.778 17.778l-1.414-1.414M12 20v2m-6.364-.636l1.414-1.414M2 12h2m2.222-5.778l1.414 1.414" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="4" stroke="#f59e0b" strokeWidth="2" fill="#fbbf24"/>
            </svg>
          </div>
          <h5 className="mb-0">Lake Weather</h5>
        </div>
        <div className="row align-items-center">
          <div className="col-7">
            <div className="h2 mb-1">--°C</div>
            <div className="text-muted fw-medium">Loading...</div>
          </div>
          <div className="col-5">
            <div className="small">
              <div className="d-flex justify-content-between mb-1">
                <span>💧</span>
                <span>--%</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
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
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="weather-widget">
      <div className="d-flex align-items-center mb-3">
        <div className="me-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v2m6.364.636l-1.414 1.414M22 12h-2M19.778 17.778l-1.414-1.414M12 20v2m-6.364-.636l1.414-1.414M2 12h2m2.222-5.778l1.414 1.414" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="4" stroke="#f59e0b" strokeWidth="2" fill="#fbbf24"/>
          </svg>
        </div>
        <h5 className="mb-0">Lake Weather</h5>
      </div>
      <div className="row align-items-center">
        <div className="col-7">
          <div className="h2 mb-1">{weather.temp}°C</div>
          <div className="text-muted fw-medium">{weather.desc}</div>
        </div>
        <div className="col-5">
          <div className="small">
            <div className="d-flex justify-content-between mb-1">
              <span>💧</span>
              <span>{weather.humidity}%</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>☁️</span>
              <span>{weather.clouds}%</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>💨</span>
              <span>{weather.wind.speed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 