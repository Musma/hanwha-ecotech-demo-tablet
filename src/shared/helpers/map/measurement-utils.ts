import {
  MEASURE_FILL_LAYER_ID,
  MEASURE_LABEL_LAYER_ID,
  MEASURE_LINE_LAYER_ID,
  MEASURE_MODES,
  MEASURE_POINT_LAYER_ID,
  MEASURE_SOURCE_ID,
  type MeasureMode,
} from '@/shared/constants/map-common'

import {
  createEmptyFeatureCollection,
  latLngToLocalMeters,
  localMetersToLatLng,
  metersToLatitudeDegrees,
  metersToLongitudeDegrees,
  type LatLng,
} from './grid-utils'

import type { Map as MapLibreMap } from 'maplibre-gl'

const METERS_PER_DEGREE_LAT = 111320
const EARTH_RADIUS_METERS = 6371008.8

export { MEASURE_MODES }

export interface CircleShape {
  id: string
  name?: string
  color?: string
  center: LatLng
  edgePoint?: LatLng
  radiusMeters?: number
  widthMeters?: number
  heightMeters?: number
}

export interface PolygonShape {
  id: string
  name?: string
  points: LatLng[]
  colorKey?: string | null
}

export interface RectangleShape {
  id: string
  name?: string
  color?: string
  imageSrc?: string
  isBlockPlacement?: boolean
  points: LatLng[]
}

export interface SelectedShape {
  type: 'polygon' | 'rectangle' | 'circle'
  id: string
  focusFromList?: boolean
}

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinLat = Math.sin(deltaLat / 2)
  const sinLng = Math.sin(deltaLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function polygonAreaSquareMeters(points: LatLng[]): number {
  if (points.length < 3) return 0
  const origin = points[0]
  const localPoints = points.map((point) =>
    latLngToLocalMeters(point.lat, point.lng, origin),
  )
  let area = 0
  for (let i = 0; i < localPoints.length; i += 1) {
    const cur = localPoints[i]
    const nxt = localPoints[(i + 1) % localPoints.length]
    area += cur.x * nxt.y - nxt.x * cur.y
  }
  return Math.abs(area) / 2
}

export function formatMeters(value: number): string {
  if (!Number.isFinite(value)) return '-'
  if (value >= 1000) return `${Math.round(value / 1000)} km`
  return `${Math.round(value)} m`
}

export function formatSquareMeters(value: number): string {
  if (!Number.isFinite(value)) return '-'
  if (value >= 1000000) return `${Math.round(value / 1000000)} km2`
  return `${Math.round(value)} m2`
}

export function getCircleDimensions(circle: CircleShape | null | undefined): {
  widthMeters: number
  heightMeters: number
} {
  const widthMeters =
    Number.isFinite(circle?.widthMeters) && (circle?.widthMeters ?? 0) > 0
      ? (circle!.widthMeters as number)
      : (circle?.radiusMeters ?? 0) * 2
  const heightMeters =
    Number.isFinite(circle?.heightMeters) && (circle?.heightMeters ?? 0) > 0
      ? (circle!.heightMeters as number)
      : (circle?.radiusMeters ?? 0) * 2
  return { widthMeters, heightMeters }
}

export function getCircleAreaSquareMeters(
  circle: CircleShape | null | undefined,
): number {
  const { widthMeters, heightMeters } = getCircleDimensions(circle)
  if (
    !Number.isFinite(widthMeters) ||
    !Number.isFinite(heightMeters) ||
    widthMeters <= 0 ||
    heightMeters <= 0
  ) {
    return 0
  }
  return Math.PI * (widthMeters / 2) * (heightMeters / 2)
}

export function createCircleCoordinates(
  center: LatLng,
  widthMeters: number,
  heightMeters: number = widthMeters,
  steps = 64,
): number[][] {
  if (
    !center ||
    !Number.isFinite(widthMeters) ||
    !Number.isFinite(heightMeters) ||
    widthMeters <= 0 ||
    heightMeters <= 0
  ) {
    return []
  }
  const out: number[][] = []
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const dx = Math.cos(angle) * (widthMeters / 2)
    const dy = Math.sin(angle) * (heightMeters / 2)
    const point = localMetersToLatLng(dx, dy, center)
    out.push([point.lng, point.lat])
  }
  return out
}

