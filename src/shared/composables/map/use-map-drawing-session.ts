import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

import { MEASURE_MODES, type MeasureMode } from '@/shared/constants/map-common'
import type { LatLng, LocalPoint } from '@/shared/helpers/map/grid-utils'
import { isPointInsidePolygon } from '@/shared/helpers/map/map-geo-helpers'
import {
  haversineDistanceMeters,
  offsetLatLng,
  type CircleShape,
  type PolygonShape,
  type RectangleShape,
  type SelectedShape,
} from '@/shared/helpers/map/measurement-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any

interface MeasureRuntimeState {
  mode: MeasureMode
  points: LatLng[]
  previewPoint: LatLng | null
}

interface DragState {
  measureId: string
  shapeType: 'circle' | 'rectangle' | 'polygon'
  startPoint: LatLng
  initialCircle: CircleShape | null
  initialPolygon: PolygonShape | null
  initialRectangle: RectangleShape | null
  moved: boolean
}

interface DrawingSessionDependencies {
  circleMeasures: Ref<CircleShape[]>
  circlesRef: Ref<CircleShape[]>
  createMeasureId: (prefix: string) => string
  createMeasureName: (kind: 'polygon' | 'block') => string
  createScreenAlignedRectangle: (
    id: string,
    start: LatLng,
    end: LatLng,
  ) => { id: string; points: LatLng[] } | null
  getOverlaySelectionAtPoint: (event: unknown) => {
    type: SelectedShape['type']
    id: string
  } | null
  getPolygonIdsAtPoint: (event: unknown) => string[]
  polygonMeasures: Ref<PolygonShape[]>
  polygonsRef: Ref<PolygonShape[]>
  rectangleMeasures: Ref<RectangleShape[]>
  rectanglesRef: Ref<RectangleShape[]>
  removePolygonById: (id: string) => void
  selectedShape: Ref<SelectedShape | null>
  syncMeasurementOverlay: () => void
}

interface UseMapDrawingSessionOptions {
  clearInfoPopup: () => void
  defaultBlockImageSrcRef: Ref<string>
  draftBlockColorRef: Ref<string>
  drawStateRef: Ref<{ gridVisible: boolean }>
  emitDrawComplete: (payload: {
    drawKind: string | null
    points: LatLng[]
    polyString: string
    polygonId: string
    removePolygon: () => void
  }) => void
  emitGridCellPick: (payload: { coordinates: number[][] }) => void
  emitPickLocation: (payload: { label: string; phys: [number, number] }) => void
  emitPolygonsAtPoint: (payload: { ids: string[]; point: LatLng }) => void
  emitShapeClick: (payload: SelectedShape | null) => void
  getGridAddress: (lngLat: LatLng) => string
  getPickMode: () => boolean
  getSelectedGridCellAt: (lngLat: LatLng) => number[][]
  getSnappedGridDelta: (from: LatLng, to: LatLng) => LocalPoint
  mapRef: ShallowRef<MapInstance | null>
  pointsToPolyString: (points: LatLng[]) => string
  selectedGridCellCoordinates: Ref<number[][]>
  showFixedOverlayToast: (message: string) => void
  showGridInfoPopup: (lngLat: LatLng) => void
  snapPointToMeter: (point: LatLng) => LatLng
}

