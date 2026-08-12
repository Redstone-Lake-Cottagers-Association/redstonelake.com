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

export default function WakeZoneMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [lake, setLake] = useState(LAKES[0])
  const [zones, setZones] = useState<FeatureCollection | null>(null)
  const [lakeShapes, setLakeShapes] = useState<FeatureCollection | null>(null)
  const [width, setWidth] = useState(760)
  const [scaleWidth, setScaleWidth] = useState(100)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const handleLakeSelect = (event: Event) => {
      const selectedLake = (event as CustomEvent<{ lake?: string }>).detail?.lake
      if (selectedLake && LAKES.includes(selectedLake)) setLake(selectedLake)
    }
    window.addEventListener('wake-map-select', handleLakeSelect)
    return () => window.removeEventListener('wake-map-select', handleLakeSelect)
  }, [])

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

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const observer = new ResizeObserver(entries => {
      const nextWidth = Math.max(280, Math.floor(entries[0].contentRect.width))
      setWidth(nextWidth)
    })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  const selectedShapes = useMemo(
    () => lakeShapes?.features.filter(feature => feature.properties.NAME === lake) ?? [],
    [lake, lakeShapes]
  )
  const selectedArea = useMemo(() => calculateLakeAreaHectares(selectedShapes), [selectedShapes])
  const useSummary = LAKE_USE_SUMMARIES[lake]
  const hasWaterSportsArea = PRACTICAL_WATER_SPORTS_LAKES.has(lake) && (zones?.features.some(
    feature => feature.properties.lake === lake && feature.properties.zone === 'water-sports'
  ) ?? false)
  const hasOnlyTinyWaterSportsArea = lake === 'Little Redstone Lake'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !zones || selectedShapes.length === 0) return

    const height = width < 560 ? 440 : 560
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
    selectedShapes.forEach(feature => {
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
    const zoneExtent = 300
    const minX = minLon * metresPerLonDegree - zoneExtent
    const maxX = maxLon * metresPerLonDegree + zoneExtent
    const minY = minLat * metresPerLatDegree - zoneExtent
    const maxY = maxLat * metresPerLatDegree + zoneExtent
    const padding = width < 560 ? 22 : 38
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2
    const naturalScale = Math.min(availableWidth / (maxX - minX), availableHeight / (maxY - minY))
    const scale = Math.min(naturalScale, (width * 0.52) / 1000)
    setScaleWidth(1000 * scale)
    const offsetX = padding + (availableWidth - (maxX - minX) * scale) / 2
    const offsetY = padding + (availableHeight - (maxY - minY) * scale) / 2

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

    context.fillStyle = '#edf3ee'
    context.fillRect(0, 0, width, height)

    ;['water-sports', 'transit', 'no-sports', 'no-wake'].forEach(zone => {
      context.beginPath()
      zones.features
        .filter(feature =>
          feature.properties.lake === lake &&
          feature.properties.zone === zone &&
          (zone !== 'water-sports' || PRACTICAL_WATER_SPORTS_LAKES.has(lake))
        )
        .forEach(addPolygonPath)
      context.fillStyle = ZONE_COLOURS[zone]
      context.fill('evenodd')
    })

    context.beginPath()
    selectedShapes.forEach(addPolygonPath)
    context.strokeStyle = '#173d50'
    context.lineWidth = 1.5
    context.stroke()

    context.font = '700 12px Inter, sans-serif'
    context.fillText('N', width - 29, 25)
    context.beginPath()
    context.moveTo(width - 25, 33)
    context.lineTo(width - 25, 48)
    context.moveTo(width - 29, 38)
    context.lineTo(width - 25, 33)
    context.lineTo(width - 21, 38)
    context.stroke()
  }, [lake, selectedShapes, width, zones])

  return (
    <div className="wake-map-panel" id="selected-lake-map">
      <div className="wake-lake-picker" role="group" aria-label="Choose a lake map">
        {LAKES.map(name => (
          <button
            type="button"
            className={name === lake ? 'is-active' : ''}
            aria-pressed={name === lake}
            onClick={() => setLake(name)}
            key={name}
          >
            {name.replace(' Lake', '')}
          </button>
        ))}
      </div>

      <div className="wake-map-heading">
        <div>
          <span className="wake-kicker">Shoreline-distance map</span>
          <h3>{lake}</h3>
        </div>
        <div className={`wake-map-profile is-${useSummary.tone}`}>
          <span>Best suited for</span>
          <strong>{useSummary.status}</strong>
          <p>{useSummary.text}</p>
          <small>Mapped surface area <b>{formatLakeArea(selectedArea)}</b></small>
        </div>
      </div>

      <div className={`wake-water-sports-status ${!zones ? 'is-loading' : hasWaterSportsArea ? 'has-area' : 'no-area'}`} role="status">
        {!zones ? (
          <><strong>Acceptable water-sports zone</strong><span>Checking this lake’s mapped shoreline separation.</span></>
        ) : hasWaterSportsArea ? (
          <><strong>Use the mapped 300m+ water-sports zone</strong><span>Keep water sports inside the blue area and continue monitoring the wake, traffic and depth.</span></>
        ) : hasOnlyTinyWaterSportsArea ? (
          <><strong>No practical acceptable water-sports zone</strong><span>A tiny pocket reaches 300 metres from shore, but it is too limited to present as an activity area.</span></>
        ) : (
          <><strong>No acceptable water-sports zone</strong><span>This lake does not provide 300 metres of separation from every shoreline.</span></>
        )}
      </div>

      <div className="wake-map-wrap" ref={wrapRef}>
        {loadError ? (
          <div className="wake-map-error">The map data could not be loaded. Please try again.</div>
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`${lake} map showing the 0 to 30 metre legal speed zone in red, 30 to 200 metres as not suitable for water sports in yellow, 200 to 300 metres as a green well-trimmed planing transit zone, and the acceptable water-sports zone beyond 300 metres in blue where the lake is wide enough.`}
          />
        )}
      </div>

      <div className="wake-map-distance-strip" aria-label="Map distance scale from zero to one kilometre">
        <strong>Distance</strong>
        <div className="wake-distance-ruler" style={{ width: scaleWidth }}>
          <div className="wake-distance-bar"><i /><em /></div>
          <div className="wake-distance-labels"><span>0</span><span>500 m</span><span>1 km</span></div>
        </div>
      </div>

      <div className="wake-map-legend" aria-label="Map legend">
        <span><i className="zone-swatch" style={{ background: ZONE_COLOURS['no-wake'] }} /> <strong>0–30 m</strong> · legal speed zone</span>
        <span><i className="zone-swatch" style={{ background: ZONE_COLOURS['no-sports'] }} /> <strong>30–200 m</strong> · not suitable for water sports</span>
        <span><i className="zone-swatch" style={{ background: ZONE_COLOURS.transit }} /> <strong>200–300 m</strong> · well-trimmed planing transit</span>
        <span><i className="zone-swatch" style={{ background: ZONE_COLOURS['water-sports'] }} /> <strong>300m+</strong> · acceptable water-sports zone</span>
      </div>
    </div>
  )
}
