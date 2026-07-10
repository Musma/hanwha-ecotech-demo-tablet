import {
  GRID_LAYER_ID,
  GRID_SOURCE_ID,
  KOREAN_LABEL_FIELD,
  MAX_GRID_RENDER_LINES,
} from '@/shared/constants/map-common'

import type { Map as MapLibreMap } from 'maplibre-gl'

const METERS_PER_DEGREE_LAT = 111320

export interface LatLng {
  lat: number
  lng: number
}

export interface LocalPoint {
  x: number
  y: number
}

export interface UvPoint {
  u: number
  v: number
}

export interface DrawState {
  gridWidth: number
  gridHeight: number
  gridVisible: boolean
  rotationDeg: number
  offsetX: number
  offsetY: number
  origin: LatLng
}

export function metersToLatitudeDegrees(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT
}

export function metersToLongitudeDegrees(
  meters: number,
  latitude: number,
): number {
  const cosLat = Math.max(Math.cos((latitude * Math.PI) / 180), 0.000001)
  return meters / (METERS_PER_DEGREE_LAT * cosLat)
}

export function latLngToLocalMeters(
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

export function localMetersToLatLng(
  x: number,
  y: number,
  origin: LatLng,
): LatLng {
  return {
    lat: origin.lat + metersToLatitudeDegrees(y),
    lng: origin.lng + metersToLongitudeDegrees(x, origin.lat),
  }
}

export function worldToGridFrame(
  x: number,
  y: number,
  radians: number,
): UvPoint {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return { u: x * cos + y * sin, v: -x * sin + y * cos }
}

export function gridToWorldFrame(
  u: number,
  v: number,
  radians: number,
): LocalPoint {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return { x: u * cos - v * sin, y: u * sin + v * cos }
}

export function applyKoreanLabels(map: MapLibreMap): void {
  const style = map.getStyle()
  const layers = style?.layers ?? []
  layers.forEach((layer) => {
    if (layer.type !== 'symbol') return
    const textField = map.getLayoutProperty(layer.id, 'text-field')
    if (!textField) return
    try {
      map.setLayoutProperty(layer.id, 'text-field', KOREAN_LABEL_FIELD as never)
    } catch {
      // ignore
    }
  })
}

export interface EmptyFeatureCollection {
  type: 'FeatureCollection'
  features: never[]
}

export function createEmptyFeatureCollection(): EmptyFeatureCollection {
  return { type: 'FeatureCollection', features: [] }
}

export function ensureGridLayer(map: MapLibreMap): void {
  if (!map.getSource(GRID_SOURCE_ID)) {
    map.addSource(GRID_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection() as never,
    })
  }
  if (!map.getLayer(GRID_LAYER_ID)) {
    map.addLayer({
      id: GRID_LAYER_ID,
      type: 'line',
      source: GRID_SOURCE_ID,
      paint: {
        'line-color': 'rgba(77, 240, 222, 0.58)',
        'line-width': 1.4,
      },
    })
  }
}

interface LineFeature {
  type: 'Feature'
  geometry: { type: 'LineString'; coordinates: number[][] }
  properties: Record<string, unknown>
}

function buildLineFeature(start: LatLng, end: LatLng): LineFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    },
    properties: {},
  }
}

function buildClosedBoundaryFeature(coordinates: number[][]): LineFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [...coordinates, coordinates[0]],
    },
    properties: { role: 'boundary' },
  }
}

function convertGridPointToLatLng(
  u: number,
  v: number,
  radians: number,
  offsetX: number,
  offsetY: number,
  origin: LatLng,
): LatLng {
  const worldPoint = gridToWorldFrame(u, v, radians)
  worldPoint.x += offsetX
  worldPoint.y += offsetY
  return localMetersToLatLng(worldPoint.x, worldPoint.y, origin)
}

function buildOrderedBoundaryPolygonFromUvBounds(
  minU: number,
  maxU: number,
  minV: number,
  maxV: number,
  radians: number,
  offsetX: number,
  offsetY: number,
  origin: LatLng,
): number[][] {
  const topLeft = convertGridPointToLatLng(
    minU,
    maxV,
    radians,
    offsetX,
    offsetY,
    origin,
  )
  const topRight = convertGridPointToLatLng(
    maxU,
    maxV,
    radians,
    offsetX,
    offsetY,
    origin,
  )
  const bottomRight = convertGridPointToLatLng(
    maxU,
    minV,
    radians,
    offsetX,
    offsetY,
    origin,
  )
  const bottomLeft = convertGridPointToLatLng(
    minU,
    minV,
    radians,
    offsetX,
    offsetY,
    origin,
  )
  return [
    [topLeft.lng, topLeft.lat],
    [topRight.lng, topRight.lat],
    [bottomRight.lng, bottomRight.lat],
    [bottomLeft.lng, bottomLeft.lat],
  ]
}