export function useMapDrawingSession({
  clearInfoPopup,
  defaultBlockImageSrcRef,
  draftBlockColorRef,
  drawStateRef,
  emitDrawComplete,
  emitGridCellPick,
  emitPickLocation,
  emitPolygonsAtPoint,
  emitShapeClick,
  getGridAddress,
  getPickMode,
  getSelectedGridCellAt,
  getSnappedGridDelta,
  mapRef,
  pointsToPolyString,
  selectedGridCellCoordinates,
  showFixedOverlayToast,
  showGridInfoPopup,
  snapPointToMeter,
}: UseMapDrawingSessionOptions) {
  const measureRef: MeasureRuntimeState = {
    mode: MEASURE_MODES.none,
    points: [],
    previewPoint: null,
  }
  const measureMode = ref<MeasureMode>(MEASURE_MODES.none)
  const measureHint = ref('')
  const drawActiveKind = ref<string | null>(null)
  const drawActiveKindRef = ref<string | null>(null)
  const drawConstraintRef = shallowRef<LatLng[] | null>(null)
  const drawPointsCount = ref(0)
  const dragStateRef = shallowRef<DragState | null>(null)
  const dragSuppressUntilRef = ref(0)
  const depsRef = shallowRef<DrawingSessionDependencies | null>(null)

  function setDrawingSessionDependencies(deps: DrawingSessionDependencies) {
    depsRef.value = deps
  }

  function syncMeasurementSummary() {
    const { mode } = measureRef
    if (mode === MEASURE_MODES.none) {
      measureHint.value = ''
      return
    }
    if (mode === MEASURE_MODES.rectangle || mode === MEASURE_MODES.imageBlock) {
      measureHint.value =
        '첫 클릭은 시작점, 두 번째 클릭은 대각선 반대편 점입니다.'
      return
    }
    if (mode === MEASURE_MODES.polygon) {
      measureHint.value = '점을 찍고 시작점을 다시 누르면 다각형이 완성됩니다.'
      return
    }
    if (mode === MEASURE_MODES.circle) {
      measureHint.value =
        '첫 클릭은 중심, 두 번째 클릭은 원의 크기를 결정합니다.'
    }
  }

  function clearMeasurement({
    keepMode = true,
    clearCompleted = false,
  }: { keepMode?: boolean; clearCompleted?: boolean } = {}) {
    const deps = depsRef.value
    measureRef.mode = keepMode ? measureRef.mode : MEASURE_MODES.none
    measureRef.points = []
    measureRef.previewPoint = null
    if (deps && clearCompleted) {
      deps.circlesRef.value = []
      deps.polygonsRef.value = []
      deps.rectanglesRef.value = []
      deps.circleMeasures.value = []
      deps.polygonMeasures.value = []
      deps.rectangleMeasures.value = []
      deps.selectedShape.value = null
    }
    if (!keepMode) measureMode.value = MEASURE_MODES.none
    deps?.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  function stopDrawingMode() {
    const deps = depsRef.value
    measureRef.mode = MEASURE_MODES.none
    measureRef.points = []
    measureRef.previewPoint = null
    measureMode.value = MEASURE_MODES.none
    deps?.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  function startPolygonDraw({
    kind = null,
    constraintBoundary = null,
  }: {
    kind?: string | null
    constraintBoundary?: LatLng[] | null
  } = {}) {
    drawConstraintRef.value =
      Array.isArray(constraintBoundary) && constraintBoundary.length >= 3
        ? constraintBoundary
        : null
    measureRef.mode = MEASURE_MODES.polygon
    measureRef.points = []
    measureRef.previewPoint = null
    measureMode.value = MEASURE_MODES.polygon
    drawActiveKind.value = kind ?? null
    drawActiveKindRef.value = drawActiveKind.value
    drawPointsCount.value = 0
    depsRef.value?.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  function cancelDraw() {
    stopDrawingMode()
    drawConstraintRef.value = null
    drawActiveKind.value = null
    drawActiveKindRef.value = null
    drawPointsCount.value = 0
  }

  function resetDraw() {
    clearMeasurement({ keepMode: true })
    drawPointsCount.value = 0
  }

  function activateMeasureMode(nextMode: MeasureMode) {
    if (nextMode === measureRef.mode) {
      clearMeasurement({ keepMode: false })
      return
    }
    measureRef.mode = nextMode
    measureRef.points = []
    measureRef.previewPoint = null
    measureMode.value = nextMode
    depsRef.value?.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  function getDrawingConstraintBoundary(): LatLng[] | null {
    return drawConstraintRef.value
  }

  function isNearFirstPoint(candidate: LatLng): boolean {
    const map = mapRef.value
    const first = measureRef.points[0]
    if (!map || !first) return false
    const f = map.project([first.lng, first.lat])
    const c = map.project([candidate.lng, candidate.lat])
    return Math.hypot(f.x - c.x, f.y - c.y) <= 14
  }

  function commitPolygon(rawPoints: LatLng[]): boolean {
    const deps = depsRef.value
    if (!deps) return false
    const completed = [...rawPoints]
    if (completed.length < 3) return false
    const activeKind = drawActiveKindRef.value
    if (activeKind) {
      const constraintBoundary = getDrawingConstraintBoundary()
      if (
        constraintBoundary &&
        completed.some(
          (point) => !isPointInsidePolygon(point, constraintBoundary),
        )
      ) {
        showFixedOverlayToast('제약 경계를 벗어나 등록할 수 없습니다')
        return false
      }
    }
    const nextPolygon: PolygonShape = {
      id: deps.createMeasureId('polygon'),
      name: deps.createMeasureName('polygon'),
      points: completed,
      ...(activeKind ? { colorKey: activeKind } : {}),
    }
    deps.polygonsRef.value = [...deps.polygonsRef.value, nextPolygon]
    deps.polygonMeasures.value = deps.polygonsRef.value
    deps.selectedShape.value = { type: 'polygon', id: nextPolygon.id }
    stopDrawingMode()
    drawConstraintRef.value = null
    if (activeKind) {
      drawActiveKind.value = null
      drawActiveKindRef.value = null
      drawPointsCount.value = 0
      const polygonId = nextPolygon.id
      emitDrawComplete({
        drawKind: activeKind,
        points: completed,
        polyString: pointsToPolyString(completed),
        polygonId,
        removePolygon: () => deps.removePolygonById(polygonId),
      })
    }
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMeasureClick(event: any) {
    const deps = depsRef.value
    if (!deps || dragStateRef.value || Date.now() < dragSuppressUntilRef.value)
      return
    if (getPickMode()) {
      const address = getGridAddress(event.lngLat)
      showGridInfoPopup(event.lngLat)
      const matched = address ? address.match(/(-?\d+)\s*,\s*(-?\d+)/) : null
      if (matched) {
        emitPickLocation({
          label: address,
          phys: [parseInt(matched[1], 10), parseInt(matched[2], 10)],
        })
      }
      return
    }
    const { mode, points } = measureRef
    if (mode === MEASURE_MODES.none) {
      const { gridVisible: gv } = drawStateRef.value
      const overlaySelection = deps.getOverlaySelectionAtPoint(event)
      if (
        overlaySelection &&
        (overlaySelection.type === 'rectangle' ||
          overlaySelection.type === 'circle')
      ) {
        deps.selectedShape.value = overlaySelection
        emitShapeClick(overlaySelection)
        selectedGridCellCoordinates.value = []
        clearInfoPopup()
        return
      }
      if (!gv) {
        const polygonIds = deps.getPolygonIdsAtPoint(event)
        if (polygonIds.length > 0) {
          emitPolygonsAtPoint({
            ids: polygonIds,
            point: { lat: event.lngLat.lat, lng: event.lngLat.lng },
          })
        } else {
          deps.selectedShape.value = null
          emitShapeClick(null)
        }
        selectedGridCellCoordinates.value = []
        clearInfoPopup()
        return
      }
      deps.selectedShape.value = overlaySelection
      emitShapeClick(overlaySelection)
      selectedGridCellCoordinates.value = getSelectedGridCellAt(event.lngLat)
      emitGridCellPick({ coordinates: selectedGridCellCoordinates.value })
      showGridInfoPopup(event.lngLat)
      return
    }

    const clickedPoint = snapPointToMeter({
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    })

    if (mode === MEASURE_MODES.circle) {
      if (points.length === 0) {
        measureRef.points = [clickedPoint]
        measureRef.previewPoint = clickedPoint
      } else {
        const radius = haversineDistanceMeters(points[0], clickedPoint)
        const nextCircle: CircleShape = {
          id: deps.createMeasureId('circle'),
          name: deps.createMeasureName('block'),
          color: draftBlockColorRef.value,
          center: points[0],
          edgePoint: clickedPoint,
          radiusMeters: radius,
          widthMeters: radius * 2,
          heightMeters: radius * 2,
        }
        deps.circlesRef.value = [...deps.circlesRef.value, nextCircle]
        deps.circleMeasures.value = deps.circlesRef.value
        deps.selectedShape.value = { type: 'circle', id: nextCircle.id }
        stopDrawingMode()
        return
      }
    } else if (
      mode === MEASURE_MODES.rectangle ||
      mode === MEASURE_MODES.imageBlock
    ) {
      if (points.length === 0) {
        measureRef.points = [clickedPoint]
        measureRef.previewPoint = clickedPoint
      } else {
        const nextRect = deps.createScreenAlignedRectangle(
          deps.createMeasureId('rectangle'),
          points[0],
          clickedPoint,
        )
        if (!nextRect) return
        const rect: RectangleShape = {
          ...nextRect,
          name: deps.createMeasureName('block'),
          color: draftBlockColorRef.value,
          ...(mode === MEASURE_MODES.imageBlock
            ? { imageSrc: defaultBlockImageSrcRef.value }
            : {}),
        }
        deps.rectanglesRef.value = [...deps.rectanglesRef.value, rect]
        deps.rectangleMeasures.value = deps.rectanglesRef.value
        deps.selectedShape.value = { type: 'rectangle', id: rect.id }
        stopDrawingMode()
        return
      }
    } else if (mode === MEASURE_MODES.polygon) {
      if (points.length >= 3 && isNearFirstPoint(clickedPoint)) {
        commitPolygon(points)
        return
      }
      if (drawActiveKindRef.value) {
        const constraintBoundary = getDrawingConstraintBoundary()
        if (
          constraintBoundary &&
          !isPointInsidePolygon(clickedPoint, constraintBoundary)
        ) {
          showFixedOverlayToast('제약 경계를 벗어날 수 없습니다')
          return
        }
      }
      measureRef.points = [...points, clickedPoint]
      measureRef.previewPoint = null
      if (drawActiveKindRef.value)
        drawPointsCount.value = measureRef.points.length
    } else {
      measureRef.points = [...points, clickedPoint]
      measureRef.previewPoint = null
    }

    deps.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMeasureMouseMove(event: any) {
    const deps = depsRef.value
    const { mode, points } = measureRef
    if (
      !deps ||
      dragStateRef.value ||
      mode === MEASURE_MODES.none ||
      points.length === 0
    )
      return
    let preview: LatLng | null = snapPointToMeter({
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    })
    if (drawActiveKindRef.value) {
      const constraintBoundary = getDrawingConstraintBoundary()
      if (
        constraintBoundary &&
        !isPointInsidePolygon(preview, constraintBoundary)
      )
        preview = null
    }
    measureRef.previewPoint = preview
    deps.syncMeasurementOverlay()
    syncMeasurementSummary()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMeasureDoubleClick(event: any) {
    const deps = depsRef.value
    const { mode, points } = measureRef
    if (!deps || mode === MEASURE_MODES.none) return
    event.preventDefault?.()
    if (
      mode === MEASURE_MODES.polygon &&
      drawActiveKindRef.value &&
      points.length >= 3
    ) {
      commitPolygon(points)
      return
    }
    if (
      (mode === MEASURE_MODES.rectangle ||
        mode === MEASURE_MODES.imageBlock ||
        mode === MEASURE_MODES.polygon) &&
      points.length >= 2
    ) {
      measureRef.previewPoint = null
      deps.syncMeasurementOverlay()
      syncMeasurementSummary()
    }
  }

  function translateCircle(
    circle: CircleShape,
    dx: number,
    dy: number,
  ): CircleShape {
    return {
      ...circle,
      center: offsetLatLng(circle.center, dx, dy),
      edgePoint: circle.edgePoint
        ? offsetLatLng(circle.edgePoint, dx, dy)
        : undefined,
      radiusMeters: circle.radiusMeters,
    }
  }

  function translatePolygon(
    polygon: PolygonShape,
    dx: number,
    dy: number,
  ): PolygonShape {
    return {
      ...polygon,
      points: polygon.points.map((point) => offsetLatLng(point, dx, dy)),
    }
  }

  function translateRectangle(
    rectangle: RectangleShape,
    dx: number,
    dy: number,
  ): RectangleShape {
    return {
      ...rectangle,
      points: rectangle.points.map((point) => offsetLatLng(point, dx, dy)),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMeasureDragStart(event: any) {
    const deps = depsRef.value
    const feature = event.features?.[0]
    if (!deps || !feature?.properties?.draggable) return
    dragStateRef.value = {
      measureId: String(feature.properties.measureId),
      shapeType: feature.properties.shapeType,
      startPoint: { lat: event.lngLat.lat, lng: event.lngLat.lng },
      initialCircle:
        feature.properties.shapeType === 'circle'
          ? (deps.circlesRef.value.find(
              (circle) => circle.id === feature.properties.measureId,
            ) ?? null)
          : null,
      initialPolygon:
        feature.properties.shapeType === 'polygon'
          ? (deps.polygonsRef.value.find(
              (polygon) => polygon.id === feature.properties.measureId,
            ) ?? null)
          : null,
      initialRectangle:
        feature.properties.shapeType === 'rectangle'
          ? (deps.rectanglesRef.value.find(
              (rectangle) => rectangle.id === feature.properties.measureId,
            ) ?? null)
          : null,
      moved: false,
    }
    deps.selectedShape.value = {
      type: feature.properties.shapeType,
      id: String(feature.properties.measureId),
    }
    mapRef.value?.dragPan.disable()
    const canvas = mapRef.value?.getCanvas()
    if (canvas) canvas.style.cursor = 'grabbing'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMeasureDragMove(event: any) {
    const deps = depsRef.value
    const ds = dragStateRef.value
    if (!deps || !ds) return
    const cur = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    const { x: dx, y: dy } = getSnappedGridDelta(ds.startPoint, cur)
    dragStateRef.value = { ...ds, moved: true }
    if (ds.shapeType === 'circle') {
      const next = deps.circlesRef.value.map((circle) =>
        circle.id === ds.measureId && ds.initialCircle
          ? translateCircle(ds.initialCircle, dx, dy)
          : circle,
      )
      deps.circlesRef.value = next
      deps.circleMeasures.value = next
      return
    }
    if (ds.shapeType === 'polygon') {
      const next = deps.polygonsRef.value.map((polygon) =>
        polygon.id === ds.measureId && ds.initialPolygon
          ? translatePolygon(ds.initialPolygon, dx, dy)
          : polygon,
      )
      deps.polygonsRef.value = next
      deps.polygonMeasures.value = next
      return
    }
    if (ds.shapeType === 'rectangle') {
      const next = deps.rectanglesRef.value.map((rectangle) =>
        rectangle.id === ds.measureId && ds.initialRectangle
          ? translateRectangle(ds.initialRectangle, dx, dy)
          : rectangle,
      )
      deps.rectanglesRef.value = next
      deps.rectangleMeasures.value = next
    }
  }

  function handleMeasureDragEnd() {
    if (!dragStateRef.value) return
    const didMove = dragStateRef.value.moved
    dragStateRef.value = null
    if (didMove) dragSuppressUntilRef.value = Date.now() + 150
    const map = mapRef.value
    if (!map) return
    map.dragPan.enable()
    map.getCanvas().style.cursor =
      measureMode.value === MEASURE_MODES.none ? '' : 'crosshair'
  }

  return {
    activateMeasureMode,
    cancelDraw,
    commitPolygon,
    drawActiveKind,
    drawActiveKindRef,
    drawPointsCount,
    handleMeasureClick,
    handleMeasureDoubleClick,
    handleMeasureDragEnd,
    handleMeasureDragMove,
    handleMeasureDragStart,
    handleMeasureMouseMove,
    measureHint,
    measureMode,
    measureRef,
    resetDraw,
    setDrawingSessionDependencies,
    startPolygonDraw,
    syncMeasurementSummary,
  }
}
