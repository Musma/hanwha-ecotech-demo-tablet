import { DEFAULT_GRID_SIZE_METERS } from '@/shared/constants/map-common'

import {
  latLngToLocalMeters,
  localMetersToLatLng,
  type LatLng,
  type LocalPoint,
} from './grid-utils'

export interface FixedImageOverlay {
  sourceId: string
  layerId: string
  name: string
  label: string
  imageSrc: string
  coordinates: number[][]
}

export interface FixedImageOverlaySpec {
  sourceId: string
  layerId: string
  name: string
  label: string
  imageSrc: string
  coordinates: number[][]
}

export function cloneFixedImageOverlays(
  specs: FixedImageOverlaySpec[],
): FixedImageOverlay[] {
  return specs.map((overlay) => ({
    ...overlay,
    coordinates: createInitialFixedImageCoordinates(overlay),
  }))
}

export function createInitialFixedImageCoordinates(overlay: {
  coordinates: number[][]
}): number[][] {
  if (!Array.isArray(overlay.coordinates) || overlay.coordinates.length !== 4)
    return []
  return overlay.coordinates.map((coord) => [...coord])
}

export function getFixedOverlayCoordinates(
  overlay: FixedImageOverlay,
): number[][] {
  return Array.isArray(overlay.coordinates) ? overlay.coordinates : []
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry:
      | { type: 'Polygon'; coordinates: number[][][] }
      | { type: 'Point'; coordinates: number[] }
    properties: Record<string, unknown>
  }>
}

export function createGridBoundaryEditorGeoJson(
  coordinates: number[][],
): FeatureCollection {
  if (!Array.isArray(coordinates) || coordinates.length < 4) {
    return { type: 'FeatureCollection', features: [] }
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...coordinates, coordinates[0]]],
        },
        properties: {},
      },
    ],
  }
}

export function createGridSelectionGeoJson(
  coordinates: number[][],
): FeatureCollection {
  if (!Array.isArray(coordinates) || coordinates.length < 4) {
    return { type: 'FeatureCollection', features: [] }
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...coordinates, coordinates[0]]],
        },
        properties: {},
      },
    ],
  }
}

export function translateGridBoundaryCoordinates(
  coordinates: number[][],
  dx: number,
  dy: number,
  origin: LatLng,
): number[][] {
  return coordinates.map(([lng, lat]) => {
    const local = latLngToLocalMeters(lat, lng, origin)
    const moved = localMetersToLatLng(local.x + dx, local.y + dy, origin)
    return [moved.lng, moved.lat]
  })
}

export function normalizeLocalVector(vector: LocalPoint): LocalPoint {
  const length = Math.hypot(vector.x, vector.y)
  if (!length) return { x: 0, y: 0 }
  return { x: vector.x / length, y: vector.y / length }
}

export function dotLocalVector(a: LocalPoint, b: LocalPoint): number {
  return a.x * b.x + a.y * b.y
}

export function scaleLocalVector(
  vector: LocalPoint,
  scalar: number,
): LocalPoint {
  return { x: vector.x * scalar, y: vector.y * scalar }
}

export function addLocalVector(
  point: LocalPoint,
  vector: LocalPoint,
): LocalPoint {
  return { x: point.x + vector.x, y: point.y + vector.y }
}

export function parseLocalPolyString(
  polyString: string | null | undefined,
): LocalPoint[] {
  if (!polyString) return []
  return [
    ...String(polyString).matchAll(
      /\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g,
    ),
  ]
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
}