function normalizeVector(vector: LocalPoint): LocalPoint {
  const length = Math.hypot(vector.x, vector.y)
  if (!length) return { x: 0, y: 0 }
  return { x: vector.x / length, y: vector.y / length }
}

function dotProduct(a: LocalPoint, b: LocalPoint): number {
  return a.x * b.x + a.y * b.y
}

function scaleVector(vector: LocalPoint, scalar: number): LocalPoint {
  return { x: vector.x * scalar, y: vector.y * scalar }
}

function addVector(point: LocalPoint, vector: LocalPoint): LocalPoint {
  return { x: point.x + vector.x, y: point.y + vector.y }
}

function buildOrderedMaskGridFeatures(
  features: LineFeature[],
  polygon: number[][],
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
): boolean {
  if (!Array.isArray(polygon) || polygon.length < 4) return false
  const [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw] = polygon
  const required = [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw]
  if (required.some((point) => !Array.isArray(point) || point.length !== 2))
    return false

  const topLeft = latLngToLocalMeters(topLeftRaw[1], topLeftRaw[0], origin)
  const topRight = latLngToLocalMeters(topRightRaw[1], topRightRaw[0], origin)
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
  void topRight

  let topDirection = normalizeVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  let leftDirection: LocalPoint = { x: -topDirection.y, y: topDirection.x }
  const rawBottomDirection: LocalPoint = {
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  }
  if (dotProduct(topDirection, rawBottomDirection) < 0) {
    topDirection = scaleVector(topDirection, -1)
    leftDirection = scaleVector(leftDirection, -1)
  }
  const rawLeftDirection: LocalPoint = {
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  }
  if (dotProduct(leftDirection, rawLeftDirection) < 0) {
    leftDirection = scaleVector(leftDirection, -1)
  }
  const usableWidth = Math.max(
    0,
    dotProduct(
      { x: bottomRight.x - bottomLeft.x, y: bottomRight.y - bottomLeft.y },
      topDirection,
    ),
  )
  const usableHeight = Math.max(0, dotProduct(rawLeftDirection, leftDirection))
  const epsilon = 0.0001
  const snappedWidth =
    Math.floor((usableWidth + epsilon) / gridWidth) * gridWidth
  const snappedHeight =
    Math.floor((usableHeight + epsilon) / gridHeight) * gridHeight
  const snappedBottomLeft = bottomLeft
  const snappedBottomRight = addVector(
    bottomLeft,
    scaleVector(topDirection, snappedWidth),
  )
  const snappedTopLeft = addVector(
    bottomLeft,
    scaleVector(leftDirection, snappedHeight),
  )
  const snappedTopRight = addVector(
    snappedTopLeft,
    scaleVector(topDirection, snappedWidth),
  )
  void snappedBottomLeft
  const snappedBoundary: LatLng[] = [
    localMetersToLatLng(snappedTopLeft.x, snappedTopLeft.y, origin),
    localMetersToLatLng(snappedTopRight.x, snappedTopRight.y, origin),
    localMetersToLatLng(snappedBottomRight.x, snappedBottomRight.y, origin),
    localMetersToLatLng(bottomLeft.x, bottomLeft.y, origin),
  ]
  features.push(
    buildClosedBoundaryFeature(snappedBoundary.map((p) => [p.lng, p.lat])),
  )
  features.push(buildLineFeature(snappedBoundary[0], snappedBoundary[1]))
  features.push(buildLineFeature(snappedBoundary[1], snappedBoundary[2]))
  features.push(buildLineFeature(snappedBoundary[2], snappedBoundary[3]))
  features.push(buildLineFeature(snappedBoundary[3], snappedBoundary[0]))

  for (
    let offset = gridWidth;
    offset < snappedWidth - epsilon;
    offset += gridWidth
  ) {
    const start: LocalPoint = {
      x: bottomLeft.x + topDirection.x * offset,
      y: bottomLeft.y + topDirection.y * offset,
    }
    const end: LocalPoint = {
      x: start.x + leftDirection.x * snappedHeight,
      y: start.y + leftDirection.y * snappedHeight,
    }
    features.push(
      buildLineFeature(
        localMetersToLatLng(start.x, start.y, origin),
        localMetersToLatLng(end.x, end.y, origin),
      ),
    )
  }

  for (
    let offset = gridHeight;
    offset < snappedHeight - epsilon;
    offset += gridHeight
  ) {
    const start: LocalPoint = {
      x: bottomLeft.x + leftDirection.x * offset,
      y: bottomLeft.y + leftDirection.y * offset,
    }
    const end: LocalPoint = {
      x: start.x + topDirection.x * snappedWidth,
      y: start.y + topDirection.y * snappedWidth,
    }
    features.push(
      buildLineFeature(
        localMetersToLatLng(start.x, start.y, origin),
        localMetersToLatLng(end.x, end.y, origin),
      ),
    )
  }

  return true
}

export interface BuildGridGeoJsonOptions {
  corners: LatLng[]
  origin: LatLng
  gridWidth: number
  gridHeight: number
  rotationDeg: number
  offsetX?: number
  offsetY?: number
  maskPolygons?: number[][][]
}

