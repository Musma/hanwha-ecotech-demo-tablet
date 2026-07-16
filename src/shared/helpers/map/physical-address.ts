const METERS_PER_DEGREE_LAT = 111320

interface LatLng {
  lat: number
  lng: number
}

interface LocalPoint {
  x: number
  y: number
}

interface PhysicalGridProjection {
  columnDirection: LocalPoint
  heightStep: number
  maxColumns: number
  maxRows: number
  originPoint: LocalPoint
  rowDirection: LocalPoint
  totalHeight: number
  totalWidth: number
  widthStep: number
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

function localMetersToLatLng(point: LocalPoint, origin: LatLng): LatLng {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT *
    Math.max(Math.cos((origin.lat * Math.PI) / 180), 0.000001)
  return {
    lat: origin.lat + point.y / METERS_PER_DEGREE_LAT,
    lng: origin.lng + point.x / metersPerDegreeLng,
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

function createPhysicalGridProjection(
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryCoordinates: number[][],
): PhysicalGridProjection | null {
  if (
    !origin ||
    !Array.isArray(boundaryCoordinates) ||
    boundaryCoordinates.length < 4
  ) {
    return null
  }

  const [topLeftRaw, , bottomRightRaw, bottomLeftRaw] = boundaryCoordinates
  if (
    [topLeftRaw, bottomRightRaw, bottomLeftRaw].some(
      (point) => !Array.isArray(point) || point.length !== 2,
    )
  ) {
    return null
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
  const widthStep = Math.max(1, Number(gridWidth) || 10)
  const heightStep = Math.max(1, Number(gridHeight) || 10)
  const columnDirection = normalizeVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  const rowDirection = normalizeVector({
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  })
  const totalWidth = dotVector(
    { x: bottomRight.x - bottomLeft.x, y: bottomRight.y - bottomLeft.y },
    columnDirection,
  )
  const totalHeight = dotVector(
    { x: topLeft.x - bottomLeft.x, y: topLeft.y - bottomLeft.y },
    rowDirection,
  )
  if (totalWidth <= 0 || totalHeight <= 0) return null

  return {
    columnDirection,
    heightStep,
    maxColumns: Math.max(1, Math.floor((totalWidth + 0.0001) / widthStep)),
    maxRows: Math.max(1, Math.floor((totalHeight + 0.0001) / heightStep)),
    originPoint: bottomLeft,
    rowDirection,
    totalHeight,
    totalWidth,
    widthStep,
  }
}

export function getPhysicalGridAddress(
  lngLat: LatLng,
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryCoordinates: number[][],
): string {
  if (!lngLat) return ''

  const projection = createPhysicalGridProjection(
    origin,
    gridWidth,
    gridHeight,
    boundaryCoordinates,
  )
  if (!projection) return ''

  const target = latLngToLocalMeters(lngLat.lat, lngLat.lng, origin)
  const delta: LocalPoint = {
    x: target.x - projection.originPoint.x,
    y: target.y - projection.originPoint.y,
  }
  const xMeters = dotVector(delta, projection.columnDirection)
  const yMeters = dotVector(delta, projection.rowDirection)
  if (
    xMeters < 0 ||
    yMeters < 0 ||
    xMeters > projection.totalWidth ||
    yMeters > projection.totalHeight
  ) {
    return ''
  }

  const columnIndex = Math.min(
    projection.maxColumns - 1,
    Math.max(0, Math.floor(xMeters / projection.widthStep)),
  )
  const rowIndex = Math.min(
    projection.maxRows - 1,
    Math.max(0, Math.floor(yMeters / projection.heightStep)),
  )
  return `(${formatPhysicalGridIndex(columnIndex)}, ${formatPhysicalGridIndex(rowIndex)})`
}

export function getPhysicalGridCellCenter(
  phys: [number, number],
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryCoordinates: number[][],
): LatLng | null {
  const projection = createPhysicalGridProjection(
    origin,
    gridWidth,
    gridHeight,
    boundaryCoordinates,
  )
  if (!projection || !Array.isArray(phys) || phys.length < 2) return null

  const columnIndex = Math.floor(Number(phys[0]))
  const rowIndex = Math.floor(Number(phys[1]))
  if (
    !Number.isFinite(columnIndex) ||
    !Number.isFinite(rowIndex) ||
    columnIndex < 0 ||
    rowIndex < 0 ||
    columnIndex >= projection.maxColumns ||
    rowIndex >= projection.maxRows
  ) {
    return null
  }

  const xMeters = Math.min(
    projection.totalWidth,
    (columnIndex + 0.5) * projection.widthStep,
  )
  const yMeters = Math.min(
    projection.totalHeight,
    (rowIndex + 0.5) * projection.heightStep,
  )

  return localMetersToLatLng(
    {
      x:
        projection.originPoint.x +
        projection.columnDirection.x * xMeters +
        projection.rowDirection.x * yMeters,
      y:
        projection.originPoint.y +
        projection.columnDirection.y * xMeters +
        projection.rowDirection.y * yMeters,
    },
    origin,
  )
}