export function isPointInsidePolygon(
  point: LatLng,
  polygon: LatLng[],
): boolean {
  if (!point || !Array.isArray(polygon) || polygon.length < 3) return false
  const x = point.lng
  const y = point.lat
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function escapeHtml(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface EntityPopup {
  kind?: string
  title?: string
  subtitle?: string
  rows?: Array<{ k: string; v: string | number }>
}

export interface EntityPopupItem {
  tone?: string
  popup?: EntityPopup | null
}

export function buildEntityPopupHtml(
  item: EntityPopupItem | null | undefined,
): string {
  const popup = item && item.popup
  if (!popup) return ''
  const rows = Array.isArray(popup.rows) ? popup.rows : []
  const rowsHtml = rows
    .map((row) => `<dt>${escapeHtml(row.k)}</dt><dd>${escapeHtml(row.v)}</dd>`)
    .join('')
  return (
    `<div class="entity-popup entity-popup--${item?.tone || 'block'}">` +
    `<div class="entity-popup__head">` +
    (popup.kind
      ? `<span class="entity-popup__kind">${escapeHtml(popup.kind)}</span>`
      : '') +
    `<strong class="entity-popup__title">${escapeHtml(popup.title)}</strong>` +
    `</div>` +
    (popup.subtitle
      ? `<div class="entity-popup__sub">${escapeHtml(popup.subtitle)}</div>`
      : '') +
    `<dl class="entity-popup__kv">${rowsHtml}</dl>` +
    `</div>`
  )
}

export function isPhysPair(p: unknown): p is [number, number] {
  return (
    Array.isArray(p) &&
    p.length >= 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1])
  )
}