export function offsetLatLng(
  point: LatLng,
  dxMeters: number,
  dyMeters: number,
): LatLng {
  return {
    lat: point.lat + metersToLatitudeDegrees(dyMeters),
    lng: point.lng + metersToLongitudeDegrees(dxMeters, point.lat),
  }
}

export function createRectanglePoints(start: LatLng, end: LatLng): LatLng[] {
  return [
    { lat: start.lat, lng: start.lng },
    { lat: start.lat, lng: end.lng },
    { lat: end.lat, lng: end.lng },
    { lat: end.lat, lng: start.lng },
  ]
}

export function getDeltaMetersBetween(
  a: LatLng,
  b: LatLng,
): { dx: number; dy: number } {
  const avgLat = (a.lat + b.lat) / 2
  return {
    dx:
      (b.lng - a.lng) *
      METERS_PER_DEGREE_LAT *
      Math.max(Math.cos((avgLat * Math.PI) / 180), 0.000001),
    dy: (b.lat - a.lat) * METERS_PER_DEGREE_LAT,
  }
}

function getPolygonCentroid(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null
  if (points.length < 3) return points[0]
  const origin = points[0]
  const local = points.map((p) => latLngToLocalMeters(p.lat, p.lng, origin))
  let areaFactor = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < local.length; i += 1) {
    const cur = local[i]
    const nxt = local[(i + 1) % local.length]
    const cross = cur.x * nxt.y - nxt.x * cur.y
    areaFactor += cross
    cx += (cur.x + nxt.x) * cross
    cy += (cur.y + nxt.y) * cross
  }
  if (Math.abs(areaFactor) < 0.000001) return points[0]
  return localMetersToLatLng(
    cx / (3 * areaFactor),
    cy / (3 * areaFactor),
    origin,
  )
}

interface MeasureFeature {
  type: 'Feature'
  geometry:
    | { type: 'Point'; coordinates: number[] }
    | { type: 'LineString'; coordinates: number[][] }
    | { type: 'Polygon'; coordinates: number[][][] }
  properties: Record<string, unknown>
}

function createLabelFeature(
  point: LatLng,
  label: string | undefined,
  measureId: string,
  shapeType: string,
): MeasureFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
    properties: { role: 'label', label, measureId, shapeType },
  }
}