export interface BuildGridGeoJsonResult {
  data:
    | { type: 'FeatureCollection'; features: LineFeature[] }
    | EmptyFeatureCollection
  lineCount: number
  skipped: boolean
}

export function buildGridGeoJson(
  options: BuildGridGeoJsonOptions,
): BuildGridGeoJsonResult {
  const {
    corners,
    origin,
    gridWidth,
    gridHeight,
    rotationDeg,
    offsetX = 0,
    offsetY = 0,
    maskPolygons = [],
  } = options
  const safeGridWidth = Math.max(5, Number(gridWidth) || 50)
  const safeGridHeight = Math.max(5, Number(gridHeight) || 50)
  const radians = (rotationDeg * Math.PI) / 180
  const safeOffsetX = Number(offsetX) || 0
  const safeOffsetY = Number(offsetY) || 0

  const uvCorners = corners.map((coord) => {
    const local = latLngToLocalMeters(coord.lat, coord.lng, origin)
    return worldToGridFrame(
      local.x - safeOffsetX,
      local.y - safeOffsetY,
      radians,
    )
  })
  const uValues = uvCorners.map((p) => p.u)
  const vValues = uvCorners.map((p) => p.v)
  const margin = Math.hypot(safeGridWidth, safeGridHeight) * 2
  let minU = Math.min(...uValues) - margin
  let maxU = Math.max(...uValues) + margin
  let minV = Math.min(...vValues) - margin
  let maxV = Math.max(...vValues) + margin

  const maskUvPoints = maskPolygons.flatMap((polygon) =>
    polygon
      .filter((coord) => Array.isArray(coord) && coord.length === 2)
      .map(([lng, lat]) => {
        const local = latLngToLocalMeters(lat, lng, origin)
        return worldToGridFrame(
          local.x - safeOffsetX,
          local.y - safeOffsetY,
          radians,
        )
      }),
  )

  if (maskUvPoints.length >= 4) {
    minU = Math.min(...maskUvPoints.map((p) => p.u))
    maxU = Math.max(...maskUvPoints.map((p) => p.u))
    minV = Math.min(...maskUvPoints.map((p) => p.v))
    maxV = Math.max(...maskUvPoints.map((p) => p.v))
  }

  const firstU = Math.floor(minU / safeGridWidth) * safeGridWidth
  const firstV = Math.floor(minV / safeGridHeight) * safeGridHeight
  const uLineCount =
    Math.floor((maxU + safeGridWidth - firstU) / safeGridWidth) + 1
  const vLineCount =
    Math.floor((maxV + safeGridHeight - firstV) / safeGridHeight) + 1
  const estimatedLineCount = uLineCount + vLineCount

  if (estimatedLineCount > MAX_GRID_RENDER_LINES) {
    return {
      data: createEmptyFeatureCollection(),
      lineCount: estimatedLineCount,
      skipped: true,
    }
  }

  const features: LineFeature[] = []
  const hasMaskBounds = maskUvPoints.length >= 4

  if (hasMaskBounds) {
    const boundaryPolygon =
      maskPolygons.length === 1
        ? maskPolygons[0]
        : buildOrderedBoundaryPolygonFromUvBounds(
            minU,
            maxU,
            minV,
            maxV,
            radians,
            safeOffsetX,
            safeOffsetY,
            origin,
          )
    if (
      buildOrderedMaskGridFeatures(
        features,
        boundaryPolygon,
        origin,
        safeGridWidth,
        safeGridHeight,
      )
    ) {
      return {
        data: { type: 'FeatureCollection', features },
        lineCount: features.length,
        skipped: false,
      }
    }
    return {
      data: createEmptyFeatureCollection(),
      lineCount: 0,
      skipped: false,
    }
  }

  const lineOverdraw = Math.hypot(safeGridWidth, safeGridHeight) * 3
  for (let u = firstU; u <= maxU + safeGridWidth; u += safeGridWidth) {
    const a = convertGridPointToLatLng(
      u,
      minV - lineOverdraw,
      radians,
      safeOffsetX,
      safeOffsetY,
      origin,
    )
    const b = convertGridPointToLatLng(
      u,
      maxV + lineOverdraw,
      radians,
      safeOffsetX,
      safeOffsetY,
      origin,
    )
    features.push(buildLineFeature(a, b))
  }
  for (let v = firstV; v <= maxV + safeGridHeight; v += safeGridHeight) {
    const a = convertGridPointToLatLng(
      minU - lineOverdraw,
      v,
      radians,
      safeOffsetX,
      safeOffsetY,
      origin,
    )
    const b = convertGridPointToLatLng(
      maxU + lineOverdraw,
      v,
      radians,
      safeOffsetX,
      safeOffsetY,
      origin,
    )
    features.push(buildLineFeature(a, b))
  }

  return {
    data: { type: 'FeatureCollection', features },
    lineCount: features.length,
    skipped: false,
  }
}
