type LakeFeature = {
  geometry?: {
    type?: string
    coordinates?: any
  }
}

type Position = [number, number]
type Ring = Position[]
type PolygonCoordinates = Ring[]

function visitPositions(coordinates: any, callback: (position: Position) => void) {
  if (coordinates && typeof coordinates[0] === 'number') {
    callback(coordinates as Position)
    return
  }
  coordinates?.forEach((item: any) => visitPositions(item, callback))
}

function ringArea(ring: Ring, metresPerLonDegree: number) {
  if (ring.length < 3) return 0
  const metresPerLatDegree = 111_320
  let twiceArea = 0

  for (let index = 0; index < ring.length; index += 1) {
    const [lonA, latA] = ring[index]
    const [lonB, latB] = ring[(index + 1) % ring.length]
    const xA = lonA * metresPerLonDegree
    const yA = latA * metresPerLatDegree
    const xB = lonB * metresPerLonDegree
    const yB = latB * metresPerLatDegree
    twiceArea += xA * yB - xB * yA
  }

  return Math.abs(twiceArea / 2)
}

function polygonArea(polygon: PolygonCoordinates, metresPerLonDegree: number) {
  if (polygon.length === 0) return 0
  const outerArea = ringArea(polygon[0], metresPerLonDegree)
  const holesArea = polygon.slice(1).reduce(
    (total, ring) => total + ringArea(ring, metresPerLonDegree),
    0
  )
  return Math.max(0, outerArea - holesArea)
}

export function calculateLakeAreaHectares(features: LakeFeature[]) {
  let latitudeTotal = 0
  let positionCount = 0

  features.forEach(feature => {
    visitPositions(feature.geometry?.coordinates, ([, latitude]) => {
      latitudeTotal += latitude
      positionCount += 1
    })
  })

  if (positionCount === 0) return null

  const middleLatitude = latitudeTotal / positionCount
  const metresPerLonDegree = 111_320 * Math.cos((middleLatitude * Math.PI) / 180)
  let squareMetres = 0

  features.forEach(feature => {
    const coordinates = feature.geometry?.coordinates
    if (feature.geometry?.type === 'Polygon') {
      squareMetres += polygonArea(coordinates as PolygonCoordinates, metresPerLonDegree)
    } else if (feature.geometry?.type === 'MultiPolygon') {
      ;(coordinates as PolygonCoordinates[]).forEach(polygon => {
        squareMetres += polygonArea(polygon, metresPerLonDegree)
      })
    }
  })

  return squareMetres / 10_000
}

export function formatLakeArea(hectares: number | null) {
  if (hectares === null) return 'Area loading'
  const roundedHectares = hectares >= 100 ? Math.round(hectares) : Math.round(hectares * 10) / 10
  const acres = Math.round(hectares * 2.47105)
  return `≈ ${roundedHectares.toLocaleString()} ha · ${acres.toLocaleString()} acres`
}