export function buildMeasurementFeatures(
  mode: MeasureMode,
  points: LatLng[],
  previewPoint: LatLng | null,
  circles: CircleShape[],
  polygons: PolygonShape[],
  rectangles: RectangleShape[],
  selectedShape: SelectedShape | null = null,
  draftRectanglePoints: LatLng[] | null = null,
  activeColorKey: string | null = null,
  colorByKey: Record<string, string> | null = null,
): { type: 'FeatureCollection'; features: MeasureFeature[] } {
  const features: MeasureFeature[] = []
  const unselectedPolygons: PolygonShape[] = []
  const selectedPolygons: PolygonShape[] = []
  const unselectedCircles: CircleShape[] = []
  const selectedCircles: CircleShape[] = []
  const unselectedRectangles: RectangleShape[] = []
  const selectedRectangles: RectangleShape[] = []

  polygons.forEach((polygon) => {
    const isSel =
      selectedShape?.type === 'polygon' && selectedShape.id === polygon.id
    ;(isSel ? selectedPolygons : unselectedPolygons).push(polygon)
  })
  circles.forEach((circle) => {
    const isSel =
      selectedShape?.type === 'circle' && selectedShape.id === circle.id
    ;(isSel ? selectedCircles : unselectedCircles).push(circle)
  })
  rectangles.forEach((rectangle) => {
    const isSel =
      selectedShape?.type === 'rectangle' && selectedShape.id === rectangle.id
    ;(isSel ? selectedRectangles : unselectedRectangles).push(rectangle)
  })

  function pushPolygonFeature(polygon: PolygonShape) {
    const isSel =
      selectedShape?.type === 'polygon' && selectedShape.id === polygon.id
    const closed = [...polygon.points, polygon.points[0]].map((p) => [
      p.lng,
      p.lat,
    ])
    const keyColor =
      polygon.colorKey && colorByKey ? colorByKey[polygon.colorKey] : null
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [closed] },
      properties: {
        role: 'area-fill',
        draggable: false,
        isSelected: isSel,
        measureId: polygon.id,
        shapeType: 'polygon',
        fillColor: keyColor ?? '#ffd56a',
        fillOpacity: keyColor ? 0.32 : 0.18,
      },
    })
    if (keyColor) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: closed },
        properties: {
          role: 'area-outline',
          measureId: polygon.id,
          shapeType: 'polygon',
          isSelected: isSel,
          lineColor: keyColor,
          lineOpacity: 1,
        },
      })
    }
    const centroid = getPolygonCentroid(polygon.points)
    if (centroid)
      features.push(
        createLabelFeature(
          centroid,
          polygon.name ?? polygon.id,
          polygon.id,
          'polygon',
        ),
      )
  }

  function pushRectangleFeature(rectangle: RectangleShape) {
    const isSel =
      selectedShape?.type === 'rectangle' && selectedShape.id === rectangle.id
    const closed = [...rectangle.points, rectangle.points[0]].map((p) => [
      p.lng,
      p.lat,
    ])
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [closed] },
      properties: {
        role: 'rectangle-fill',
        draggable: true,
        isSelected: isSel,
        measureId: rectangle.id,
        shapeType: 'rectangle',
        hasImageBlock: Boolean(rectangle.imageSrc),
        fillColor: rectangle.color ?? '#e11d48',
        fillOpacity: rectangle.imageSrc ? 0 : 1,
      },
    })
    const centroid = getPolygonCentroid(rectangle.points)
    if (centroid)
      features.push(
        createLabelFeature(
          centroid,
          rectangle.name ?? rectangle.id,
          rectangle.id,
          'rectangle',
        ),
      )
  }

  function pushCircleFeature(circle: CircleShape) {
    const isSel =
      selectedShape?.type === 'circle' && selectedShape.id === circle.id
    const { widthMeters, heightMeters } = getCircleDimensions(circle)
    const coords = createCircleCoordinates(
      circle.center,
      widthMeters,
      heightMeters,
    )
    if (coords.length === 0) return
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {
        role: 'radius-fill',
        draggable: true,
        isSelected: isSel,
        measureId: circle.id,
        shapeType: 'circle',
        fillColor: circle.color ?? '#e11d48',
        fillOpacity: 1,
      },
    })
    features.push(
      createLabelFeature(
        circle.center,
        circle.name ?? circle.id,
        circle.id,
        'circle',
      ),
    )
  }

  unselectedPolygons.forEach(pushPolygonFeature)
  selectedPolygons.forEach(pushPolygonFeature)
  unselectedRectangles.forEach(pushRectangleFeature)
  unselectedCircles.forEach(pushCircleFeature)
  selectedRectangles.forEach(pushRectangleFeature)
  selectedCircles.forEach(pushCircleFeature)

  points.forEach((point, index) => {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
      properties: { role: 'anchor', index },
    })
  })

  if (previewPoint && mode !== MEASURE_MODES.none) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [previewPoint.lng, previewPoint.lat],
      },
      properties: { role: 'preview' },
    })
  }

  if (
    (mode === MEASURE_MODES.rectangle || mode === MEASURE_MODES.imageBlock) &&
    points[0]
  ) {
    const rectanglePoints =
      draftRectanglePoints ??
      ((previewPoint ?? points[1])
        ? createRectanglePoints(points[0], previewPoint ?? points[1])
        : null)
    if (rectanglePoints) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [...rectanglePoints, rectanglePoints[0]].map((p) => [p.lng, p.lat]),
          ],
        },
        properties: { role: 'rectangle-fill' },
      })
    }
  }

  if (mode === MEASURE_MODES.polygon) {
    const polygonPoints = previewPoint ? [...points, previewPoint] : points
    const activeKeyColor =
      activeColorKey && colorByKey ? colorByKey[activeColorKey] : null
    if (polygonPoints.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [...polygonPoints, polygonPoints[0]].map((p) => [
            p.lng,
            p.lat,
          ]),
        },
        properties: {
          role: 'area-outline',
          ...(activeKeyColor ? { lineColor: activeKeyColor } : {}),
        },
      })
    }
    if (polygonPoints.length >= 3) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [...polygonPoints, polygonPoints[0]].map((p) => [p.lng, p.lat]),
          ],
        },
        properties: {
          role: 'area-fill',
          ...(activeKeyColor
            ? { fillColor: activeKeyColor, fillOpacity: 0.32 }
            : {}),
        },
      })
    }
  }

  if (mode === MEASURE_MODES.circle && points[0]) {
    const edge = previewPoint ?? points[1]
    if (edge) {
      const radius = haversineDistanceMeters(points[0], edge)
      const diameter = radius * 2
      const coords = createCircleCoordinates(points[0], diameter, diameter)
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [points[0].lng, points[0].lat],
            [edge.lng, edge.lat],
          ],
        },
        properties: { role: 'radius-line' },
      })
      if (coords.length > 0) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: { role: 'radius-fill' },
        })
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: { role: 'radius-outline' },
        })
      }
    }
  }

  return { type: 'FeatureCollection', features }
}

