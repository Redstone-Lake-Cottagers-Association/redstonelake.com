import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Health checks for every external dependency documented in docs/DATA-SOURCES.txt.
// Server-side so browser CORS never skews the results.

interface Check {
  id: string
  name: string
  source: string
  url: string
  // validate gets (status, contentType, bodyText) and must throw on failure
  validate?: (status: number, contentType: string, body: string) => void
}

const CHECKS: Check[] = [
  {
    id: 'water-levels',
    name: 'Water levels (Parks Canada, station 17)',
    source: 'Parks Canada Trent–Severn Waterway',
    url: 'https://www.pc.gc.ca/apps/waterlevels/api/Charts/GetWaterLevelData/17?lang=EN',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!d?.current?.length) throw new Error('no current data points')
    },
  },
  {
    id: 'dysart',
    name: 'Fire-ban source (Dysart et al website)',
    source: 'Municipality of Dysart et al',
    url: 'https://www.dysartetal.ca/',
    validate: s => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
    },
  },
  {
    id: 'newsletters',
    name: 'Newsletter feed (Mailchimp RSS)',
    source: 'Mailchimp campaign archive',
    url: 'https://us14.campaign-archive.com/feed?u=abfff5b565ccb6c32026c05ab&id=754031d995',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      if (!b.includes('<item>')) throw new Error('feed has no items')
    },
  },
  {
    id: 'county-parcels',
    name: 'Property parcels (County of Haliburton GIS)',
    source: 'gis.haliburtoncounty.ca · SearchLayers_2/0',
    url: 'https://gis.haliburtoncounty.ca/arcgis/rest/services/Public/SearchLayers_2/MapServer/0/query?f=json&where=1%3D1&returnCountOnly=true',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (typeof d.count !== 'number' || d.count < 1) throw new Error('no parcel count returned')
    },
  },
  {
    id: 'county-lakes',
    name: 'Lake polygons source (County GIS lakes layer)',
    source: 'gis.haliburtoncounty.ca · IdentifyLayers/13',
    url: "https://gis.haliburtoncounty.ca/arcgis/rest/services/Public/IdentifyLayers/MapServer/13/query?f=json&where=OFF_NAME%3D'Redstone%20Lake'&returnCountOnly=true",
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!d.count) throw new Error('Redstone Lake not found')
    },
  },
  {
    id: 'lio-tiles',
    name: 'Ontario topographic tiles (LIO)',
    source: 'ws.lioservices.lrc.gov.on.ca · LIO_Cartographic',
    url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis1/rest/services/LIO_Cartographic/LIO_Topographic/MapServer/tile/12/1481/1143',
    validate: (s, c) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      if (!c.includes('image')) throw new Error(`not an image: ${c}`)
    },
  },
  {
    id: 'lio-wetlands',
    name: 'Wetlands layer (LIO open data)',
    source: 'LIO_OPEN_DATA/LIO_Open01/15',
    url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open01/MapServer/15?f=json',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!/wetland/i.test(d.name || '')) throw new Error(`layer renamed: ${d.name} (ids may have shifted)`)
    },
  },
  {
    id: 'lio-wmu',
    name: 'Wildlife Management Units layer (LIO open data)',
    source: 'LIO_OPEN_DATA/LIO_Open05/5',
    url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open05/MapServer/5?f=json',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!/wildlife/i.test(d.name || '')) throw new Error(`layer renamed: ${d.name} (ids may have shifted)`)
    },
  },
  {
    id: 'lio-dams',
    name: 'Dam inventory layer (LIO open data)',
    source: 'LIO_OPEN_DATA/LIO_Open04/0',
    url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open04/MapServer/0?f=json',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!/dam/i.test(d.name || '')) throw new Error(`layer renamed: ${d.name} (ids may have shifted)`)
    },
  },
  {
    id: 'ontario-lpp',
    name: 'Lake Partner dataset page (annual refresh source)',
    source: 'data.ontario.ca',
    url: 'https://data.ontario.ca/dataset/ontario-lake-partner',
    validate: s => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
    },
  },
  {
    id: 'air-quality',
    name: 'Air quality (Open-Meteo CAMS model)',
    source: 'air-quality-api.open-meteo.com',
    url: 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=45.18&longitude=-78.54&current=us_aqi',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (typeof d?.current?.us_aqi !== 'number') throw new Error('no AQI in response')
    },
  },
  {
    id: 'inaturalist',
    name: 'Wildlife sightings (iNaturalist API)',
    source: 'api.inaturalist.org',
    url: 'https://api.inaturalist.org/v1/observations/species_counts?nelat=45.245&nelng=-78.475&swlat=45.135&swlng=-78.625&verifiable=true&per_page=1',
    validate: (s, _c, b) => {
      if (s !== 200) throw new Error(`HTTP ${s}`)
      const d = JSON.parse(b)
      if (!d?.total_results) throw new Error('no species counts returned')
    },
  },
  {
    id: 'mapbox',
    name: 'Mapbox (style API + token)',
    source: 'api.mapbox.com',
    url: 'TOKEN', // resolved below
  },
]

async function runCheck(check: Check): Promise<Record<string, unknown>> {
  const started = Date.now()
  let url = check.url
  if (check.id === 'mapbox') {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) {
      return { ...meta(check), ok: false, ms: 0, detail: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set' }
    }
    url = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12?access_token=${token}`
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    const r = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    clearTimeout(timer)
    const body = await r.text()
    if (check.validate) {
      check.validate(r.status, r.headers.get('content-type') || '', body)
    } else if (r.status !== 200) {
      throw new Error(`HTTP ${r.status}`)
    }
    return { ...meta(check), ok: true, ms: Date.now() - started, detail: `HTTP ${r.status}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? (err.name === 'AbortError' ? 'timeout (15s)' : err.message) : String(err)
    return { ...meta(check), ok: false, ms: Date.now() - started, detail: msg }
  }
}

function meta(check: Check) {
  return { id: check.id, name: check.name, source: check.source }
}

export async function GET() {
  const results = await Promise.all(CHECKS.map(runCheck))
  // Internal APIs and static extracts are covered client-side on /debug/health
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    ok: results.every(r => r.ok),
    results,
  })
}
