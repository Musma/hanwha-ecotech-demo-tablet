import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

import {
  BLOCK_COLOR_PALETTE,
  MEASURE_FILL_LAYER_ID,
  MEASURE_LINE_LAYER_ID,
  MEASURE_MODES,
  type MeasureMode,
} from '@/shared/constants/map-common'
import type { LatLng } from '@/shared/helpers/map/grid-utils'
import {
  buildMeasurementFeatures,
  type CircleShape,
  type PolygonShape,
  type RectangleShape,
  type SelectedShape,
} from '@/shared/helpers/map/measurement-utils'
import type { MapPointEvent } from '@/shared/types/map/yard-map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any

interface MeasureRuntimeState {
  mode: MeasureMode
  points: LatLng[]
  previewPoint: LatLng | null
}

interface UseMapMeasurementsOptions {
  blockVisible: Ref<boolean>
  drawActiveKindRef: Ref<string | null>
  getColorByKey: () => Record<string, string> | null
  mapRef: ShallowRef<MapInstance | null>
  measureRef: MeasureRuntimeState
  parcelVisible: Ref<boolean>
  polygons: PolygonShape[]
}

export function useMapMeasurements({
  blockVisible,
  drawActiveKindRef,
  getColorByKey,
  mapRef,
  measureRef,
  parcelVisible,
  polygons,
}: UseMapMeasurementsOptions) {
  const measureIdRef = { current: 1 }
  const measureNameRef = { polygon: 1, block: 1 }

  const circlesRef = ref<CircleShape[]>([])
  const polygonsRef = ref<PolygonShape[]>(
    Array.isArray(polygons) ? [...polygons] : [],
  )
  const rectanglesRef = ref<RectangleShape[]>([])
  const circleMeasures = ref<CircleShape[]>([])
  const polygonMeasures = ref<PolygonShape[]>(
    Array.isArray(polygons) ? [...polygons] : [],
  )
  const rectangleMeasures = ref<RectangleShape[]>([])
  const selectedShape = ref<SelectedShape | null>(null)
  const selectedShapeRef = shallowRef<SelectedShape | null>(null)

  function createMeasureId(prefix: string) {
    const next = `${prefix}-${measureIdRef.current}`
    measureIdRef.current += 1
    return next
  }

  function createMeasureName(kind: 'polygon' | 'block') {
    const idx = measureNameRef[kind]
    measureNameRef[kind] += 1
    if (kind === 'polygon') return `g${String(idx).padStart(3, '0')}`
    return `blk${String(idx).padStart(3, '0')}`
  }

  function getPointsBoundsCenter(points: LatLng[]): LatLng | null {
    if (!points || points.length === 0) return null
    const lats = points.map((point) => point.lat)
    const lngs = points.map((point) => point.lng)
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    }
  }

  function getAveragePoint(points: LatLng[]): LatLng | null {
    if (!points || points.length === 0) return null
    const sums = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      }),
      { lat: 0, lng: 0 },
    )
    return { lat: sums.lat / points.length, lng: sums.lng / points.length }
  }

  function createScreenAlignedRectangle(
    id: string,
    start: LatLng,
    end: LatLng,
  ): { id: string; points: LatLng[] } | null {
    const map = mapRef.value
    if (!map) return null
    const sp = map.project([start.lng, start.lat])
    const ep = map.project([end.lng, end.lat])
    const corners = [sp, { x: ep.x, y: sp.y }, ep, { x: sp.x, y: ep.y }].map(
      (point) => {
        const lngLat = map.unproject([point.x, point.y])
        return { lat: lngLat.lat, lng: lngLat.lng }
      },
    )
    return { id, points: corners }
  }

  function syncMeasureMirrorState() {
    circlesRef.value = circleMeasures.value
    polygonsRef.value = polygonMeasures.value
    rectanglesRef.value = rectangleMeasures.value
  }

  function syncSelectedShape(value: SelectedShape | null) {
    selectedShapeRef.value = value
  }

  function syncMeasurementOverlay() {
    const map = mapRef.value
    const src = map?.getSource('echotech-measure-source')
    if (!src) return
    const { mode, points, previewPoint } = measureRef
    const draftRectanglePoints =
      (mode === MEASURE_MODES.rectangle || mode === MEASURE_MODES.imageBlock) &&
      points[0] &&
      (previewPoint ?? points[1])
        ? (createScreenAlignedRectangle(
            'draft-rectangle',
            points[0],
            previewPoint ?? points[1],
          )?.points ?? null)
        : null
    src.setData(
      buildMeasurementFeatures(
        mode,
        points,
        previewPoint,
        blockVisible.value ? circlesRef.value : [],
        parcelVisible.value ? polygonsRef.value : [],
        blockVisible.value ? rectanglesRef.value : [],
        selectedShapeRef.value,
        draftRectanglePoints,
        drawActiveKindRef.value,
        getColorByKey(),
      ) as never,
    )
  }

  function getOverlayCenter(shape: {
    type: SelectedShape['type']
    id: string
  }): LatLng | null {
    if (!shape) return null
    if (shape.type === 'circle') {
      return (
        circleMeasures.value.find((circle) => circle.id === shape.id)?.center ??
        null
      )
    }
    if (shape.type === 'rectangle') {
      const rectangle = rectangleMeasures.value.find(
        (item) => item.id === shape.id,
      )
      return rectangle ? getPointsBoundsCenter(rectangle.points) : null
    }
    if (shape.type === 'polygon') {
      const polygon = polygonMeasures.value.find((item) => item.id === shape.id)
      return polygon ? getPointsBoundsCenter(polygon.points) : null
    }
    return null
  }

  function focusOverlayInVisibleArea(
    shape: { type: SelectedShape['type']; id: string },
    { force = false }: { force?: boolean } = {},
  ): boolean {
    const map = mapRef.value
    if (!map || !shape) return false
    const centerPoint = getOverlayCenter(shape)
    if (!centerPoint) return false
    const projected = map.project([centerPoint.lng, centerPoint.lat])
    const canvas = map.getCanvas()
    const padding = {
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    }
    const inside =
      projected.x >= padding.left &&
      projected.x <= canvas.clientWidth - padding.right &&
      projected.y >= padding.top &&
      projected.y <= canvas.clientHeight - padding.bottom
    if (!force && inside) return true
    map.easeTo({
      center: [centerPoint.lng, centerPoint.lat],
      padding,
      duration: 700,
    })
    return true
  }

  function handleSelectOverlay(next: {
    type: SelectedShape['type']
    id: string
    focusFromList?: boolean
  }) {
    selectedShape.value = next ? { type: next.type, id: next.id } : null
    if (next?.focusFromList) focusOverlayInVisibleArea(next)
  }

  function handleFocusOverlay(next: {
    type: SelectedShape['type']
    id: string
  }) {
    if (!next) return
    selectedShape.value = { type: next.type, id: next.id }
    focusOverlayInVisibleArea(next, { force: true })
  }

  function getOverlaySelectionAtPoint(event: MapPointEvent): {
    type: SelectedShape['type']
    id: string
  } | null {
    const map = mapRef.value
    if (!map) return null
    const feature = map
      .queryRenderedFeatures(event.point, {
        layers: [MEASURE_FILL_LAYER_ID, MEASURE_LINE_LAYER_ID],
      })
      .find(
        (item: { properties?: Record<string, unknown> }) =>
          item.properties?.measureId && item.properties?.shapeType,
      )
    if (!feature) return null
    return {
      type: feature.properties.shapeType as SelectedShape['type'],
      id: String(feature.properties.measureId),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getPolygonIdsAtPoint(event: any): string[] {
    const map = mapRef.value
    if (!map) return []
    const features = map.queryRenderedFeatures(event.point, {
      layers: [MEASURE_FILL_LAYER_ID, MEASURE_LINE_LAYER_ID],
    })
    const ids: string[] = []
    for (const feature of features) {
      const properties = (
        feature as { properties?: { measureId?: unknown; shapeType?: unknown } }
      ).properties
      const measureId = properties?.measureId
      if (properties?.shapeType !== 'polygon' || typeof measureId !== 'string')
        continue
      if (!ids.includes(measureId)) ids.push(measureId)
    }
    return ids
  }

  function removePolygonById(id: string) {
    polygonsRef.value = polygonsRef.value.filter((polygon) => polygon.id !== id)
    polygonMeasures.value = polygonsRef.value
    if (
      selectedShape.value?.type === 'polygon' &&
      selectedShape.value.id === id
    ) {
      selectedShape.value = null
    }
  }

  function deleteOverlay(type: SelectedShape['type'], id: string) {
    if (type === 'circle') {
      const next = circleMeasures.value.filter((circle) => circle.id !== id)
      circlesRef.value = next
      circleMeasures.value = next
    }
    if (type === 'rectangle') {
      const next = rectangleMeasures.value.filter((circle) => circle.id !== id)
      rectanglesRef.value = next
      rectangleMeasures.value = next
    }
    if (type === 'polygon') {
      const next = polygonMeasures.value.filter((circle) => circle.id !== id)
      polygonsRef.value = next
      polygonMeasures.value = next
    }
    if (selectedShape.value?.id === id && selectedShape.value?.type === type) {
      selectedShape.value = null
    }
  }

  function updateCircleDiameter(id: string, nextValue: number) {
    const parsed = Math.round(nextValue)
    if (!Number.isFinite(parsed) || parsed <= 0) return
    const next = circleMeasures.value.map((circle) =>
      circle.id === id
        ? {
            ...circle,
            widthMeters: parsed,
            heightMeters: parsed,
            radiusMeters: parsed / 2,
          }
        : circle,
    )
    circlesRef.value = next
    circleMeasures.value = next
  }

  function updateOverlayName(
    type: SelectedShape['type'],
    id: string,
    nextName: string,
  ) {
    const trimmed = nextName.trim()
    if (!trimmed) return
    if (type === 'polygon') {
      const next = polygonMeasures.value.map((polygon) =>
        polygon.id === id ? { ...polygon, name: trimmed } : polygon,
      )
      polygonsRef.value = next
      polygonMeasures.value = next
      return
    }
    if (type === 'rectangle') {
      const next = rectangleMeasures.value.map((rectangle) =>
        rectangle.id === id ? { ...rectangle, name: trimmed } : rectangle,
      )
      rectanglesRef.value = next
      rectangleMeasures.value = next
      return
    }
    if (type === 'circle') {
      const next = circleMeasures.value.map((circle) =>
        circle.id === id ? { ...circle, name: trimmed } : circle,
      )
      circlesRef.value = next
      circleMeasures.value = next
    }
  }

  function updateBlockColor(
    type: SelectedShape['type'],
    id: string,
    color: string,
  ) {
    if (!BLOCK_COLOR_PALETTE.includes(color)) return
    if (type === 'circle') {
      const next = circleMeasures.value.map((circle) =>
        circle.id === id ? { ...circle, color } : circle,
      )
      circlesRef.value = next
      circleMeasures.value = next
      return
    }
    if (type === 'rectangle') {
      const next = rectangleMeasures.value.map((rectangle) =>
        rectangle.id === id ? { ...rectangle, color } : rectangle,
      )
      rectanglesRef.value = next
      rectangleMeasures.value = next
    }
  }

  function updateBlockImage(id: string, nextImageSrc: string) {
    if (!nextImageSrc) return
    const next = rectangleMeasures.value.map((rectangle) =>
      rectangle.id === id
        ? { ...rectangle, imageSrc: nextImageSrc }
        : rectangle,
    )
    rectanglesRef.value = next
    rectangleMeasures.value = next
  }

  function findShapeTypeById(id: string): SelectedShape['type'] | null {
    if (polygonMeasures.value.some((polygon) => polygon.id === id))
      return 'polygon'
    if (rectangleMeasures.value.some((rectangle) => rectangle.id === id))
      return 'rectangle'
    if (circleMeasures.value.some((circle) => circle.id === id)) return 'circle'
    return null
  }

  function flyToShape(id: string, opts: { force?: boolean } = {}): boolean {
    const type = findShapeTypeById(id)
    if (!type) return false
    return focusOverlayInVisibleArea({ type, id }, opts)
  }

  function selectShape(
    sel: { type: SelectedShape['type']; id: string } | null,
  ) {
    selectedShape.value = sel ? { type: sel.type, id: sel.id } : null
  }

  return {
    circleMeasures,
    circlesRef,
    createMeasureId,
    createMeasureName,
    createScreenAlignedRectangle,
    deleteOverlay,
    findShapeTypeById,
    flyToShape,
    focusOverlayInVisibleArea,
    getAveragePoint,
    getOverlaySelectionAtPoint,
    getPointsBoundsCenter,
    getPolygonIdsAtPoint,
    handleFocusOverlay,
    handleSelectOverlay,
    polygonMeasures,
    polygonsRef,
    rectangleMeasures,
    rectanglesRef,
    removePolygonById,
    selectShape,
    selectedShape,
    selectedShapeRef,
    syncMeasureMirrorState,
    syncMeasurementOverlay,
    syncSelectedShape,
    updateBlockColor,
    updateBlockImage,
    updateCircleDiameter,
    updateOverlayName,
  }
}
