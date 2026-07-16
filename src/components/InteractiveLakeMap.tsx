'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    mapboxgl: any
  }
}

const PARCEL_SERVICE =
  'https://gis.haliburtoncounty.ca/arcgis/rest/services/Public/SearchLayers_2/MapServer/0/query'
const LIO_TILES =
  'https://ws.lioservices.lrc.gov.on.ca/arcgis1/rest/services/LIO_Cartographic/LIO_Topographic/MapServer/tile/{z}/{y}/{x}'
const PARCEL_MIN_ZOOM = 13

// Lake centroids computed from the County of Haliburton GIS lakes layer;
// ids match the lake-health explorer's lake ids for deep links
const LAKES = [
  { id: 'redstone', name: 'Redstone Lake', coordinates: [-78.5328, 45.17969] },
  { id: 'little-redstone', name: 'Little Redstone Lake', coordinates: [-78.56998, 45.2157] },
  { id: 'bitter', name: 'Bitter Lake', coordinates: [-78.57593, 45.17299] },
  { id: 'burdock', name: 'Burdock Lake', coordinates: [-78.58639, 45.17215] },
  { id: 'coleman', name: 'Coleman Lake', coordinates: [-78.54549, 45.15417] },
  { id: 'tedious', name: 'Long (Tedious) Lake', coordinates: [-78.57552, 45.1639] },
  { id: 'pelaw', name: 'Pelaw Lake', coordinates: [-78.54372, 45.21756] },
]

// Generous area of interest (~60 km around the lakes). Desktop browsers
// without GPS fall back to IP-based positioning that can be a city away
// (a member was placed in Sudbury) — a fix outside this box, or one with
// tens-of-kilometres accuracy, is treated as unusable rather than flown to.
const AOI = { minLat: 44.6, maxLat: 45.75, minLng: -79.45, maxLng: -77.65 }
const inAreaOfInterest = (lat: number, lng: number) =>
  lat >= AOI.minLat && lat <= AOI.maxLat && lng >= AOI.minLng && lng <= AOI.maxLng

// Fits the seven lakes; the ANSI areas sit one pan to the west
const INITIAL_BOUNDS: [[number, number], [number, number]] = [
  [-78.64, 45.13],
  [-78.46, 45.25],
]

// Dashed outline around the association's area
const REGION_BOX = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[
      [-78.625, 45.135],
      [-78.475, 45.135],
      [-78.475, 45.245],
      [-78.625, 45.245],
      [-78.625, 45.135],
    ]],
  },
}

// Sequential depth ramp: shallow light blue → deep navy (stops ascending: deepest first)
const DEPTH_STOPS: (number | string)[] = [
  -80, '#062c4a', -50, '#0c4174', -30, '#1d64a0', -15, '#3a8dc4', -5, '#6cb8e0', 0, '#a5d8f3',
]

// Boat-launch icon: dark-blue boat on a white disc so it reads on any background.
// Mapbox glyph fonts can't render emoji in symbol layers, so this is a real image.
const BOAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
  <circle cx="13" cy="13" r="12" fill="#ffffff" stroke="#0c4a6e" stroke-width="1.5"/>
  <path d="M5.5 15.5h15l-2.6 4H8.1z" fill="#0c4a6e"/>
  <path d="M12 7v7h6.5L12 7z" fill="#0284c7"/>
  <rect x="11.4" y="6.5" width="1.2" height="8" fill="#0c4a6e"/>
</svg>`
const BOAT_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BOAT_SVG)}`

// Dam icon: wall holding back higher water upstream, lower water downstream
const DAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
  <circle cx="13" cy="13" r="12" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
  <rect x="4" y="9.5" width="7.5" height="10" fill="#0284c7"/>
  <rect x="11.5" y="6.5" width="3.5" height="13" fill="#334155"/>
  <rect x="15" y="15" width="7" height="4.5" fill="#0284c7"/>
</svg>`
const DAM_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DAM_SVG)}`

// Spherical polygon area (same math as @mapbox/geojson-area), in m²
function ringArea(coords: number[][]): number {
  const R = 6378137
  let total = 0
  if (coords.length > 2) {
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i]
      const p2 = coords[(i + 1) % coords.length]
      total += ((p2[0] - p1[0]) * Math.PI / 180) *
        (2 + Math.sin((p1[1] * Math.PI) / 180) + Math.sin((p2[1] * Math.PI) / 180))
    }
    total = (total * R * R) / 2
  }
  return Math.abs(total)
}

function geomArea(geom: any): number {
  if (geom.type === 'Polygon') {
    return geom.coordinates.reduce((s: number, ring: number[][], i: number) => s + (i === 0 ? 1 : -1) * ringArea(ring), 0)
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.reduce(
      (s: number, poly: number[][][]) =>
        s + poly.reduce((ps: number, ring: number[][], i: number) => ps + (i === 0 ? 1 : -1) * ringArea(ring), 0),
      0
    )
  }
  return 0
}

interface Layers {
  bathymetry: boolean
  parcels: boolean
  inat: boolean
  wetlands: boolean
  ansi: boolean
  wmu: boolean
  crown: boolean
  trails: boolean
  poi: boolean
  aggregates: boolean
  topo: boolean
}

// Wildlife groups (iNaturalist "iconic taxa"): one colour per group, shared
// by the map dots, the dropdown and the species chart
// One clearly-distinct colour per group; the only green belongs to plants,
// fungi wear toadstool red, and the big groups get maximum separation
const INAT_GROUPS: { key: string; label: string; emoji: string; color: string }[] = [
  { key: 'Plantae', label: 'Plants', emoji: '🌿', color: '#16a34a' },
  { key: 'Insecta', label: 'Insects', emoji: '🦋', color: '#c026d3' },
  { key: 'Fungi', label: 'Fungi', emoji: '🍄', color: '#dc2626' },
  { key: 'Aves', label: 'Birds', emoji: '🐦', color: '#0ea5e9' },
  { key: 'Amphibia', label: 'Amphibians', emoji: '🐸', color: '#0d9488' },
  { key: 'Arachnida', label: 'Spiders', emoji: '🕷️', color: '#1e293b' },
  { key: 'Mammalia', label: 'Mammals', emoji: '🦫', color: '#92400e' },
  { key: 'Reptilia', label: 'Reptiles', emoji: '🐢', color: '#d97706' },
  { key: 'Actinopterygii', label: 'Fish', emoji: '🐟', color: '#1d4ed8' },
  { key: 'Mollusca', label: 'Molluscs', emoji: '🐚', color: '#94a3b8' },
  { key: 'Animalia', label: 'Other animals', emoji: '🐾', color: '#7c3aed' },
]
const groupColor = (iconic: string) => INAT_GROUPS.find(g => g.key === iconic)?.color || '#c026d3'

// Deep links: /lake-map?lat=45.18&lng=-78.53&zoom=13.5 opens on that spot
// (used by the homepage lake pins) and skips the find-me overlay
function deepLinkTarget(): { center: [number, number]; zoom: number } | null {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search)
  const lat = parseFloat(p.get('lat') || '')
  const lng = parseFloat(p.get('lng') || '')
  if (!isFinite(lat) || !isFinite(lng)) return null
  const zoom = parseFloat(p.get('zoom') || '')
  return { center: [lng, lat], zoom: isFinite(zoom) ? zoom : 13.5 }
}

