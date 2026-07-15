import { NextResponse } from 'next/server'

// Computed per-request (upstream fetches cache for 30 min) so the OpenAQ key,
// which is absent at Docker build time, is always read from the runtime env
export const dynamic = 'force-dynamic'

const LAT = 45.18
const LNG = -78.54
// Bounding box reaching the MECP Dorset station (~31 km NW) — OpenAQ's radius
// parameter caps at 25 km, so a bbox is the only way to include it
const BBOX = '-79.0,44.85,-78.08,45.51'
const MAX_AGE_HOURS = 6

// US AQI from PM2.5 (EPA 2024 breakpoints)
function aqiFromPm25(pm: number): number {
  const bp: [number, number, number, number][] = [
    [0, 9.0, 0, 50],
    [9.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 125.4, 151, 200],
    [125.5, 225.4, 201, 300],
    [225.5, 500, 301, 500],
  ]
  for (const [cl, ch, il, ih] of bp) {
    if (pm <= ch) return Math.round(il + ((pm - cl) / (ch - cl)) * (ih - il))
  }
  return 500
}

function categorize(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function distanceKm(lat: number, lng: number): number {
  const rad = Math.PI / 180
  return (
    6371 *
    Math.acos(
      Math.min(
        1,
        Math.sin(LAT * rad) * Math.sin(lat * rad) +
          Math.cos(LAT * rad) * Math.cos(lat * rad) * Math.cos((lng - LNG) * rad)
      )
    )
  )
}

// Observed reading from the nearest OpenAQ monitor with fresh PM2.5
async function fromOpenAQ(): Promise<Record<string, unknown> | null> {
  const key = process.env.OPENAQ_API_KEY
  if (!key) return null
  try {
    const headers = { 'X-API-Key': key }
    const r = await fetch(
      `https://api.openaq.org/v3/locations?bbox=${BBOX}&parameters_id=2&limit=10`,
      { headers, next: { revalidate: 1800 } }
    )
    if (!r.ok) return null
    const d = await r.json()
    const locations = (d?.results || []).sort(
      (a: any, b: any) =>
        distanceKm(a.coordinates.latitude, a.coordinates.longitude) -
        distanceKm(b.coordinates.latitude, b.coordinates.longitude)
    )
    for (const loc of locations) {
      const pmSensor = (loc.sensors || []).find((s: any) => s?.parameter?.name === 'pm25')
      if (!pmSensor) continue
      const lr = await fetch(`https://api.openaq.org/v3/locations/${loc.id}/latest`, {
        headers,
        next: { revalidate: 1800 },
      })
      if (!lr.ok) continue
      const latest = await lr.json()
      const reading = (latest?.results || []).find((m: any) => m.sensorsId === pmSensor.id)
      if (!reading || typeof reading.value !== 'number') continue
      const ageHours = (Date.now() - new Date(reading.datetime?.utc).getTime()) / 3.6e6
      if (!isFinite(ageHours) || ageHours > MAX_AGE_HOURS) continue // stale sensor (e.g. old Dorset id stuck in 2023)
      const aqi = aqiFromPm25(reading.value)
      return {
        pm25: reading.value,
        aqi,
        category: categorize(aqi),
        source: 'openaq',
        station: loc.name,
        distanceKm: Math.round(distanceKm(loc.coordinates.latitude, loc.coordinates.longitude)),
        observedAt: reading.datetime?.utc,
        attribution: 'OpenAQ / Ontario MECP monitor',
      }
    }
    return null
  } catch {
    return null
  }
}

interface OpenMeteo {
  current?: { pm2_5?: number; us_aqi?: number }
  hourly?: { time: string[]; us_aqi: number[] }
}

async function fromOpenMeteo(): Promise<OpenMeteo | null> {
  try {
    const r = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LNG}&current=pm2_5,us_aqi&hourly=us_aqi&past_days=30&forecast_days=7&timezone=America%2FToronto`,
      { next: { revalidate: 1800 } }
    )
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

export async function GET() {
  const [observed, model] = await Promise.all([fromOpenAQ(), fromOpenMeteo()])

  // Hourly forecast (always the model — monitors don't forecast): next 24 h,
  // plus daily aggregates (max AQI per local day) for 30 days back / 7 ahead
  let hourly: { time: string[]; aqi: number[] } | null = null
  let daily: { date: string; aqi: number; past: boolean }[] | null = null
  if (model?.hourly?.time?.length) {
    const now = Date.now()
    const idx = model.hourly.time.findIndex(t => new Date(t).getTime() >= now - 30 * 60 * 1000)
    const start = Math.max(0, idx)
    hourly = {
      time: model.hourly.time.slice(start, start + 24),
      aqi: model.hourly.us_aqi.slice(start, start + 24),
    }
    const byDay = new Map<string, number>()
    model.hourly.time.forEach((t, i) => {
      const v = model.hourly!.us_aqi[i]
      if (typeof v !== 'number') return
      const day = t.slice(0, 10)
      byDay.set(day, Math.max(byDay.get(day) ?? 0, v))
    })
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })
    daily = Array.from(byDay.entries()).map(([date, aqi]) => ({ date, aqi, past: date < today }))
  }

  let current: Record<string, unknown> | null = observed
  if (!current && typeof model?.current?.us_aqi === 'number') {
    current = {
      pm25: model.current.pm2_5,
      aqi: model.current.us_aqi,
      category: categorize(model.current.us_aqi),
      source: 'open-meteo',
      station: null,
      attribution: 'Open-Meteo air quality model (CAMS)',
    }
  }
  if (!current) {
    return NextResponse.json({ error: 'Air quality data unavailable' }, { status: 502 })
  }
  return NextResponse.json({ ...current, hourly, daily, cachedAt: new Date().toISOString() })
}
