import { NextRequest, NextResponse } from 'next/server'
export const revalidate = 900 // 15 minutes: cache route responses to max 96/day

// OpenWeatherMap API configuration - Using both One Call 3.0 and Free Tier APIs
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const ONECALL_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall'
const FREE_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'

// In-memory cache to ensure stability in development as well
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=900',
}

let cacheCurrent: any | null = null
let cacheCurrentTs = 0
let cacheForecast: any | null = null
let cacheForecastTs = 0
let cacheHourly: any | null = null
let cacheHourlyTs = 0

function isFresh(ts: number) {
  return Date.now() - ts < WEATHER_CACHE_TTL_MS
}

// Redstone Lake coordinates (approximate)
const LAKE_LAT = 45.0
const LAKE_LON = -78.5

interface OneCallResponse {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  current: {
    dt: number
    sunrise: number
    sunset: number
    temp: number
    feels_like: number
    pressure: number
    humidity: number
    dew_point: number
    uvi: number
    clouds: number
    visibility: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
  }
  minutely?: Array<{
    dt: number
    precipitation: number
  }>
  hourly: Array<{
    dt: number
    temp: number
    feels_like: number
    pressure: number
    humidity: number
    dew_point: number
    uvi: number
    clouds: number
    visibility: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    pop: number
    rain?: { '1h': number }
    snow?: { '1h': number }
  }>
  daily: Array<{
    dt: number
    sunrise: number
    sunset: number
    moonrise: number
    moonset: number
    moon_phase: number
    temp: {
      day: number
      min: number
      max: number
      night: number
      eve: number
      morn: number
    }
    feels_like: {
      day: number
      night: number
      eve: number
      morn: number
    }
    pressure: number
    humidity: number
    dew_point: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    clouds: number
    pop: number
    rain?: number
    snow?: number
    uvi: number
  }>
  alerts?: Array<{
    sender_name: string
    event: string
    start: number
    end: number
    description: string
    tags: string[]
  }>
}

interface FreeApiCurrentResponse {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  visibility: number
  name: string
  sys: {
    sunrise: number
    sunset: number
  }
}

