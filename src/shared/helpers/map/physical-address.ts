const METERS_PER_DEGREE_LAT = 111320

interface LatLng {
  lat: number
  lng: number
}

interface LocalPoint {
  x: number
  y: number
}

function latLngToLocalMeters(
  lat: number,
  lng: number,
  origin: LatLng,
): LocalPoint {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT *
    Math.max(Math.cos((origin.lat * Math.PI) / 180), 0.000001)
  return {
    x: (lng - origin.lng) * metersPerDegreeLng,
    y: (lat - origin.lat) * METERS_PER_DEGREE_LAT,
  }
}

function normalizeVector(vector: LocalPoint): LocalPoint {
  const length = Math.hypot(vector.x, vector.y)
  if (!length) return { x: 0, y: 0 }
  return { x: vector.x / length, y: vector.y / length }
}

function dotVector(a: LocalPoint, b: LocalPoint): number {
  return a.x * b.x + a.y * b.y
}

function formatPhysicalGridIndex(index: number): string {
  return String(Math.max(0, Math.floor(Number(index) || 0))).padStart(3, '0')
}

export function getPhysicalGridAddress(
  lngLat: LatLng,
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryCoordinates: number[][],
): string {
  if (
    !lngLat ||
    !origin ||
    !Array.isArray(boundaryCoordinates) ||
    boundaryCoordinates.length < 4
  ) {
    return ''
  }
  const [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw] =
    boundaryCoordinates
  if (
    [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw].some(
      (point) => !Array.isArray(point) || point.length !== 2,
    )
  ) {
    return ''
  }
  const topLeft = latLngToLocalMeters(topLeftRaw[1], topLeftRaw[0], origin)
  const bottomRight = latLngToLocalMeters(
    bottomRightRaw[1],
    bottomRightRaw[0],
    origin,
  )
  const bottomLeft = latLngToLocalMeters(
    bottomLeftRaw[1],
    bottomLeftRaw[0],
    origin,
  )
  const target = latLngToLocalMeters(lngLat.lat, lngLat.lng, origin)
  const widthStep = Math.max(1, Number(gridWidth) || 10)
  const heightStep = Math.max(1, Number(gridHeight) || 10)
  const downDirection = normalizeVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  const rightDirection = normalizeVector({
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  })
  const delta: LocalPoint = {
    x: target.x - bottomLeft.x,
    y: target.y - bottomLeft.y,
  }
  const xMeters = dotVector(delta, rightDirection)
  const yMeters = dotVector(delta, downDirection)
  const totalWidth = dotVector(
    { x: topLeft.x - bottomLeft.x, y: topLeft.y - bottomLeft.y },
    rightDirection,
  )
  const totalHeight = dotVector(
    { x: bottomRight.x - bottomLeft.x, y: bottomRight.y - bottomLeft.y },
    downDirection,
  )
  if (
    totalWidth <= 0 ||
    totalHeight <= 0 ||
    xMeters < 0 ||
    yMeters < 0 ||
    xMeters > totalWidth ||
    yMeters > totalHeight
  ) {
    return ''
  }
  const maxColumns = Math.max(1, Math.floor((totalWidth + 0.0001) / widthStep))
  const maxRows = Math.max(1, Math.floor((totalHeight + 0.0001) / heightStep))
  const columnIndex = Math.min(
    maxColumns - 1,
    Math.max(0, Math.floor(xMeters / widthStep)),
  )
  const rowIndex = Math.min(
    maxRows - 1,
    Math.max(0, Math.floor(yMeters / heightStep)),
  )
  return `(${formatPhysicalGridIndex(columnIndex)}, ${formatPhysicalGridIndex(rowIndex)})`
}