export function convertLocalPolyPointToLngLat(
  point: LocalPoint | null | undefined,
  boundaryCoordinates: number[][],
  origin: LatLng,
): LatLng | null {
  if (
    !point ||
    !Array.isArray(boundaryCoordinates) ||
    boundaryCoordinates.length < 4
  )
    return null
  const [topLeftRaw, , bottomRightRaw, bottomLeftRaw] = boundaryCoordinates
  if (
    [topLeftRaw, bottomRightRaw, bottomLeftRaw].some(
      (coord) => !Array.isArray(coord) || coord.length !== 2,
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
  const rightDirection = normalizeLocalVector({
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  })
  const downDirection = normalizeLocalVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  const localPoint = addLocalVector(
    bottomLeft,
    addLocalVector(
      scaleLocalVector(rightDirection, point.x),
      scaleLocalVector(downDirection, point.y),
    ),
  )
  return localMetersToLatLng(localPoint.x, localPoint.y, origin)
}

export function convertLngLatToLocalPolyPoint(
  lngLat: LatLng | null | undefined,
  boundaryCoordinates: number[][],
  origin: LatLng,
): LocalPoint | null {
  if (
    !lngLat ||
    !Array.isArray(boundaryCoordinates) ||
    boundaryCoordinates.length < 4
  )
    return null
  const [topLeftRaw, , bottomRightRaw, bottomLeftRaw] = boundaryCoordinates
  if (
    [topLeftRaw, bottomRightRaw, bottomLeftRaw].some(
      (coord) => !Array.isArray(coord) || coord.length !== 2,
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
  const rightDirection = normalizeLocalVector({
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  })
  const downDirection = normalizeLocalVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  const target = latLngToLocalMeters(lngLat.lat, lngLat.lng, origin)
  const delta = { x: target.x - bottomLeft.x, y: target.y - bottomLeft.y }
  return {
    x: dotLocalVector(delta, rightDirection),
    y: dotLocalVector(delta, downDirection),
  }
}

function getLngLatMidpoint(
  a: number[],
  b: number[],
): { lng: number; lat: number } | null {
  if (
    !Array.isArray(a) ||
    !Array.isArray(b) ||
    a.length !== 2 ||
    b.length !== 2
  )
    return null
  return { lng: (a[0] + b[0]) / 2, lat: (a[1] + b[1]) / 2 }
}

export function getFixedOverlayLabelPoint(
  overlay: FixedImageOverlay,
): number[] | null {
  const coordinates = getFixedOverlayCoordinates(overlay)
  if (coordinates.length < 4) return null
  const [, , bottomRight, bottomLeft] = coordinates
  const bottomCenter = getLngLatMidpoint(bottomLeft, bottomRight)
  if (!bottomCenter) return null
  return [bottomCenter.lng, bottomCenter.lat]
}

export function createFixedOverlayLabelGeoJson(
  overlays: FixedImageOverlay[],
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: overlays
      .filter((overlay) => overlay.label)
      .map((overlay) => {
        const point = getFixedOverlayLabelPoint(overlay)
        if (!point) return null
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: point },
          properties: { label: overlay.label },
        }
      })
      .filter((feature): feature is NonNullable<typeof feature> =>
        Boolean(feature),
      ),
  }
}

export function getGridCellSelectionCoordinates(
  lngLat: LatLng,
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryCoordinates: number[][],
): number[][] {
  if (
    !lngLat ||
    !Array.isArray(boundaryCoordinates) ||
    boundaryCoordinates.length < 4
  )
    return []
  const [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw] =
    boundaryCoordinates
  if (
    [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw].some(
      (p) => !Array.isArray(p) || p.length !== 2,
    )
  ) {
    return []
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
  const horizontal = normalizeLocalVector({
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  })
  const vertical = normalizeLocalVector({
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  })
  const delta = { x: target.x - bottomLeft.x, y: target.y - bottomLeft.y }
  const xMeters = dotLocalVector(delta, horizontal)
  const yMeters = dotLocalVector(delta, vertical)
  const totalWidth = dotLocalVector(
    { x: bottomRight.x - bottomLeft.x, y: bottomRight.y - bottomLeft.y },
    horizontal,
  )
  const totalHeight = dotLocalVector(
    { x: topLeft.x - bottomLeft.x, y: topLeft.y - bottomLeft.y },
    vertical,
  )
  if (
    xMeters < 0 ||
    yMeters < 0 ||
    xMeters > totalWidth ||
    yMeters > totalHeight
  )
    return []
  const maxColumns = Math.max(1, Math.floor((totalWidth + 0.0001) / widthStep))
  const maxRows = Math.max(1, Math.floor((totalHeight + 0.0001) / heightStep))
  const col = Math.min(
    maxColumns - 1,
    Math.max(0, Math.floor(xMeters / widthStep)),
  )
  const row = Math.min(
    maxRows - 1,
    Math.max(0, Math.floor(yMeters / heightStep)),
  )
  const base = addLocalVector(
    bottomLeft,
    addLocalVector(
      scaleLocalVector(horizontal, col * widthStep),
      scaleLocalVector(vertical, row * heightStep),
    ),
  )
  const nextBottomLeft = base
  const nextBottomRight = addLocalVector(
    base,
    scaleLocalVector(horizontal, widthStep),
  )
  const nextTopLeft = addLocalVector(
    base,
    scaleLocalVector(vertical, heightStep),
  )
  const nextTopRight = addLocalVector(
    nextTopLeft,
    scaleLocalVector(horizontal, widthStep),
  )
  return [
    localMetersToLatLng(nextTopLeft.x, nextTopLeft.y, origin),
    localMetersToLatLng(nextTopRight.x, nextTopRight.y, origin),
    localMetersToLatLng(nextBottomRight.x, nextBottomRight.y, origin),
    localMetersToLatLng(nextBottomLeft.x, nextBottomLeft.y, origin),
  ].map((p) => [p.lng, p.lat])
}

function getBoundaryAxesFromRotation(rotationDeg: number): {
  horizontalDirection: LocalPoint
  verticalDirection: LocalPoint
} {
  const radians = (Number(rotationDeg) * Math.PI) / 180
  return {
    horizontalDirection: { x: Math.cos(radians), y: Math.sin(radians) },
    verticalDirection: { x: -Math.sin(radians), y: Math.cos(radians) },
  }
}

export function normalizeGridBoundaryCoordinates(
  coordinates: number[][],
  origin: LatLng,
  boundaryRotationDeg: number,
): number[][] {
  if (!Array.isArray(coordinates) || coordinates.length < 4) return []
  const [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw] = coordinates
  if (
    [topLeftRaw, topRightRaw, bottomRightRaw, bottomLeftRaw].some(
      (p) => !Array.isArray(p) || p.length !== 2,
    )
  ) {
    return []
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
  let { horizontalDirection, verticalDirection } =
    getBoundaryAxesFromRotation(boundaryRotationDeg)
  const rawVertical = {
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  }
  const rawHorizontal = {
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  }
  if (dotLocalVector(horizontalDirection, rawHorizontal) < 0) {
    horizontalDirection = scaleLocalVector(horizontalDirection, -1)
    verticalDirection = scaleLocalVector(verticalDirection, -1)
  }
  if (dotLocalVector(verticalDirection, rawVertical) < 0) {
    verticalDirection = scaleLocalVector(verticalDirection, -1)
  }
  const width = Math.max(0, dotLocalVector(rawHorizontal, horizontalDirection))
  const height = Math.max(0, dotLocalVector(rawVertical, verticalDirection))
  const nextBottomLeft = bottomLeft
  const nextBottomRight = addLocalVector(
    bottomLeft,
    scaleLocalVector(horizontalDirection, width),
  )
  const nextTopLeft = addLocalVector(
    bottomLeft,
    scaleLocalVector(verticalDirection, height),
  )
  const nextTopRight = addLocalVector(
    nextTopLeft,
    scaleLocalVector(horizontalDirection, width),
  )
  return [
    localMetersToLatLng(nextTopLeft.x, nextTopLeft.y, origin),
    localMetersToLatLng(nextTopRight.x, nextTopRight.y, origin),
    localMetersToLatLng(nextBottomRight.x, nextBottomRight.y, origin),
    localMetersToLatLng(nextBottomLeft.x, nextBottomLeft.y, origin),
  ].map((p) => [p.lng, p.lat])
}

export function resizeGridBoundaryCoordinates(
  coordinates: number[][],
  targetCoordinate: number[],
  origin: LatLng,
  gridWidth: number,
  gridHeight: number,
  boundaryRotationDeg: number,
): number[][] {
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 4 ||
    !Array.isArray(targetCoordinate) ||
    targetCoordinate.length !== 2
  ) {
    return coordinates
  }
  const [topLeftRaw, , bottomRightRaw, bottomLeftRaw] = coordinates
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
  const target = latLngToLocalMeters(
    targetCoordinate[1],
    targetCoordinate[0],
    origin,
  )
  const widthStep = Math.max(1, Number(gridWidth) || 10)
  const heightStep = Math.max(1, Number(gridHeight) || 10)
  let { horizontalDirection, verticalDirection } =
    getBoundaryAxesFromRotation(boundaryRotationDeg)
  const rawVertical = {
    x: topLeft.x - bottomLeft.x,
    y: topLeft.y - bottomLeft.y,
  }
  const rawHorizontal = {
    x: bottomRight.x - bottomLeft.x,
    y: bottomRight.y - bottomLeft.y,
  }
  if (dotLocalVector(horizontalDirection, rawHorizontal) < 0) {
    horizontalDirection = scaleLocalVector(horizontalDirection, -1)
    verticalDirection = scaleLocalVector(verticalDirection, -1)
  }
  if (dotLocalVector(verticalDirection, rawVertical) < 0) {
    verticalDirection = scaleLocalVector(verticalDirection, -1)
  }
  const delta = { x: target.x - bottomLeft.x, y: target.y - bottomLeft.y }
  const snappedWidth = Math.max(
    widthStep,
    Math.round(dotLocalVector(delta, horizontalDirection) / widthStep) *
      widthStep,
  )
  const snappedHeight = Math.max(
    heightStep,
    Math.round(dotLocalVector(delta, verticalDirection) / heightStep) *
      heightStep,
  )
  const nextBottomRight = addLocalVector(
    bottomLeft,
    scaleLocalVector(horizontalDirection, snappedWidth),
  )
  const nextTopLeft = addLocalVector(
    bottomLeft,
    scaleLocalVector(verticalDirection, snappedHeight),
  )
  const nextTopRight = addLocalVector(
    nextTopLeft,
    scaleLocalVector(horizontalDirection, snappedWidth),
  )
  return normalizeGridBoundaryCoordinates(
    [
      localMetersToLatLng(nextTopLeft.x, nextTopLeft.y, origin),
      localMetersToLatLng(nextTopRight.x, nextTopRight.y, origin),
      localMetersToLatLng(nextBottomRight.x, nextBottomRight.y, origin),
      localMetersToLatLng(bottomLeft.x, bottomLeft.y, origin),
    ].map((p) => [p.lng, p.lat]),
    origin,
    boundaryRotationDeg,
  )
}

export const PHYS_CELL_METERS = DEFAULT_GRID_SIZE_METERS