export function ensureMeasurementLayers(map: MapLibreMap): void {
  if (!map.getSource(MEASURE_SOURCE_ID)) {
    map.addSource(MEASURE_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection() as never,
    })
  }
  if (!map.getLayer(MEASURE_FILL_LAYER_ID)) {
    map.addLayer({
      id: MEASURE_FILL_LAYER_ID,
      type: 'fill',
      source: MEASURE_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-antialias': false,
        'fill-color': ['coalesce', ['get', 'fillColor'], '#ffd56a'],
        'fill-opacity': [
          'case',
          ['boolean', ['get', 'hasImageBlock'], false],
          0,
          ['boolean', ['get', 'isSelected'], false],
          ['max', ['coalesce', ['get', 'fillOpacity'], 0.18], 0.45],
          ['coalesce', ['get', 'fillOpacity'], 0.18],
        ],
      },
    })
  }
  if (!map.getLayer(MEASURE_LINE_LAYER_ID)) {
    map.addLayer({
      id: MEASURE_LINE_LAYER_ID,
      type: 'line',
      source: MEASURE_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          '#ffffff',
          ['coalesce', ['get', 'lineColor'], '#ffd56a'],
        ],
        'line-opacity': ['coalesce', ['get', 'lineOpacity'], 1],
        'line-width': ['case', ['boolean', ['get', 'isSelected'], false], 4, 3],
      },
    })
  }
  if (!map.getLayer(MEASURE_POINT_LAYER_ID)) {
    map.addLayer({
      id: MEASURE_POINT_LAYER_ID,
      type: 'circle',
      source: MEASURE_SOURCE_ID,
      filter: [
        'all',
        ['==', ['geometry-type'], 'Point'],
        ['!=', ['get', 'role'], 'label'],
      ],
      paint: {
        'circle-radius': 5,
        'circle-color': '#132026',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#90f0b7',
      },
    })
  }
  if (!map.getLayer(MEASURE_LABEL_LAYER_ID)) {
    map.addLayer({
      id: MEASURE_LABEL_LAYER_ID,
      type: 'symbol',
      source: MEASURE_SOURCE_ID,
      filter: [
        'all',
        ['==', ['geometry-type'], 'Point'],
        ['==', ['get', 'role'], 'label'],
      ],
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 14,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#fff4d0',
        'text-halo-color': 'rgba(19, 32, 38, 0.92)',
        'text-halo-width': 1.8,
      },
    })
  }
  if (map.getLayer(MEASURE_LABEL_LAYER_ID)) {
    map.moveLayer(MEASURE_LABEL_LAYER_ID)
  }
}

export function getMeasureModeLabel(mode: MeasureMode): string {
  if (mode === MEASURE_MODES.circle) return '원'
  if (mode === MEASURE_MODES.polygon) return '다각형'
  if (mode === MEASURE_MODES.imageBlock) return '이미지 블록'
  if (mode === MEASURE_MODES.rectangle) return '사각형'
  return '없음'
}

export function createRectangleFromDiagonal(
  id: string,
  start: LatLng,
  end: LatLng,
): { id: string; points: LatLng[] } {
  return { id, points: createRectanglePoints(start, end) }
}
