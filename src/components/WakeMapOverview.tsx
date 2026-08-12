'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateLakeAreaHectares, formatLakeArea } from '@/lib/lakeArea'
import { LAKE_USE_SUMMARIES } from '@/lib/lakeUseSummaries'

type Position = [number, number]
type Geometry = {
  type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'MultiLineString'
  coordinates: any
}
type Feature = { type: 'Feature'; properties: Record<string, any>; geometry: Geometry }
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }

const LAKES = [
  'Redstone Lake',
  'Little Redstone Lake',
  'Pelaw Lake',
  'Bitter Lake',
  'Burdock Lake',
  'Long (Tedious) Lake',
  'Coleman Lake',
]

const PRACTICAL_WATER_SPORTS_LAKES = new Set(['Redstone Lake'])

const ZONE_COLOURS: Record<string, string> = {
  'water-sports': '#78bfd4',
  'transit': '#b8ddcd',
  'no-sports': '#f3d44a',
  'no-wake': '#e97967',
}

function visitPositions(coordinates: any, callback: (position: Position) => void) {
  if (coordinates && typeof coordinates[0] === 'number') {
    callback(coordinates as Position)
    return
  }
  coordinates?.forEach((item: any) => visitPositions(item, callback))
}

function polygons(geometry: Geometry): Position[][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

function LakeBufferThumbnail({
  lake,
  lakeShapes,
  zoneShapes,
}: {
  lake: string
  lakeShapes: Feature[]
  zoneShapes: Feature[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(260)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new ResizeObserver(entries => {
      setWidth(Math.max(180, Math.floor(entries[0].contentRect.width)))
    })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || lakeShapes.length === 0) return

    const height = Math.max(128, Math.min(170, width * 0.58))
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * pixelRatio
    canvas.height = height * pixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)

    let minLon = Infinity
    let minLat = Infinity
    let maxLon = -Infinity
    let maxLat = -Infinity
    lakeShapes.forEach(feature => {
      visitPositions(feature.geometry.coordinates, ([lon, lat]) => {
        minLon = Math.min(minLon, lon)
        minLat = Math.min(minLat, lat)
        maxLon = Math.max(maxLon, lon)
        maxLat = Math.max(maxLat, lat)
      })
    })

    const middleLat = (minLat + maxLat) / 2
    const metresPerLonDegree = 111_320 * Math.cos((middleLat * Math.PI) / 180)
    const metresPerLatDegree = 111_320
    const margin = 55
    const minX = minLon * metresPerLonDegree - margin
    const maxX = maxLon * metresPerLonDegree + margin
    const minY = minLat * metresPerLatDegree - margin
    const maxY = maxLat * metresPerLatDegree + margin
    const padding = 12
    const scale = Math.min(
      (width - padding * 2) / (maxX - minX),
      (height - padding * 2) / (maxY - minY)
    )
    const offsetX = padding + (width - padding * 2 - (maxX - minX) * scale) / 2
    const offsetY = padding + (height - padding * 2 - (maxY - minY) * scale) / 2

    const project = ([lon, lat]: Position): Position => [
      offsetX + (lon * metresPerLonDegree - minX) * scale,
      height - offsetY - (lat * metresPerLatDegree - minY) * scale,
    ]

    const addPolygonPath = (feature: Feature) => {
      polygons(feature.geometry).forEach(polygon => {
        polygon.forEach(ring => {
          ring.forEach((position, index) => {
            const [x, y] = project(position)
            if (index === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
          })
          context.closePath()
        })
      })
    }

    context.fillStyle = '#edf4ee'
    context.fillRect(0, 0, width, height)

    ;['water-sports', 'transit', 'no-sports', 'no-wake'].forEach(zone => {
      context.beginPath()
      zoneShapes
        .filter(feature =>
          feature.properties.zone === zone &&
          (zone !== 'water-sports' || PRACTICAL_WATER_SPORTS_LAKES.has(lake))
        )
        .forEach(addPolygonPath)
      context.fillStyle = ZONE_COLOURS[zone]
      context.fill('evenodd')
    })

    context.beginPath()
    lakeShapes.forEach(addPolygonPath)
    context.strokeStyle = '#173d50'
    context.lineWidth = 1.35
    context.stroke()
  }, [lake, lakeShapes, width, zoneShapes])

  return (
    <div className="wake-overview-canvas" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${lake} preview showing the same four shoreline-distance zones as the detailed map.`}
      />
    </div>
  )
}

export default function WakeMapOverview() {
  const [zones, setZones] = useState<FeatureCollection | null>(null)
  const [lakeShapes, setLakeShapes] = useState<FeatureCollection | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/map-data/wake-zones.geojson').then(response => response.json()),
      fetch('/map-data/our-lakes.geojson').then(response => response.json()),
    ])
      .then(([zoneData, lakeData]) => {
        setZones(zoneData)
        setLakeShapes(lakeData)
      })
      .catch(() => setLoadError(true))
  }, [])

  const maps = useMemo(() => LAKES.map(lake => ({
    lake,
    lakeShapes: lakeShapes?.features.filter(feature => feature.properties.NAME === lake) ?? [],
    zoneShapes: zones?.features.filter(feature => feature.properties.lake === lake) ?? [],
    useSummary: LAKE_USE_SUMMARIES[lake],
  })).map(map => ({
    ...map,
    area: calculateLakeAreaHectares(map.lakeShapes),
  })), [lakeShapes, zones])

  const selectLake = (lake: string) => {
    window.dispatchEvent(new CustomEvent('wake-map-select', { detail: { lake } }))
    window.setTimeout(() => {
      document.getElementById('selected-lake-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <section className="wake-buffer-overview" id="lake-map-previews" aria-labelledby="wake-buffer-overview-title">
      <div className="container">
        <div className="wake-overview-intro">
          <div>
            <span className="wake-kicker">Seven lakes at a glance</span>
            <h2 id="wake-buffer-overview-title">See your lake’s shoreline zones</h2>
            <p>
              These previews use the same shoreline-distance bands as the full maps below. Select
              your lake for a larger view, distance scale and complete guidance.
            </p>
          </div>
          <div className="wake-overview-legend" aria-label="Shoreline-distance map legend">
            <div>
              <i style={{ background: ZONE_COLOURS['no-wake'] }} />
              <span><b>0–30 m</b><small>Legal speed zone</small></span>
            </div>
            <div>
              <i style={{ background: ZONE_COLOURS['no-sports'] }} />
              <span><b>30–200 m</b><small>Not suitable for water sports</small></span>
            </div>
            <div>
              <i style={{ background: ZONE_COLOURS.transit }} />
              <span><b>200–300 m</b><small>Well-trimmed planing transit</small></span>
            </div>
            <div>
              <i style={{ background: ZONE_COLOURS['water-sports'] }} />
              <span><b>300m+</b><small>Acceptable water-sports zone</small></span>
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="wake-overview-error">The lake previews could not be loaded. Please try again.</div>
        ) : (
          <div className="wake-overview-grid" aria-label="Choose a lake to view its larger shoreline-distance map">
            {maps.map(({ lake, lakeShapes: shapes, zoneShapes, useSummary, area }) => (
              <button
                type="button"
                className="wake-overview-card"
                onClick={() => selectLake(lake)}
                disabled={!zones || !lakeShapes}
                key={lake}
              >
                <span className="wake-overview-card-title">
                  <b>{lake}</b>
                  <small>{formatLakeArea(area)}</small>
                </span>
                <LakeBufferThumbnail lake={lake} lakeShapes={shapes} zoneShapes={zoneShapes} />
                <span className={`wake-overview-card-suitability is-${useSummary.tone}`}>
                  <b>Best suited for</b>
                  <strong>{useSummary.status}</strong>
                  <small>{useSummary.text}</small>
                </span>
                <span className="wake-overview-card-key">Full shoreline zones</span>
                <span className="wake-overview-card-link">View larger map <b aria-hidden="true">→</b></span>
              </button>
            ))}
          </div>
        )}

        <p className="wake-overview-note">
          Quick-reference previews only—not navigation charts. Select any lake to jump to its larger,
          detailed map. Burdock and Coleman are no-motor lakes; local restrictions always take
          precedence over the distance bands shown here.
        </p>
      </div>
    </section>
  )
}