interface FreeApiForecastResponse {
  city?: {
    timezone?: number // shift in seconds from UTC
  }
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_max: number
      temp_min: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
    }
    pop: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'current'

    // If no API key is configured, return mock data
    if (!OPENWEATHER_API_KEY) {
      console.log('No OpenWeather API key configured, returning mock data')
      return getMockWeatherData(type)
    }

    console.log('Using OpenWeather API key:', OPENWEATHER_API_KEY ? 'Found' : 'Not found')
    console.log('API Key length:', OPENWEATHER_API_KEY?.length)

    // Serve from in-memory cache first (dev-friendly)
    if (type === 'current' && cacheCurrent && isFresh(cacheCurrentTs)) {
      return NextResponse.json(cacheCurrent, { headers: CACHE_HEADERS })
    }
    if (type === 'forecast' && cacheForecast && isFresh(cacheForecastTs)) {
      return NextResponse.json(cacheForecast, { headers: CACHE_HEADERS })
    }
    if (type === 'hourly' && cacheHourly && isFresh(cacheHourlyTs)) {
      return NextResponse.json(cacheHourly, { headers: CACHE_HEADERS })
    }

    // Try One Call API 3.0 first, fall back to free tier APIs
    try {
      const oneCallResponse = await fetch(
        `${ONECALL_BASE_URL}?lat=${LAKE_LAT}&lon=${LAKE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 900 } }
      )

      if (oneCallResponse.ok) {
        console.log('Using One Call API 3.0 (premium)')
        const data: OneCallResponse = await oneCallResponse.json()
        return handleOneCallResponse(data, type)
      } else {
        const errorData = await oneCallResponse.json().catch(() => ({}))
        console.log('One Call API 3.0 not available:', oneCallResponse.status, errorData.message)
        console.log('Falling back to free tier APIs...')
      }
    } catch (error) {
      console.log('One Call API 3.0 failed, using free tier APIs')
    }

    // Use free tier APIs as fallback
    if (type === 'current') {
      const response = await fetch(
        `${FREE_API_BASE_URL}/weather?lat=${LAKE_LAT}&lon=${LAKE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 900 } }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('Free API error:', response.status, errorData)
        
        if (response.status === 401) {
          console.log('API key may not be activated yet (can take up to 2 hours)')
        }
        
        throw new Error(`OpenWeather API responded with status: ${response.status}`)
      }

      const data: FreeApiCurrentResponse = await response.json()

      const weatherData = {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        clouds: data.clouds.all,
        wind: {
          speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          deg: data.wind.deg
        },
        desc: data.weather[0].description,
        icon: data.weather[0].icon,
        location: data.name || 'Redstone Lake, ON',
        visibility: Math.round(data.visibility / 1000),
        uv_index: 0, // Not available in free tier
        alerts: [] // Not available in free tier
      }

      const payload = { ...weatherData, cachedAt: new Date().toISOString() }
      cacheCurrent = payload
      cacheCurrentTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })

    } else if (type === 'forecast') {
      const response = await fetch(
        `${FREE_API_BASE_URL}/forecast?lat=${LAKE_LAT}&lon=${LAKE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 900 } }
      )

      if (!response.ok) {
        throw new Error(`OpenWeather API responded with status: ${response.status}`)
      }

      const data: FreeApiForecastResponse = await response.json()

      // Use API timezone offset (in seconds) to group by local day
      const tzOffsetSeconds = data.city?.timezone ?? 0

      // Group forecast data by local YYYY-MM-DD
      const dailyBuckets: Record<string, typeof data.list> = {}
      for (const item of data.list) {
        const localTsMs = (item.dt + tzOffsetSeconds) * 1000
        const d = new Date(localTsMs)
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
        if (!dailyBuckets[key]) dailyBuckets[key] = []
        dailyBuckets[key].push(item)
      }

      // Convert to sorted array by date
      const sortedDays = Object.entries(dailyBuckets).sort((a, b) => a[0].localeCompare(b[0]))

      // Filter out clearly incomplete last-day buckets (fewer than 6 of the 8 expected 3h slots)
      const completeDays = sortedDays.filter(([, items], idx) => {
        if (idx === sortedDays.length - 1) {
          return items.length >= 6
        }
        return true
      })

      // Free API only covers ~5 days. Build up to 5 complete days.
      const limitedDays = completeDays.slice(0, 5)

      const forecast = limitedDays.map(([key, items], index) => {
        // Compute max/min temps from available slots for the day
        const tempMax = Math.round(Math.max(...items.map(i => i.main.temp_max)))
        const tempMin = Math.round(Math.min(...items.map(i => i.main.temp_min)))

        // Pick an icon/desc representative near midday if available, otherwise middle item
        const middayIdx = Math.min(4, Math.floor(items.length / 2))
        const rep = items[middayIdx]

        // For Today, only include remaining hours until midnight (end of today)
        // For other days, use the representative midday value
        let popValue: number
        if (index === 0) {
          const now = Date.now() / 1000
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999) // End of today at 11:59:59 PM
          const todayEndUnix = todayEnd.getTime() / 1000
          
          // Only include future items that are still today (before midnight)
          const remainingTodayItems = items.filter(i => i.dt > now && i.dt <= todayEndUnix)
          
          if (remainingTodayItems.length > 0) {
            const maxPop = Math.max(...remainingTodayItems.map(i => i.pop ?? 0))
            popValue = maxPop
            console.log(`Found ${remainingTodayItems.length} remaining today items, max POP: ${Math.round(maxPop * 100)}%`)
          } else {
            popValue = 0 // No remaining hours = 0% chance
            console.log(`No remaining hours in today, setting to 0%`)
          }
        } else {
          popValue = rep.pop ?? 0
        }

        // Debug logging for Today's precipitation data
        if (index === 0) {
          const now = Date.now() / 1000
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)
          const todayEndUnix = todayEnd.getTime() / 1000
          const remainingTodayItems = items.filter(i => i.dt > now && i.dt <= todayEndUnix)
          
          console.log(`\n=== REST OF TODAY DEBUG (${new Date().toLocaleString()}) ===`)
          console.log(`Current time: ${now} (${new Date(now * 1000).toLocaleString()})`)
          console.log(`Today ends at: ${todayEndUnix} (${new Date(todayEndUnix * 1000).toLocaleString()})`)
          console.log(`All today's time slots:`)
          items.forEach(i => {
            const time = new Date(i.dt * 1000)
            const isPast = i.dt <= now
            const isAfterMidnight = i.dt > todayEndUnix
            console.log(`  ${time.toLocaleString()}: ${Math.round((i.pop ?? 0) * 100)}% ${isPast ? '(PAST)' : isAfterMidnight ? '(TOMORROW)' : '(REST OF TODAY)'}`)
          })
          console.log(`Remaining today slots:`)
          remainingTodayItems.forEach(i => {
            console.log(`  ${new Date(i.dt * 1000).toLocaleString()}: ${Math.round((i.pop ?? 0) * 100)}%`)
          })
          console.log(`Maximum remaining today POP: ${Math.round(popValue * 100)}%`)
          console.log(`=== END DEBUG ===\n`)
        }

        // Derive label
        const dateParts = key.split('-') // YYYY-MM-DD
        const labelDate = new Date(Date.UTC(
          Number(dateParts[0]),
          Number(dateParts[1]) - 1,
          Number(dateParts[2])
        ))

        return {
          date: index === 0 ? 'Rest of Today' : index === 1 ? 'Tomorrow' : labelDate.toLocaleDateString('en-US', { weekday: 'short' }),
          temp_max: tempMax,
          temp_min: tempMin,
          desc: rep.weather[0].description,
          icon: rep.weather[0].icon,
          humidity: rep.main.humidity,
          wind_speed: Math.round((rep.wind?.speed ?? 0) * 3.6),
          pop: Math.round(popValue * 100)
        }
      })

      const payload = { forecast, cachedAt: new Date().toISOString() }
      cacheForecast = payload
      cacheForecastTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })

    } else if (type === 'hourly') {
      const response = await fetch(
        `${FREE_API_BASE_URL}/forecast?lat=${LAKE_LAT}&lon=${LAKE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 900 } }
      )

      if (!response.ok) {
        throw new Error(`OpenWeather API responded with status: ${response.status}`)
      }

      const data: FreeApiForecastResponse = await response.json()

      // Get next 24 hours (8 slots of 3-hour intervals = 24 hours)
      const hourlyForecast = data.list.slice(0, 8).map((item, index) => {
        const date = new Date(item.dt * 1000)
        
        // Debug logging for first few hours
        if (index < 3) {
          console.log(`Hourly ${index === 0 ? 'Now' : date.toLocaleTimeString()}: ${Math.round(item.pop * 100)}% chance of rain`)
        }
        
        return {
          time: index === 0 ? 'Now' : date.toLocaleTimeString('en-US', { 
            hour: 'numeric',
            hour12: true 
          }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          pop: Math.round(item.pop * 100)
        }
      })

      const payload = { hourlyForecast, cachedAt: new Date().toISOString() }
      cacheHourly = payload
      cacheHourlyTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })

  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // Return mock data as fallback
    return getMockWeatherData(request.nextUrl.searchParams.get('type') || 'current')
  }
}

function handleOneCallResponse(data: OneCallResponse, type: string) {
  if (type === 'current') {
      const weatherData = {
      temp: Math.round(data.current.temp),
      feels_like: Math.round(data.current.feels_like),
      humidity: data.current.humidity,
      pressure: data.current.pressure,
      clouds: data.current.clouds,
      wind: {
        speed: Math.round(data.current.wind_speed * 3.6), // Convert m/s to km/h
        deg: data.current.wind_deg
      },
      desc: data.current.weather[0].description,
      icon: data.current.weather[0].icon,
      location: 'Redstone Lake, ON',
      visibility: Math.round(data.current.visibility / 1000),
      uv_index: Math.round(data.current.uvi),
      alerts: data.alerts || []
      }

      const payload = { ...weatherData, cachedAt: new Date().toISOString() }
      cacheCurrent = payload
      cacheCurrentTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })

  } else if (type === 'forecast') {
    // Process 7-day forecast from daily data
      const forecast = data.daily.slice(0, 7).map((day, index) => {
        let popValue = day.pop
        
        // For Today, use hourly data to get remaining day's precipitation chance
        if (index === 0 && data.hourly) {
          const now = Date.now() / 1000
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)
          const todayEndUnix = todayEnd.getTime() / 1000
          
          const remainingTodayHours = data.hourly.filter(hour => 
            hour.dt > now && hour.dt <= todayEndUnix
          )
          
          if (remainingTodayHours.length > 0) {
            popValue = Math.max(...remainingTodayHours.map(h => h.pop ?? 0))
            console.log(`One Call: Found ${remainingTodayHours.length} remaining today hours, max POP: ${Math.round(popValue * 100)}%`)
          } else {
            popValue = 0
            console.log(`One Call: No remaining hours in today, setting to 0%`)
          }
        } else {
          console.log(`Using daily POP for day ${index}: ${Math.round(day.pop * 100)}%`)
        }
        
      return {
        date: index === 0 ? 'Rest of Today' : 
              index === 1 ? 'Tomorrow' : 
              new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp_max: Math.round(day.temp.max),
        temp_min: Math.round(day.temp.min),
        desc: day.weather[0].description,
        icon: day.weather[0].icon,
        humidity: day.humidity,
        wind_speed: Math.round(day.wind_speed * 3.6),
        pop: Math.round(popValue * 100)
      }
    })

      const payload = { forecast, cachedAt: new Date().toISOString() }
      cacheForecast = payload
      cacheForecastTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })

  } else if (type === 'hourly') {
    // Get next 24 hours from hourly data
      const hourlyForecast = data.hourly.slice(0, 24).map((hour, index) => {
      const date = new Date(hour.dt * 1000)
      return {
        time: index === 0 ? 'Now' : date.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          hour12: true 
        }),
          temp: Math.round(hour.temp),
          icon: hour.weather[0].icon,
          pop: Math.round((hour.pop ?? 0) * 100),
          wind_speed: Math.round((hour.wind_speed ?? 0) * 3.6),
          wind_deg: hour.wind_deg ?? undefined,
          humidity: hour.humidity ?? undefined,
          uvi: hour.uvi ?? undefined
      }
    })

      const payload = { hourlyForecast, cachedAt: new Date().toISOString() }
      cacheHourly = payload
      cacheHourlyTs = Date.now()
      return NextResponse.json(payload, { headers: CACHE_HEADERS })
  }

  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
}

function getMockWeatherData(type: string) {
  if (type === 'current') {
    return NextResponse.json({
      temp: 22,
      feels_like: 25,
      humidity: 65,
      pressure: 1013,
      clouds: 40,
      wind: {
        speed: 8,
        deg: 180
      },
      desc: 'Partly cloudy',
      icon: '02d',
      location: 'Redstone Lake, ON',
      visibility: 10,
      uv_index: 6,
      alerts: []
    })
  } else if (type === 'forecast') {
    return NextResponse.json({
      forecast: [
        { date: 'Today', temp_max: 24, temp_min: 18, desc: 'Partly cloudy', icon: '02d', humidity: 65, wind_speed: 8, pop: 20 },
        { date: 'Tomorrow', temp_max: 26, temp_min: 19, desc: 'Sunny', icon: '01d', humidity: 58, wind_speed: 12, pop: 0 },
        { date: 'Wed', temp_max: 23, temp_min: 16, desc: 'Light rain', icon: '10d', humidity: 78, wind_speed: 15, pop: 80 },
        { date: 'Thu', temp_max: 25, temp_min: 17, desc: 'Cloudy', icon: '03d', humidity: 62, wind_speed: 10, pop: 30 },
        { date: 'Fri', temp_max: 28, temp_min: 20, desc: 'Sunny', icon: '01d', humidity: 55, wind_speed: 6, pop: 0 },
        { date: 'Sat', temp_max: 27, temp_min: 21, desc: 'Partly cloudy', icon: '02d', humidity: 60, wind_speed: 9, pop: 10 },
        { date: 'Sun', temp_max: 24, temp_min: 18, desc: 'Thunderstorms', icon: '11d', humidity: 82, wind_speed: 18, pop: 90 }
      ]
    })
  } else if (type === 'hourly') {
    return NextResponse.json({
      hourlyForecast: [
        { time: 'Now', temp: 22, icon: '02d', pop: 20 },
        { time: '1 PM', temp: 24, icon: '02d', pop: 15 },
        { time: '2 PM', temp: 25, icon: '01d', pop: 10 },
        { time: '3 PM', temp: 26, icon: '01d', pop: 5 },
        { time: '4 PM', temp: 25, icon: '02d', pop: 10 },
        { time: '5 PM', temp: 23, icon: '02d', pop: 20 },
        { time: '6 PM', temp: 21, icon: '03d', pop: 30 },
        { time: '7 PM', temp: 20, icon: '03d', pop: 25 }
      ]
    })
  }

  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}