export default function InteractiveLakeMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [layers, setLayers] = useState<Layers>({
    bathymetry: true,
    parcels: true,
    inat: true,
    wetlands: true,
    ansi: true,
    wmu: true,
    crown: true,
    trails: true,
    poi: true,
    aggregates: false,
    topo: false,
  })
  const [zoom, setZoom] = useState(11)
  const [parcelStatus, setParcelStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  // One overlay owns the whole find-me lifecycle: consent prompt → locating
  // spinner → gone on success, or an alert the user dismisses
  type Overlay = 'prompt' | 'locating' | 'outside' | 'denied' | 'unavailable' | null
  const [overlay, setOverlay] = useState<Overlay>(() => (deepLinkTarget() === null ? 'prompt' : null))
  const [outsideKm, setOutsideKm] = useState<number | null>(null)
  // The locating state shows for at least this long so it never flashes
  const locateStartRef = useRef(0)
  const MIN_LOCATING_MS = 3000
  const afterMinLocating = (fn: () => void) => {
    const remaining = Math.max(0, MIN_LOCATING_MS - (Date.now() - locateStartRef.current))
    setTimeout(fn, remaining)
  }
  const [satellite, setSatellite] = useState(false)
  const geolocateRef = useRef<any>(null)
  const applyVisibilityRef = useRef<() => void>(() => {})
  const cancelledRef = useRef(false)
  const boatImgRef = useRef<HTMLImageElement | null>(null)
  const damImgRef = useRef<HTMLImageElement | null>(null)
  // iNaturalist sightings: top species for the chart + observation points
  const [inatSpecies, setInatSpecies] = useState<{ taxonId: number; name: string; common: string | null; count: number; iconic: string }[]>([])
  const [inatTotal, setInatTotal] = useState<number | null>(null)
  const [inatTaxa, setInatTaxa] = useState<number[]>([])
  const [inatMenuOpen, setInatMenuOpen] = useState(false)
  const inatMenuRef = useRef<HTMLDivElement | null>(null)
  const openPopupsRef = useRef<any[]>([])
  // Default view: the critters people come looking for — bears, loons,
  // turtles, frogs and fish. Plants/insects/fungi are a checkbox away.
  const DEFAULT_GROUPS = ['Aves', 'Mammalia', 'Reptilia', 'Amphibia', 'Actinopterygii']
  const [inatGroups, setInatGroups] = useState<string[]>(DEFAULT_GROUPS)
  const [inatSearch, setInatSearch] = useState('')
  const allGroupsChecked = inatGroups.length === INAT_GROUPS.length
  // Species picks (from the chart) and group picks (from the dropdown) are
  // separate filter modes — engaging one clears the other
  const toggleInatTaxon = (id: number) => {
    setInatGroups(INAT_GROUPS.map(g => g.key))
    setInatTaxa(t => (t.includes(id) ? t.filter(x => x !== id) : [...t, id]))
  }
  const toggleInatGroup = (key: string) => {
    setInatTaxa([])
    setInatGroups(g => (g.includes(key) ? g.filter(x => x !== key) : [...g, key]))
  }
  // "Everything" is a master checkbox: checking it remembers your current
  // selection and selects all; unchecking restores what you had before
  // (or clears everything if there is nothing to restore)
  const prevSelectionRef = useRef<{ groups: string[]; taxa: number[] } | null>(null)
  const setEverything = (on: boolean) => {
    if (on) {
      prevSelectionRef.current = { groups: inatGroups, taxa: inatTaxa }
      setInatTaxa([])
      setInatGroups(INAT_GROUPS.map(g => g.key))
    } else {
      const prev = prevSelectionRef.current
      prevSelectionRef.current = null
      const prevWasEverything = prev && prev.taxa.length === 0 && prev.groups.length === INAT_GROUPS.length
      if (prev && !prevWasEverything) {
        setInatGroups(prev.groups)
        setInatTaxa(prev.taxa)
      } else {
        setInatTaxa([])
        setInatGroups([])
      }
    }
  }
  const [inatLoading, setInatLoading] = useState(false)
  const [inatRange, setInatRange] = useState<{ shown: number; total: number; oldest: string; unknown?: boolean } | null>(null)
  const lastBarPctRef = useRef(0)

  // Once the user has located/declined, no automatic camera move may run —
  // a queued jumpTo would cancel their in-flight flyTo (the "inconsistent
  // find-me" bug: any camera command aborts an active animation)
  const userNavigatedRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    function loadScript(src: string): Promise<void> {
      return new Promise(resolve => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        // Resolve on failure too: a missing optional plugin must never block the map
        script.onerror = () => resolve()
        document.head.appendChild(script)
      })
    }
    function loadCss(href: string) {
      const link = document.createElement('link')
      link.href = href
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    async function boot() {
      if (!window.mapboxgl) {
        loadCss('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css')
        await loadScript('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js')
      }
      if (window.mapboxgl && !(window as any).MapboxGeocoder) {
        loadCss('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css')
        await loadScript('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js')
      }
      init()
    }
    boot()

    async function init() {
      if (map.current || cancelledRef.current) return
      try {
        const r = await fetch('/api/mapbox-token')
        const d = await r.json()
        if (!r.ok || !d.token) return
        window.mapboxgl.accessToken = d.token
      } catch {
        return
      }
      if (map.current || cancelledRef.current || !mapContainer.current) return

      // Preload marker icons; if one finishes after the layers are set up,
      // add it to the live map then (Mapbox repaints when an image lands)
      const preloadIcon = (uri: string, name: string, ref: { current: HTMLImageElement | null }) => {
        const img = new Image(26, 26)
        img.onload = () => {
          ref.current = img
          const mm = map.current
          if (mm && mm.isStyleLoaded() && !mm.hasImage(name)) mm.addImage(name, img)
        }
        img.src = uri
      }
      preloadIcon(BOAT_DATA_URI, 'boat-icon', boatImgRef)
      preloadIcon(DAM_DATA_URI, 'dam-icon', damImgRef)

      const target = deepLinkTarget()
      if (target) userNavigatedRef.current = true
      const m = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        ...(target
          ? { center: target.center, zoom: target.zoom }
          : { bounds: INITIAL_BOUNDS, fitBoundsOptions: { padding: 20 } }),
      })
      map.current = m
      // Default view sits half a zoom level wider than the fitted lake bounds —
      // but never override a camera move the user already started
      m.once('load', () => {
        if (!userNavigatedRef.current && !m.isMoving()) m.jumpTo({ zoom: m.getZoom() - 0.5 })
      })
      m.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
      m.addControl(new window.mapboxgl.FullscreenControl(), 'top-right')

      // Follow-me: tracks position live (blue dot + heading) until dismissed
      const geo = new window.mapboxgl.GeolocateControl({
        // Accept a cached fix up to a minute old and don't wait forever — a
        // fast approximate answer beats an inconsistent stall
        positionOptions: { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
        trackUserLocation: true,
        showUserHeading: true,
        fitBoundsOptions: { maxZoom: 16 },
      })
      m.addControl(geo, 'top-right')
      geolocateRef.current = geo
      geo.on('geolocate', (e: any) => {
        const { latitude, longitude } = e?.coords || {}
        if (latitude && !inAreaOfInterest(latitude, longitude)) setOverlay('outside')
      })
      geo.on('error', (err: any) => setOverlay(err?.code === 1 ? 'denied' : 'unavailable'))

      // Address search, biased to the Haliburton area
      const Geocoder = (window as any).MapboxGeocoder
      if (Geocoder) {
        m.addControl(
          new Geocoder({
            accessToken: window.mapboxgl.accessToken,
            mapboxgl: window.mapboxgl,
            placeholder: 'Search any address…',
            countries: 'ca',
            // roughly 50 km around the lakes
            bbox: [-79.18, 44.73, -77.9, 45.63],
            proximity: { longitude: -78.54, latitude: 45.18 },
            marker: { color: '#dc2626' },
            zoom: 15,
          }),
          'top-left'
        )
      }

      // Re-runs on every base-style change (setStyle wipes custom layers)
      const setupLayers = () => {
        if (m.getSource('region')) return
        // Association region outline + our seven lakes highlighted
        m.addSource('region', { type: 'geojson', data: REGION_BOX })
        m.addLayer({
          id: 'region-line',
          type: 'line',
          source: 'region',
          paint: { 'line-color': '#0f4c81', 'line-width': 2, 'line-dasharray': [4, 3], 'line-opacity': 0.8 },
        })
        // Parcels (live from Haliburton County GIS, zoom-gated) — added first so
        // every other overlay renders above them
        m.addSource('parcels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        m.addLayer({
          id: 'parcels-line',
          type: 'line',
          source: 'parcels',
          paint: { 'line-color': '#b45309', 'line-width': 1, 'line-opacity': 0.8 },
        })
        m.addLayer({
          id: 'parcels-fill',
          type: 'fill',
          source: 'parcels',
          paint: { 'fill-color': '#b45309', 'fill-opacity': 0.03 },
        })

        m.addSource('our-lakes', { type: 'geojson', data: '/map-data/our-lakes.geojson' })
        m.addLayer({
          id: 'our-lakes-fill',
          type: 'fill',
          source: 'our-lakes',
          paint: { 'fill-color': '#0ea5e9', 'fill-opacity': 0.25 },
        })
        m.addLayer({
          id: 'our-lakes-line',
          type: 'line',
          source: 'our-lakes',
          paint: { 'line-color': '#0284c7', 'line-width': 1.5 },
        })

        // Provincial topographic raster (off by default)
        m.addSource('lio-topo', { type: 'raster', tiles: [LIO_TILES], tileSize: 256, maxzoom: 19 })
        m.addLayer({
          id: 'lio-topo',
          type: 'raster',
          source: 'lio-topo',
          layout: { visibility: 'none' },
          paint: { 'raster-opacity': 0.7 },
        })

        // Wildlife Management Units (hunting zone boundaries)
        m.addSource('wmu', { type: 'geojson', data: '/map-data/wmu.geojson' })
        m.addLayer({
          id: 'wmu-line',
          type: 'line',
          source: 'wmu',
          paint: { 'line-color': '#7c3aed', 'line-width': 2, 'line-dasharray': [6, 3] },
        })
        m.addLayer({
          id: 'wmu-label',
          type: 'symbol',
          source: 'wmu',
          layout: {
            'text-field': ['concat', 'WMU ', ['get', 'OFFICIAL_NAME']],
            'text-size': 12,
            'symbol-placement': 'line',
            'text-offset': [0, 1],
          },
          paint: { 'text-color': '#7c3aed', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
        })

        // Crown land (unpatented) — public land adjacent to private parcels
        m.addSource('crown-land', { type: 'geojson', data: '/map-data/crown-land.geojson' })
        m.addLayer({
          id: 'crown-fill',
          type: 'fill',
          source: 'crown-land',
          paint: { 'fill-color': '#a16207', 'fill-opacity': 0.14 },
        })
        m.addLayer({
          id: 'crown-line',
          type: 'line',
          source: 'crown-land',
          paint: { 'line-color': '#a16207', 'line-width': 1, 'line-dasharray': [2, 2] },
        })

        // Conservation reserve
        m.addSource('conservation-reserve', { type: 'geojson', data: '/map-data/conservation-reserve.geojson' })
        m.addLayer({
          id: 'cr-fill',
          type: 'fill',
          source: 'conservation-reserve',
          paint: { 'fill-color': '#166534', 'fill-opacity': 0.2 },
        })
        m.addLayer({
          id: 'cr-line',
          type: 'line',
          source: 'conservation-reserve',
          paint: { 'line-color': '#166534', 'line-width': 2 },
        })

        // Aggregate sites (licensed pits & quarries; off by default)
        m.addSource('aggregates', { type: 'geojson', data: '/map-data/aggregates.geojson' })
        m.addLayer({
          id: 'aggregates-fill',
          type: 'fill',
          source: 'aggregates',
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#78716c', 'fill-opacity': 0.35 },
        })
        m.addLayer({
          id: 'aggregates-line',
          type: 'line',
          source: 'aggregates',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#44403c', 'line-width': 1.5 },
        })

        // Trails
        m.addSource('trails', { type: 'geojson', data: '/map-data/trails.geojson' })
        m.addLayer({
          id: 'trails-line',
          type: 'line',
          source: 'trails',
          paint: { 'line-color': '#7f1d1d', 'line-width': 2, 'line-dasharray': [1, 1.5] },
        })

        // Dams + fishing access points
        m.addSource('dams', { type: 'geojson', data: '/map-data/dams.geojson' })
        if (damImgRef.current && !m.hasImage('dam-icon')) m.addImage('dam-icon', damImgRef.current)
        m.addLayer({
          id: 'dams-point',
          type: 'symbol',
          source: 'dams',
          layout: {
            'icon-image': 'dam-icon',
            'icon-size': 1,
            'icon-allow-overlap': true,
          },
        })
        m.addSource('fishing-access', { type: 'geojson', data: '/map-data/fishing-access.geojson' })
        if (boatImgRef.current && !m.hasImage('boat-icon')) m.addImage('boat-icon', boatImgRef.current)
        m.addLayer({
          id: 'fishing-point',
          type: 'symbol',
          source: 'fishing-access',
          layout: {
            'icon-image': 'boat-icon',
            'icon-size': 1,
            'icon-allow-overlap': true,
          },
        })

        // Wetlands (significance-aware)
        m.addSource('wetlands', { type: 'geojson', data: '/map-data/wetlands.geojson' })
        m.addLayer({
          id: 'wetlands-fill',
          type: 'fill',
          source: 'wetlands',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'WETLAND_SIGNIFICANCE'], 'Provincial'],
              '#0f766e',
              '#14b8a6',
            ],
            'fill-opacity': 0.45,
          },
        })
        m.addLayer({
          id: 'wetlands-line',
          type: 'line',
          source: 'wetlands',
          paint: { 'line-color': '#0f766e', 'line-width': 0.8, 'line-opacity': 0.9 },
        })

        // ANSI polygons
        m.addSource('ansi', { type: 'geojson', data: '/map-data/ansi.geojson' })
        m.addLayer({
          id: 'ansi-fill',
          type: 'fill',
          source: 'ansi',
          paint: { 'fill-color': '#84cc16', 'fill-opacity': 0.35 },
        })
        m.addLayer({
          id: 'ansi-line',
          type: 'line',
          source: 'ansi',
          paint: { 'line-color': '#3f6212', 'line-width': 2.5, 'line-dasharray': [3, 2] },
        })
        m.addLayer({
          id: 'ansi-label',
          type: 'symbol',
          source: 'ansi',
          layout: {
            'text-field': ['concat', ['get', 'NAME'], ' ANSI'],
            'text-size': 12,
          },
          paint: { 'text-color': '#3f6212', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 },
        })

        // Bathymetry contours + depth labels
        m.addSource('bathymetry', { type: 'geojson', data: '/map-data/bathymetry.geojson' })
        m.addLayer({
          id: 'bathymetry-line',
          type: 'line',
          source: 'bathymetry',
          paint: {
            'line-color': ['interpolate', ['linear'], ['get', 'DEPTH'], ...DEPTH_STOPS],
            'line-width': 1.2,
          },
        })
        m.addLayer({
          id: 'bathymetry-label',
          type: 'symbol',
          source: 'bathymetry',
          minzoom: 12.5,
          layout: {
            'symbol-placement': 'line',
            'text-field': [
              'concat',
              ['number-format', ['*', -1, ['get', 'DEPTH']], { 'max-fraction-digits': 0 }],
              ' m',
            ],
            'text-size': 10,
            'symbol-spacing': 300,
          },
          paint: {
            'text-color': ['interpolate', ['linear'], ['get', 'DEPTH'], ...DEPTH_STOPS],
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.4,
          },
        })

        // iNaturalist sightings (loaded async into the source)
        m.addSource('inat', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        m.addLayer({
          id: 'inat-point',
          type: 'circle',
          source: 'inat',
          paint: {
            'circle-radius': 5,
            'circle-color': '#c026d3',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
            'circle-opacity': 0.85,
          },
        })

        applyVisibilityRef.current()
        refreshParcels()
        refreshInatRef.current()
      }
      m.on('style.load', setupLayers)

      // Lake markers deep-linking to that lake's charts on the health page
      // (orange: must stand out against blue water; markers survive style changes)
      {
        for (const lake of LAKES) {
          new window.mapboxgl.Marker({ color: '#ea580c', scale: 0.8 })
            .setLngLat(lake.coordinates)
            .setPopup(
              new window.mapboxgl.Popup({ offset: 25, focusAfterOpen: false }).setHTML(
                `<strong>${lake.name}</strong><br/><a href="/lake-health?lake=${lake.id}#explore">View water quality data →</a>`
              )
            )
            .addTo(m)
        }
      }

      // One combined popup per click: stacked features (e.g. a parcel over a
        // wetland over crown land) render as sections in a single box, in
        // priority order, instead of overlapping popups.
        const note = (t: string) => `<div style="font-size:0.7rem;color:#64748b">${t}</div>`
        const RENDERERS: { layer: string; render: (f: any) => string }[] = [
          {
            layer: 'inat-point',
            render: f => {
              const p = f.properties
              // fixed-size image box: the popup must not grow after placement,
              // or Mapbox's auto-anchoring puts it outside the visible map
              const img = p.photo
                ? `<div style="width:180px;height:130px;border-radius:6px;overflow:hidden;margin-top:4px;background:#f1f5f9"><img src="${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"/></div>`
                : ''
              return `<strong>${p.name}</strong>${p.sciName && p.sciName !== p.name ? `<br/><em>${p.sciName}</em>` : ''}${img}<span style="font-size:0.72rem;color:#64748b">${p.date}${p.observer ? ` · by ${p.observer}` : ''}</span><br/><a href="${p.url}" target="_blank" rel="noopener" style="font-size:0.78rem">View on iNaturalist →</a>`
            },
          },
          {
            layer: 'dams-point',
            render: f => `<strong>${f.properties.DAM_NAME || 'Dam'}</strong>${f.properties.DAM_OWNERSHIP ? `<br/>Owner: ${f.properties.DAM_OWNERSHIP}` : ''}`,
          },
          {
            layer: 'fishing-point',
            render: f =>
              `<strong>${f.properties.SITE_NAME || 'Boat launch'}</strong><br/>${f.properties.FISHING_ACCESS_POINT_TYPE || ''}${f.properties.PARKING_PRESENCE_FLG === 'Yes' ? '<br/>Parking available' : ''}`,
          },
          {
            layer: 'trails-line',
            render: f =>
              `<strong>${f.properties.TRAIL_NAME || 'Trail'}</strong><br/>${f.properties.TRAIL_ASSOCIATION || ''}${f.properties.PERMITTED_USES ? `<br/>Permitted: ${f.properties.PERMITTED_USES}` : ''}${f.properties.TRAIL_LENGTH_KM ? `<br/>${f.properties.TRAIL_LENGTH_KM} km` : ''}`,
          },
          {
            layer: 'parcels-fill',
            render: f => {
              const p = f.properties
              const areaM2 = geomArea(f.geometry)
              const acres = areaM2 / 4046.856
              const areaLine = areaM2 > 0 ? `≈ ${acres.toFixed(acres < 10 ? 1 : 0)} acres (${(areaM2 / 10000).toFixed(1)} ha)<br/>` : ''
              return `<strong>${p.ADDRESS || 'Parcel'}</strong><br/>${areaLine}Roll number: ${p.ARN || '—'}<br/>${p.TOWNSHIP || ''}${note('Assessment fabric — boundaries and area are approximate, not a survey')}`
            },
          },
          {
            layer: 'our-lakes-fill',
            render: f =>
              `<strong>${f.properties.NAME}</strong><br/><a href="/lake-health?lake=${f.properties.ID}#explore">View water quality data →</a>`,
          },
          {
            layer: 'wetlands-fill',
            render: f =>
              `<strong>${f.properties.EVALUATED_WETLAND_NAME || 'Wetland'}</strong><br/>Type: ${f.properties.WETLAND_TYPE || '—'}<br/>Significance: ${f.properties.WETLAND_SIGNIFICANCE || 'Not evaluated'}`,
          },
          {
            layer: 'ansi-fill',
            render: f => `<strong>${f.properties.NAME} (ANSI)</strong><br/>${f.properties.TYPE}<br/>Significance: ${f.properties.SIGNIFICANCE}`,
          },
          {
            layer: 'cr-fill',
            render: f =>
              `<strong>${f.properties.PROTECTED_AREA_NAME_ENG || 'Conservation Reserve'}</strong><br/>${f.properties.TYPE_ENG || ''} · ${f.properties.STATUS_ENG || ''}`,
          },
          {
            layer: 'crown-fill',
            render: f => {
              const p = f.properties
              const ha = p.AREA_IN_HA ? `<br/>${Number(p.AREA_IN_HA).toFixed(1)} ha (${(Number(p.AREA_IN_HA) * 2.4711).toFixed(0)} acres)` : ''
              return `<strong>Crown land (unpatented)</strong>${ha}${p.LOCATION_DESCR ? `<br/>${p.LOCATION_DESCR}` : ''}${note('Public land — rules for use vary; verify with MNR')}`
            },
          },
          {
            layer: 'aggregates-fill',
            render: f =>
              `<strong>Licensed aggregate site</strong><br/>${f.properties.CLIENT_NAME || ''}<br/>${f.properties.OPERATION_TYPE || ''} · ${f.properties.CURRENT_STATUS || ''}`,
          },
          {
            layer: 'wmu-line',
            render: f =>
              `<strong>Wildlife Management Unit ${f.properties.OFFICIAL_NAME}</strong><br/>Hunting seasons and limits are set per WMU.<br/><a href="https://www.ontario.ca/document/ontario-hunting-regulations-summary" target="_blank" rel="noopener">Ontario hunting regulations →</a>`,
          },
        ]

        m.on('click', (e: any) => {
          const layerIds = RENDERERS.map(r => r.layer).filter(id => m.getLayer(id))
          const hits = m.queryRenderedFeatures(e.point, { layers: layerIds })
          if (!hits.length) return
          // one section per layer, in priority order, capped to keep the popup readable
          const seen = new Set<string>()
          const sections: string[] = []
          for (const r of RENDERERS) {
            if (seen.has(r.layer)) continue
            const f = hits.find((h: any) => h.layer.id === r.layer)
            if (!f) continue
            seen.add(r.layer)
            sections.push(r.render(f))
            if (sections.length >= 4) break
          }
          const popup = new window.mapboxgl.Popup({ maxWidth: '320px', focusAfterOpen: false })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="max-height:280px;overflow-y:auto;padding-right:4px">${sections.join('<hr style="margin:6px 0;border-color:#e2e8f0"/>')}</div>`)
            .addTo(m)
          openPopupsRef.current.push(popup)
        })

      m.on('moveend', refreshParcels)
      m.on('zoomend', () => setZoom(m.getZoom()))

      async function refreshParcels() {
        if (m.getZoom() < PARCEL_MIN_ZOOM) {
          setParcelStatus('idle')
          return
        }
        setParcelStatus('loading')
        const b = m.getBounds()
        const geometry = JSON.stringify({
          xmin: b.getWest(),
          ymin: b.getSouth(),
          xmax: b.getEast(),
          ymax: b.getNorth(),
          spatialReference: { wkid: 4326 },
        })
        const params = new URLSearchParams({
          f: 'geojson',
          geometry,
          geometryType: 'esriGeometryEnvelope',
          inSR: '4326',
          spatialRel: 'esriSpatialRelIntersects',
          outFields: 'ARN,ADDRESS,TOWNSHIP',
          returnGeometry: 'true',
          outSR: '4326',
        })
        try {
          const r = await fetch(`${PARCEL_SERVICE}?${params}`)
          const data = await r.json()
          if (data?.features && m.getSource('parcels')) {
            m.getSource('parcels').setData(data)
            setParcelStatus('idle')
          } else {
            setParcelStatus('error')
          }
        } catch {
          setParcelStatus('error')
        }
      }
    }

    return () => {
      // Guards the React dev double-mount: a boot still in flight must not
      // create a second map (or leave geolocateRef pointing at a dead control)
      cancelledRef.current = true
      geolocateRef.current = null
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // iNaturalist data: species list once; observations follow the active filter
  const inatGeojsonRef = useRef<any>({ type: 'FeatureCollection', features: [] })
  const inatSpeciesRef = useRef<typeof inatSpecies>([])
  inatSpeciesRef.current = inatSpecies
  const refreshInatRef = useRef<() => void>(() => {})
  refreshInatRef.current = () => {
    const m = map.current
    if (!m || !m.getSource || !m.getSource('inat')) {
      // data can arrive before the style finishes loading — retry until ready
      setTimeout(() => refreshInatRef.current(), 400)
      return
    }
    if (m.getSource('inat')) m.getSource('inat').setData(inatGeojsonRef.current)
    if (m.getLayer('inat-point')) {
      const expr: any[] = ['match', ['get', 'iconic']]
      INAT_GROUPS.forEach(g => expr.push(g.key, g.color))
      expr.push('#c026d3')
      m.setPaintProperty('inat-point', 'circle-color', expr)
    }
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (inatMenuRef.current && !inatMenuRef.current.contains(e.target as Node)) setInatMenuOpen(false)
    }
    // Escape closes anything open on the map: popups, the species dropdown,
    // and any dismissable find-me alert
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      openPopupsRef.current.forEach(p => p.remove())
      openPopupsRef.current = []
      document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove())
      setInatMenuOpen(false)
      setOverlay(o => (o === 'prompt' || o === 'locating' ? o : null))
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    fetch('/api/inaturalist?mode=species')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.species) {
          setInatSpecies(d.species)
          setInatTotal(d.totalSpecies)
          inatSpeciesRef.current = d.species
          refreshInatRef.current()
        }
      })
      .catch(() => {})
  }, [])

  const inatTaxaKey = inatTaxa.slice().sort((a, b) => a - b).join(',')
  const nothingChecked = inatGroups.length === 0 && inatTaxa.length === 0

  // Per-group cache: each group's observations are fetched once (resumable,
  // page by page) and kept for the session. Toggling checkboxes then only
  // recomposes locally — no refetching of everything on every change.
  const groupStoreRef = useRef<Record<string, { features: any[]; total: number | null; nextCursor: string | null; complete: boolean }>>({})

  // Groups needed right now: the checked ones, or (when filtering by species)
  // the groups those species belong to
  const requiredGroups = (inatTaxa.length > 0
    ? Array.from(new Set(inatSpecies.filter(s => inatTaxa.includes(s.taxonId)).map(s => s.iconic)))
    : inatGroups
  ).filter(k => INAT_GROUPS.some(g => g.key === k))
  const requiredKey = requiredGroups.slice().sort().join(',')

  const recomposeInat = () => {
    const store = groupStoreRef.current
    let feats: any[] = []
    for (const k of requiredGroups) feats = feats.concat(store[k]?.features || [])
    if (inatTaxa.length > 0) feats = feats.filter(f => inatTaxa.includes(f.properties.taxonId))
    inatGeojsonRef.current = { type: 'FeatureCollection', features: feats }
    refreshInatRef.current()
    const dates = feats.map(f => f.properties.date).filter(Boolean).sort()
    const total = inatTaxa.length > 0
      ? inatSpecies.filter(s => inatTaxa.includes(s.taxonId)).reduce((sum, s) => sum + s.count, 0)
      : requiredGroups.reduce((sum, k) => sum + (store[k]?.total ?? 0), 0)
    // some required group hasn't reported its total yet → progress % would lie
    const unknown = inatTaxa.length === 0 && requiredGroups.some(k => (store[k]?.total ?? null) === null)
    setInatRange(feats.length || total ? { shown: feats.length, total: Math.max(total, feats.length), oldest: dates[0] || '', unknown } : null)
  }

  useEffect(() => {
    // a new view: close any open popups on the map
    openPopupsRef.current.forEach(p => p.remove())
    openPopupsRef.current = []
    if (nothingChecked) {
      inatGeojsonRef.current = { type: 'FeatureCollection', features: [] }
      refreshInatRef.current()
      setInatRange(null)
      setInatLoading(false)
      return
    }
    let cancelled = false
    recomposeInat() // cached groups appear instantly

    const store = groupStoreRef.current
    const missing = requiredGroups.filter(k => !store[k]?.complete)
    if (missing.length === 0) {
      setInatLoading(false)
      return
    }
    setInatLoading(true)
    ;(async () => {
      for (const key of missing) {
        const entry = (store[key] = store[key] || { features: [], total: null, nextCursor: null, complete: false })
        for (let page = 0; page < 40 && !entry.complete; page++) {
          const params = new URLSearchParams({ mode: 'obs', groups: key })
          if (entry.nextCursor) params.set('cursor', entry.nextCursor)
          let d: any
          try {
            const r = await fetch(`/api/inaturalist?${params}`)
            if (!r.ok) throw new Error(String(r.status))
            d = await r.json()
          } catch {
            break // keep the partial; a later toggle resumes from the cursor
          }
          // discard before touching the shared cache — a cancelled run must
          // not append (strict-mode double effects would duplicate features)
          if (cancelled) return
          if (entry.total === null) entry.total = d.totalResults ?? null
          entry.features.push(...(d.features || []))
          entry.nextCursor = d.nextCursor ? String(d.nextCursor) : null
          if (!d.nextCursor) entry.complete = true
          recomposeInat()
        }
      }
      if (!cancelled) {
        recomposeInat()
        setInatLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredKey, inatTaxaKey, nothingChecked])

  // The wildlife sidebar changes the map column's width — Mapbox only measures
  // its container on init and window resize, so nudge it after the layout settles
  useEffect(() => {
    const t = setTimeout(() => map.current?.resize(), 80)
    return () => clearTimeout(t)
  }, [layers.inat, inatSpecies.length])

  // Base style switch — setStyle wipes custom layers; the style.load handler re-adds them
  useEffect(() => {
    const m = map.current
    if (!m || !m.setStyle) return
    const want = satellite
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/outdoors-v12'
    m.setStyle(want)
  }, [satellite])

  // Toggle layer visibility (kept in a ref so style reloads can re-apply it)
  useEffect(() => {
    const apply = () => {
      const m = map.current
      if (!m || !m.getLayer) return
      const vis = (on: boolean) => (on ? 'visible' : 'none')
      const safe = (id: string, on: boolean) => m.getLayer(id) && m.setLayoutProperty(id, 'visibility', vis(on))
      run(safe)
    }
    applyVisibilityRef.current = apply
    apply()

    function run(safe: (id: string, on: boolean) => void) {
      safe('bathymetry-line', layers.bathymetry)
      safe('bathymetry-label', layers.bathymetry)
      safe('parcels-line', layers.parcels)
      safe('parcels-fill', layers.parcels)
      safe('wetlands-fill', layers.wetlands)
      safe('wetlands-line', layers.wetlands)
      safe('ansi-fill', layers.ansi)
      safe('ansi-line', layers.ansi)
      safe('ansi-label', layers.ansi)
      safe('wmu-line', layers.wmu)
      safe('wmu-label', layers.wmu)
      safe('crown-fill', layers.crown)
      safe('crown-line', layers.crown)
      safe('cr-fill', layers.crown)
      safe('cr-line', layers.crown)
      safe('trails-line', layers.trails)
      safe('dams-point', layers.poi)
      safe('fishing-point', layers.poi)
      safe('aggregates-fill', layers.aggregates)
      safe('aggregates-line', layers.aggregates)
      safe('inat-point', layers.inat)
      safe('lio-topo', layers.topo)
    }
  }, [layers])

  function requestLocation() {
    if (!navigator.geolocation) {
      setOverlay('unavailable')
      return
    }
    setOverlay('locating')
    locateStartRef.current = Date.now()

    // Two independent paths, because each alone has failure modes:
    // 1. A raw position fix drives the camera directly — GeolocateControl's
    //    trigger() is a state TOGGLE and can land in states that don't move
    //    the camera, which caused the inconsistency.
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords
        if (!inAreaOfInterest(latitude, longitude) || accuracy > 30000) {
          const rad = Math.PI / 180
          const km = 6371 * Math.acos(Math.min(1,
            Math.sin(45.18 * rad) * Math.sin(latitude * rad) +
            Math.cos(45.18 * rad) * Math.cos(latitude * rad) * Math.cos((longitude + 78.54) * rad)))
          afterMinLocating(() => {
            setOutsideKm(Math.round(km))
            setOverlay('outside')
          })
          return
        }
        afterMinLocating(() => setOverlay(null))
        userNavigatedRef.current = true
        armFollowMe()
        const lngLat: [number, number] = [longitude, latitude]
        // Camera moves don't need the style — only the map object itself
        let tries = 0
        const fly = () => {
          const m = map.current
          if (m) {
            m.flyTo({ center: lngLat, zoom: 15, essential: true })
          } else if (tries++ < 100) {
            setTimeout(fly, 200)
          } else {
            setOverlay('unavailable')
          }
        }
        fly()
      },
      err => afterMinLocating(() => setOverlay(err.code === 1 ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    )

  }

  // Arm the follow-me control for the live blue dot — but only trigger it
  // when it is OFF, so repeated clicks can't toggle tracking back off.
  function armFollowMe() {
    let tries = 0
    const arm = () => {
      const geo: any = geolocateRef.current
      const m = map.current
      if (geo && m && m.isStyleLoaded()) {
        if (geo._watchState === 'OFF') geo.trigger()
      } else if (tries++ < 60) {
        setTimeout(arm, 300)
      }
    }
    arm()
  }

  function declineLocation() {
    setOverlay(null)
    userNavigatedRef.current = true
    // Bring the default view one zoom level closer for people staying map-wide
    const m = map.current
    if (m) m.easeTo({ zoom: m.getZoom() + 1, essential: true })
  }

  const toggles: { key: keyof Layers; label: string; color: string }[] = [
    { key: 'bathymetry', label: 'Depth contours', color: '#3a8dc4' },
    { key: 'parcels', label: 'Parcels', color: '#b45309' },
    { key: 'crown', label: 'Crown land', color: '#a16207' },
    { key: 'wetlands', label: 'Wetlands', color: '#0f766e' },
    { key: 'ansi', label: 'ANSI', color: '#84cc16' },
    { key: 'trails', label: 'Trails', color: '#7f1d1d' },
    { key: 'poi', label: 'Dams & launches', color: '#334155' },
    { key: 'wmu', label: 'WMUs', color: '#7c3aed' },
    { key: 'aggregates', label: 'Pits & quarries', color: '#78716c' },
    { key: 'topo', label: 'Ontario topo', color: '#64748b' },
  ]

  return (
    <div>
      <div className="map-control-bar d-flex flex-wrap align-items-center gap-2 mb-2">
        {toggles.map(t => (
          <button
            key={t.key}
            type="button"
            className={`layer-chip ${layers[t.key] ? 'active' : ''}`}
            onClick={() => setLayers(l => ({ ...l, [t.key]: !l[t.key] }))}
            aria-pressed={layers[t.key]}
            title={`Toggle ${t.label}`}
          >
            <span className="layer-chip-dot" style={{ background: t.color }} />
            {t.label}
          </button>
        ))}

        {/* Wildlife sightings: dropdown with per-species checkboxes */}
        <div className="position-relative" ref={inatMenuRef}>
          <button
            type="button"
            className={`layer-chip ${layers.inat ? 'active' : ''}`}
            onClick={() => setInatMenuOpen(o => !o)}
            aria-expanded={inatMenuOpen}
          >
            <span className="layer-chip-dot" style={{ background: '#c026d3' }} />
            Wildlife{inatTaxa.length > 0 ? ` (${inatTaxa.length})` : !allGroupsChecked ? ` (${inatGroups.length})` : ''} ▾
          </button>
          {inatMenuOpen && (
            <div
              className="position-absolute bg-white border rounded-3 shadow p-2 mt-1"
              style={{ zIndex: 20, minWidth: '260px', maxHeight: '320px', overflowY: 'auto' }}
            >
              <label className="d-flex align-items-center gap-2 small fw-semibold py-1 border-bottom mb-1" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={layers.inat}
                  onChange={() => setLayers(l => ({ ...l, inat: !l.inat }))}
                />
                Show sightings on the map
              </label>
              <label className="d-flex align-items-center gap-2 small py-1" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allGroupsChecked && inatTaxa.length === 0}
                  onChange={e => setEverything(e.target.checked)}
                />
                <span className="fst-italic">Everything</span>
              </label>
              {INAT_GROUPS.map(g => (
                <label key={g.key} className="d-flex align-items-center gap-2 small py-1" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inatGroups.includes(g.key)}
                    onChange={() => toggleInatGroup(g.key)}
                  />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: g.color, flex: '0 0 auto' }} />
                  <span>{g.emoji} {g.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className={layers.inat && inatSpecies.length > 0 ? 'col-lg-8 col-xl-9' : 'col-12'}>
      <div className="position-relative">
        <div ref={mapContainer} style={{ height: '70vh', minHeight: '420px', borderRadius: '12px', overflow: 'hidden' }} />

        {/* Base-style toggle lives on the map, like every map app */}
        <button
          type="button"
          onClick={() => setSatellite(s => !s)}
          className="position-absolute d-inline-flex align-items-center justify-content-center gap-1 border-0"
          style={{
            left: '10px',
            bottom: '36px',
            zIndex: 4,
            width: '104px',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#0f172a',
            boxShadow: '0 1px 6px rgba(15,23,42,0.3)',
          }}
          title={satellite ? 'Switch to map view' : 'Switch to satellite view'}
        >
          {satellite ? '🗺️ Map' : '🛰️ Satellite'}
        </button>

        {/* Find-me overlay: consent → locating spinner → gone, or an alert */}
        {overlay && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(15,23,42,0.35)', borderRadius: '12px', zIndex: 5 }}
          >
            <div className="card lake-card text-center mx-3" style={{ maxWidth: '380px' }}>
              <div className="card-body">
                {overlay === 'prompt' && (
                  <>
                    <div className="fs-2 mb-1" aria-hidden="true">📍</div>
                    <h5 className="mb-2">Focus in on where you are?</h5>
                    <p className="text-muted small mb-3">
                      We can zoom the map to your location — your browser will ask for permission
                      first. Your location stays on your device; it is never sent to us.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button type="button" className="btn btn-lake-primary btn-sm" onClick={requestLocation}>
                        OK, find me
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={declineLocation}>
                        No thanks
                      </button>
                    </div>
                  </>
                )}
                {overlay === 'locating' && (
                  <>
                    <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2rem', height: '2rem' }}>
                      <span className="visually-hidden">Locating…</span>
                    </div>
                    <h5 className="mb-2">Locating you…</h5>
                    <p className="text-muted small mb-3">
                      Waiting for your device to report a position.
                    </p>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={declineLocation}>
                      Cancel
                    </button>
                  </>
                )}
                {overlay === 'outside' && (
                  <>
                    <div className="fs-2 mb-1" aria-hidden="true">🧭</div>
                    <h5 className="mb-2">We can&rsquo;t seem to find you near our lakes</h5>
                    <p className="text-muted small mb-3">
                      Your device reported a location
                      {outsideKm !== null && outsideKm > 0 ? ` about ${outsideKm} km from the lakes` : ' well outside the area'}
                      {' '}(common on computers without GPS). You can manually type your address in
                      the search box at the top-left of the map to find your location.
                    </p>
                    <button type="button" className="btn btn-lake-primary btn-sm" onClick={declineLocation}>
                      OK
                    </button>
                  </>
                )}
                {overlay === 'denied' && (
                  <>
                    <div className="fs-2 mb-1" aria-hidden="true">📍</div>
                    <h5 className="mb-2">Location permission declined</h5>
                    <p className="text-muted small mb-3">
                      No problem — showing the full lake area. You can also type your address in
                      the search box at the top-left of the map.
                    </p>
                    <button type="button" className="btn btn-lake-primary btn-sm" onClick={declineLocation}>
                      OK
                    </button>
                  </>
                )}
                {overlay === 'unavailable' && (
                  <>
                    <div className="fs-2 mb-1" aria-hidden="true">📍</div>
                    <h5 className="mb-2">We couldn&rsquo;t get your location</h5>
                    <p className="text-muted small mb-3">
                      Showing the full lake area instead. You can also type your address in the
                      search box at the top-left of the map.
                    </p>
                    <button type="button" className="btn btn-lake-primary btn-sm" onClick={declineLocation}>
                      OK
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>

        {layers.inat && inatSpecies.length > 0 && (
          <div className="col-lg-4 col-xl-3">
            <div className="card lake-card h-100" style={{ maxHeight: '70vh', minHeight: '420px' }}>
              <div className="card-body py-3 d-flex flex-column position-relative" style={{ minHeight: 0 }}>
                <h6 className="mb-1">
                  🦉 Wildlife spotted
                  {inatTotal ? <span className="text-muted fw-normal small"> — {inatTotal.toLocaleString()} species</span> : null}
                </h6>
                {/* Status bar: fixed height in all states — no layout shift */}
                <div className="mb-1">
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.68rem', lineHeight: '1.4' }}>
                    <span className="text-muted text-truncate">
                      {nothingChecked
                        ? 'Select a group to show sightings'
                        : inatLoading
                          ? !inatRange
                            ? 'Gathering sightings…'
                            : inatRange.unknown ? 'Checking what’s new…' : 'Loading sightings…'
                          : 'All sightings loaded'}
                    </span>
                    <span className="text-muted flex-shrink-0 ps-2">
                      {inatRange
                        ? inatLoading
                          ? inatRange.unknown
                            ? `${inatRange.shown.toLocaleString()} so far`
                            : `${inatRange.shown.toLocaleString()} of ${inatRange.total.toLocaleString()}`
                          : `${inatRange.shown.toLocaleString()} · 100%`
                        : ' '}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '5px' }}>
                    {inatLoading && (!inatRange || inatRange.unknown) ? (
                      // grey indeterminate: we don't yet know how much is coming
                      <div
                        ref={() => { lastBarPctRef.current = 0 }}
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        style={{ width: '100%', background: 'rgba(108,117,125,0.45)' }}
                      />
                    ) : (
                      (() => {
                        const pct = inatRange
                          ? inatLoading ? Math.max(4, Math.round((inatRange.shown / Math.max(1, inatRange.total)) * 100)) : 100
                          : 0
                        // animate growth only — a shrinking bar snaps instantly
                        const grew = pct >= lastBarPctRef.current
                        lastBarPctRef.current = pct
                        return (
                          <>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${pct}%`,
                                background: inatLoading || !inatRange ? '#c026d3' : '#198754',
                                transition: grew ? 'width 0.3s ease, background 0.4s ease' : 'background 0.4s ease',
                              }}
                            />
                            {inatLoading && inatRange && (
                              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${100 - pct}%`, background: 'rgba(192,38,211,0.3)' }} />
                            )}
                          </>
                        )
                      })()
                    )}
                  </div>
                </div>
                  <div className="row g-0 pb-1 border-bottom mb-2">
                  <div className="col-12">
                    <label className="d-flex align-items-center gap-1 py-1 mb-0" style={{ cursor: 'pointer', fontSize: '0.72rem' }}>
                      <input
                        type="checkbox"
                        checked={allGroupsChecked && inatTaxa.length === 0}
                        onChange={e => setEverything(e.target.checked)}
                      />
                      <span className="fst-italic fw-semibold">Everything</span>
                    </label>
                  </div>
                  {INAT_GROUPS.filter(g => inatSpecies.some(s => s.iconic === g.key)).map(g => (
                    <div key={g.key} className="col-6">
                      <label className="d-flex align-items-center gap-1 py-1 mb-0" style={{ cursor: 'pointer', fontSize: '0.72rem' }}>
                        <input
                          type="checkbox"
                          checked={inatGroups.includes(g.key)}
                          onChange={() => toggleInatGroup(g.key)}
                        />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.color, flex: '0 0 auto' }} />
                        <span className="text-truncate">{g.emoji} {g.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <input
                  type="search"
                  className="form-control form-control-sm mb-2"
                  placeholder={nothingChecked ? 'Select a group to search' : 'Search'}
                  value={inatSearch}
                  onChange={e => setInatSearch(e.target.value)}
                  disabled={nothingChecked}
                  aria-label="Search species"
                />
                <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                  {(() => {
                    const q = inatSearch.trim().toLowerCase()
                    const visible = inatSpecies
                      .filter(s => (allGroupsChecked || inatGroups.includes(s.iconic)))
                      .filter(s => !q || `${s.common || ''} ${s.name}`.toLowerCase().includes(q))
                    const shown = visible.slice(0, 40)
                    if (shown.length === 0) {
                      return <div className="text-muted small py-2">No species match{q ? ` “${inatSearch.trim()}”` : ''}.</div>
                    }
                    const max = Math.max(...shown.map(s => s.count))
                    const meta = visible.length > shown.length
                      ? <div className="text-muted mb-1" style={{ fontSize: '0.65rem' }}>Top {shown.length} of {visible.length} matching species — search to narrow</div>
                      : null
                    return <>{meta}{shown.map(s => {
                      const active = inatTaxa.includes(s.taxonId)
                      return (
                        <button
                          key={s.taxonId}
                          type="button"
                          onClick={() => toggleInatTaxon(s.taxonId)}
                          className="w-100 border-0 bg-transparent p-0 text-start d-flex align-items-center gap-2 mb-1"
                          style={{ cursor: 'pointer' }}
                          aria-pressed={active}
                        >
                          <span className="text-truncate" style={{ width: '108px', flex: '0 0 auto', fontSize: '0.75rem', fontWeight: active ? 700 : 400 }}>
                            {s.common || s.name}
                          </span>
                          <span className="flex-grow-1" style={{ height: '12px', background: 'rgba(15,23,42,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                            <span
                              style={{
                                display: 'block',
                                height: '100%',
                                width: `${Math.max(4, (s.count / max) * 100)}%`,
                                background: groupColor(s.iconic),
                                opacity: active || inatTaxa.length === 0 ? 1 : 0.35,
                                borderRadius: '6px',
                              }}
                            />
                          </span>
                          <span className="text-muted text-end" style={{ width: '28px', flex: '0 0 auto', fontSize: '0.72rem' }}>{s.count}</span>
                        </button>
                      )
                    })}</>
                  })()}
                </div>
                <div className="pt-2 mt-1 border-top d-flex align-items-center justify-content-between gap-2 flex-wrap">
                  {inatTaxa.length > 0 || !allGroupsChecked ? (
                    <button type="button" className="btn btn-sm btn-outline-primary py-0" style={{ fontSize: '0.72rem' }} onClick={() => setEverything(true)}>
                      Show all
                    </button>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      {inatRange ? `${inatRange.shown.toLocaleString()} of ${inatRange.total.toLocaleString()} sightings, back to ${inatRange.oldest}` : ''}
                    </span>
                  )}
                  <a
                    href="https://www.inaturalist.org/observations?nelat=45.245&nelng=-78.475&swlat=45.135&swlng=-78.625"
                    target="_blank" rel="noopener noreferrer" className="text-muted" style={{ fontSize: '0.65rem' }}
                  >
                    iNaturalist →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 mt-2 small text-muted" style={{ minHeight: '20px' }}>
        {layers.parcels && zoom < PARCEL_MIN_ZOOM && <span>Zoom in to see property parcels</span>}
        {parcelStatus === 'loading' && <span>Loading parcels…</span>}
        {parcelStatus === 'error' && <span>Parcel service unavailable right now</span>}
      </div>


      {/* Full legend */}
      <div className="card lake-card mt-2">
        <div className="card-body py-3">
          <h6 className="mb-2">Legend</h6>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2 small text-muted">
            <LegendItem label="Our seven lakes" swatch={<Box bg="rgba(14,165,233,0.35)" border="1.5px solid #0284c7" />} />
            <LegendItem label="Association area" swatch={<Box border="2px dashed #0f4c81" />} />
            <LegendItem
              label="Depth contours (0 → 80 m)"
              swatch={<span style={{ background: 'linear-gradient(to right, #a5d8f3, #3a8dc4, #062c4a)', width: '28px', height: '8px', borderRadius: '4px', display: 'inline-block' }} />}
            />
            <LegendItem label="Lake pin — click for water data" swatch={<PinSwatch color="#ea580c" />} />
            <LegendItem label="Property parcel (approx.)" swatch={<Box border="1.5px solid #b45309" />} />
            <LegendItem label="Crown land (public)" swatch={<Box bg="rgba(161,98,7,0.2)" border="1.5px dashed #a16207" />} />
            <LegendItem label="Conservation reserve" swatch={<Box bg="rgba(22,101,52,0.25)" border="1.5px solid #166534" />} />
            <LegendItem label="Wetland — provincially significant" swatch={<Box bg="rgba(15,118,110,0.55)" />} />
            <LegendItem label="Wetland — other" swatch={<Box bg="rgba(20,184,166,0.45)" />} />
            <LegendItem label="ANSI (pan west of the lakes)" swatch={<Box bg="rgba(132,204,22,0.45)" border="1.5px dashed #3f6212" />} />
            <LegendItem label="Trail" swatch={<Line color="#7f1d1d" dashed />} />
            <LegendItem
              label="Dam"
              // eslint-disable-next-line @next/next/no-img-element
              swatch={<img src={DAM_DATA_URI} alt="" width={18} height={18} />}
            />
            <LegendItem
              label="Boat launch / fishing access"
              // eslint-disable-next-line @next/next/no-img-element
              swatch={<img src={BOAT_DATA_URI} alt="" width={18} height={18} />}
            />
            <LegendItem label="Licensed pit / quarry" swatch={<Box bg="rgba(120,113,108,0.4)" border="1.5px solid #44403c" />} />
            <LegendItem label="Wildlife sighting (iNaturalist)" swatch={<span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#c026d3', border: '1.5px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', display: 'inline-block' }} />} />
            <LegendItem label="Wildlife management unit boundary" swatch={<Line color="#7c3aed" dashed />} />
            <LegendItem
              label="Your location (blue dot follows you)"
              swatch={
                <span
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    background: '#1da1f2',
                    border: '2.5px solid #fff',
                    boxShadow: '0 0 0 5px rgba(29,161,242,0.25)',
                    display: 'inline-block',
                  }}
                />
              }
            />
            <LegendItem label="Searched address" swatch={<PinSwatch color="#dc2626" />} />
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ label, swatch }: { label: string; swatch: React.ReactNode }) {
  return (
    <div className="col d-flex align-items-center gap-2">
      <span className="d-inline-flex align-items-center justify-content-center" style={{ width: '28px', flex: '0 0 auto' }}>
        {swatch}
      </span>
      <span>{label}</span>
    </div>
  )
}

function Box({ bg, border }: { bg?: string; border?: string }) {
  return <span style={{ width: '14px', height: '14px', background: bg || 'transparent', border: border || 'none', display: 'inline-block' }} />
}

function Line({ color, dashed }: { color: string; dashed?: boolean }) {
  return <span style={{ width: '24px', height: 0, borderTop: `2.5px ${dashed ? 'dashed' : 'solid'} ${color}`, display: 'inline-block' }} />
}

// Teardrop shape matching how Mapbox markers actually render
function PinSwatch({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 27 41" aria-hidden="true">
      <path
        d="M13.5 0C6.04 0 0 6.04 0 13.5c0 9.8 12.1 26 13.5 27.5C14.9 39.5 27 23.3 27 13.5 27 6.04 20.96 0 13.5 0z"
        fill={color}
      />
      <circle cx="13.5" cy="13.5" r="5" fill="#fff" fillOpacity="0.85" />
    </svg>
  )
}
