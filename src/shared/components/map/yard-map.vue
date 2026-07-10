<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import blockDefaultPatternUrl from '@/shared/assets/map/block-default.png'
import MapControls from '@/shared/components/map/map-controls.vue'
import { useMapDrawingControls } from '@/shared/composables/map/use-map-drawing-controls'
import { useMapDrawingSession } from '@/shared/composables/map/use-map-drawing-session'
import { useMapEntityMarkers } from '@/shared/composables/map/use-map-entity-markers'
import { useMapFixedOverlays } from '@/shared/composables/map/use-map-fixed-overlays'
import { useMapGrid } from '@/shared/composables/map/use-map-grid'
import { useMapMeasurements } from '@/shared/composables/map/use-map-measurements'
import { useMapOverlayDomMarkers } from '@/shared/composables/map/use-map-overlay-dom-markers'
import { useMapOverlayItems } from '@/shared/composables/map/use-map-overlay-items'
import {
  rotateRectanglePoints,
  useMapRectangleEditing,
} from '@/shared/composables/map/use-map-rectangle-editing'
import { useMapRectanglePlacements } from '@/shared/composables/map/use-map-rectangle-placements'
import { DEFAULT_MAP_STYLE, getMapLibreStyle } from '@/shared/constants/map'
import {
  DEFAULT_BLOCK_COLOR,
  DEFAULT_GRID_SIZE_METERS,
  MEASURE_FILL_LAYER_ID,
  MEASURE_LINE_LAYER_ID,
  MEASURE_MODES,
} from '@/shared/constants/map-common'
import {
  applyKoreanLabels,
  ensureGridLayer,
  type LatLng,
} from '@/shared/helpers/map/grid-utils'
import {
  createCircleCoordinates,
  ensureMeasurementLayers,
  formatMeters,
  formatSquareMeters,
  type RectangleShape,
  type SelectedShape,
} from '@/shared/helpers/map/measurement-utils'
import type { YardMapProps } from '@/shared/types/map/yard-map'

// MapLibre 지도 런타임에 야드 격자, 도형 편집, 업무 marker 기능을 조립한 컴포넌트다.
// MapLibre 초기화, 회전 격자, 도형 측정/편집, 마커, 이미지 오버레이, 외부 포커스 요청을 연결한다.
// 부지(야드) 좌표·색상·계층 같은 도메인 데이터는 props로 주입받고, 이 파일은 그 메커니즘만 소유한다.
// 좌표 변환과 GeoJSON 생성은 @/shared/helpers/map/* 유틸로 분리한다.

const props = withDefaults(defineProps<YardMapProps>(), {
  bearing: 0,
  gridRotationDeg: 0,
  gridOffsetY: 0,
  gridSizeMeters: DEFAULT_GRID_SIZE_METERS,
  boundaryCoordinates: () => [],
  boundaryRotationDeg: 0,
  polygons: () => [],
  colorByKey: null,
  rectanglePlacements: () => [],
  imageOverlays: () => [],
  mapStyle: DEFAULT_MAP_STYLE,
  fixedOverlayVisible: false,
  gridVisible: false,
  parcelVisible: true,
  blockVisible: false,
  mapMarkers: () => [],
  livePosition: null,
  selectedShapeId: null,
  focusRequest: null,
  entityFocusRequest: null,
  routeFocusRequest: null,
  pickMode: false,
  showFixedOverlayLabels: true,
})

const emit = defineEmits<{
  pickLocation: [payload: { label: string; phys: [number, number] }]
  // grid-off 클릭 시 커서 아래 폴리곤 id 목록을 올린다(선택 규칙은 호출자 소유).
  polygonsAtPoint: [payload: { ids: string[]; point: LatLng }]
  // 사각형/원 등 도형 클릭 선택을 알린다.
  shapeClick: [payload: SelectedShape | null]
  // grid-on 클릭 시 선택된 격자 셀 좌표를 올린다.
  gridCellPick: [payload: { coordinates: number[][] }]
  // 폴리곤 그리기 완료 payload.
  drawComplete: [
    payload: {
      drawKind: string | null
      points: LatLng[]
      polyString: string
      polygonId: string
      removePolygon: () => void
    },
  ]
}>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapRuntimeModule = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapMarker = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapPopup = any

// 지도 인스턴스와 DOM marker는 Vue가 깊게 추적할 필요가 없어 shallowRef로 보관한다.
const mapShellRef = ref<HTMLElement | null>(null)
const mapRootRef = ref<HTMLElement | null>(null)
const mapLibreGlRef = shallowRef<MapRuntimeModule | null>(null)
const mapRef = shallowRef<MapInstance | null>(null)
const markerRef = shallowRef<MapMarker | null>(null)
const infoPopupRef = shallowRef<MapPopup | null>(null)
const gridBoundaryResizeMarkerRef = shallowRef<MapMarker | null>(null)

const {
  cleanupGrid,
  drawStateRef,
  ensureGridBoundaryEditorLayers,
  ensureGridSelectionLayer,
  getGridAddress,
  getNormalizedBoundary,
  getSelectedGridCellAt,
  getSnappedGridDelta,
  gridBoundaryCoordinates,
  gridCellMeters,
  gridVisible,
  offsetX,
  offsetY,
  origin,
  pointsToPolyString,
  rotationDeg,
  scheduleGridDraw,
  selectedGridCellCoordinates,
  showGridInfoPopup,
  snapPointToMeter,
  syncDrawState,
  syncGridBoundaryCoordinates,
  syncGridBoundaryEditorSource,
  syncSelectedGridCellCoordinates,
} = useMapGrid({
  infoPopupRef,
  mapRef,
  props,
})

interface RotateState {
  rectangleId: string
  centerPoint: LatLng
  centerProjected: { x: number; y: number }
  initialAngle: number
  initialPoints: LatLng[]
}
const rotateStateRef = shallowRef<RotateState | null>(null)

const draftBlockColorRef = ref(DEFAULT_BLOCK_COLOR)
const defaultBlockImageSrcRef = ref<string>(blockDefaultPatternUrl)
const rectanglePlacements = computed(() => props.rectanglePlacements ?? [])

const mapStyle = ref(props.mapStyle)
const errorMessage = ref('')
const mapReady = ref(false)
const parcelVisible = ref(props.parcelVisible)
const blockVisible = ref(props.blockVisible)
const defaultBlockImageSrc = ref<string>(blockDefaultPatternUrl)
const draftBlockColor = ref(DEFAULT_BLOCK_COLOR)
const lastFocusedRequestRef = ref<string | null>(null)

const {
  applyFixedOverlayLayout,
  cleanupFixedOverlayToast,
  ensureFixedImageOverlayLayers,
  ensureFixedOverlayLabelLayer,
  fixedOverlayOpacity,
  fixedOverlayToastMessage,
  fixedOverlayVisible,
  showFixedOverlayToast,
  syncFixedOverlaySources,
  updateFixedOverlays,
} = useMapFixedOverlays({
  getShowLabels: () => props.showFixedOverlayLabels,
  initialOverlays: props.imageOverlays,
  initialVisible: props.fixedOverlayVisible,
  mapRef,
})

const {
  activateMeasureMode,
  cancelDraw,
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
} = useMapDrawingSession({
  clearInfoPopup: () => infoPopupRef.value?.remove(),
  defaultBlockImageSrcRef,
  draftBlockColorRef,
  drawStateRef,
  emitDrawComplete: (payload) => emit('drawComplete', payload),
  emitGridCellPick: (payload) => emit('gridCellPick', payload),
  emitPickLocation: (payload) => emit('pickLocation', payload),
  emitPolygonsAtPoint: (payload) => emit('polygonsAtPoint', payload),
  emitShapeClick: (payload) => emit('shapeClick', payload),
  getGridAddress,
  getPickMode: () => props.pickMode,
  getSelectedGridCellAt,
  getSnappedGridDelta,
  mapRef,
  pointsToPolyString,
  selectedGridCellCoordinates,
  showFixedOverlayToast,
  showGridInfoPopup,
  snapPointToMeter,
})

const {
  circleMeasures,
  circlesRef,
  createMeasureId,
  createMeasureName,
  createScreenAlignedRectangle,
  deleteOverlay,
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
  syncMeasureMirrorState,
  syncMeasurementOverlay,
  syncSelectedShape,
  updateBlockColor,
  updateBlockImage,
  updateCircleDiameter,
  updateOverlayName,
} = useMapMeasurements({
  blockVisible,
  drawActiveKindRef,
  getColorByKey: () => props.colorByKey,
  mapRef,
  measureRef,
  parcelVisible,
  polygons: props.polygons,
})

setDrawingSessionDependencies({
  circleMeasures,
  circlesRef,
  createMeasureId,
  createMeasureName,
  createScreenAlignedRectangle,
  getOverlaySelectionAtPoint,
  getPolygonIdsAtPoint,
  polygonMeasures,
  polygonsRef,
  rectangleMeasures,
  rectanglesRef,
  removePolygonById,
  selectedShape,
  syncMeasurementOverlay,
})

const {
  cleanupEntityMarkers,
  handleMapEntityFocusRequest,
  handleLivePosition,
  handleMapMarkers,
  handleMapRouteFocusRequest,
} = useMapEntityMarkers({
  mapRef,
  mapLibreGlRef,
  mapReady,
  props,
  gridCellMeters,
  getNormalizedBoundary,
  origin,
})

const {
  ensurePlacementCellsLayer,
  syncPlacementCellsSource,
  syncRectanglePlacements,
} = useMapRectanglePlacements({
  defaultRectangleImageSrc: defaultBlockImageSrcRef,
  getNormalizedBoundary,
  gridCellMeters,
  mapRef,
  origin,
  rectangleMeasures,
  rectanglePlacements,
  rectanglesRef,
})

const {
  cleanupOverlayDomMarkers,
  syncBlockImageMarkers,
  syncBlockRotateHandle,
  syncOverlayNameMarkers,
} = useMapOverlayDomMarkers({
  blockVisible,
  circleMeasures,
  getAveragePoint,
  getPointsBoundsCenter,
  mapLibreGlRef,
  mapRef,
  parcelVisible,
  polygonMeasures,
  rectangleMeasures,
  selectedShape,
  startRectangleRotation,
})

// 아래 watcher들은 Vue 상태 변경을 MapLibre source/layer/marker에 반영하는 동기화 지점이다.
// MapLibre 객체 자체는 반응형이 아니므로 값이 바뀔 때마다 명시적으로 sync 함수를 호출한다.
watch(
  () => props.mapStyle,
  (value) => {
    mapStyle.value = value || DEFAULT_MAP_STYLE
  },
)

watch(
  () => props.fixedOverlayVisible,
  (value) => {
    fixedOverlayVisible.value = value
  },
)

watch(
  () => props.gridVisible,
  (value) => {
    gridVisible.value = value
  },
)

watch(
  () => props.parcelVisible,
  (value) => {
    parcelVisible.value = value
  },
)

watch(
  () => props.blockVisible,
  (value) => {
    blockVisible.value = value
  },
)

watch(
  [circleMeasures, polygonMeasures, rectangleMeasures],
  () => {
    syncMeasureMirrorState()
    syncMeasurementOverlay()
    syncOverlayNameMarkers()
    syncBlockImageMarkers()
    syncBlockRotateHandle()
    syncMeasurementSummary()
  },
  { deep: true },
)

watch(selectedShape, (value) => {
  syncSelectedShape(value)
  syncMeasurementOverlay()
  syncBlockImageMarkers()
  syncBlockRotateHandle()
})

watch(draftBlockColor, (value) => {
  draftBlockColorRef.value = value
})

watch(defaultBlockImageSrc, (value) => {
  defaultBlockImageSrcRef.value = value
})

watch([parcelVisible, blockVisible], () => {
  syncMeasurementOverlay()
  syncOverlayNameMarkers()
  syncBlockImageMarkers()
  syncBlockRotateHandle()
})

watch(measureMode, (value) => {
  measureRef.mode = value
  syncMeasurementOverlay()
  const map = mapRef.value
  if (!map) return
  const canvas = map.getCanvas()
  canvas.style.cursor = value === MEASURE_MODES.none ? '' : 'crosshair'
  if (value === MEASURE_MODES.none) map.doubleClickZoom.enable()
  else map.doubleClickZoom.disable()
})

watch(drawActiveKind, (value) => {
  drawActiveKindRef.value = value
})

watch(
  () => props.imageOverlays,
  (next) => updateFixedOverlays(next),
  { deep: true },
)

watch(
  gridBoundaryCoordinates,
  (next) => {
    syncGridBoundaryCoordinates(next)
  },
  { deep: true },
)

watch(
  selectedGridCellCoordinates,
  (next) => {
    syncSelectedGridCellCoordinates(next)
  },
  { deep: true },
)

watch(
  () => props.polygons,
  (value) => {
    polygonMeasures.value = Array.isArray(value) ? [...value] : []
  },
)

watch(
  () => props.selectedShapeId,
  (value) => {
    selectedShape.value = value ? { type: 'polygon', id: value } : null
  },
)

watch(
  [
    mapReady,
    polygonMeasures,
    () => props.selectedShapeId,
    () => props.focusRequest,
  ],
  () => {
    const shapeId = props.selectedShapeId
    if (!shapeId || !mapReady.value) return
    const req = props.focusRequest
    const requestKey = req ? `${req.requestedAt}` : null
    const force = Boolean(
      requestKey && lastFocusedRequestRef.value !== requestKey,
    )
    const didFocus = focusOverlayInVisibleArea(
      { type: 'polygon', id: shapeId },
      { force },
    )
    if (force && didFocus && requestKey)
      lastFocusedRequestRef.value = requestKey
  },
)

watch(
  [mapReady, rectanglePlacements],
  ([isMapReady]) => {
    if (!isMapReady) return
    syncRectanglePlacements()
  },
  { deep: true },
)

watch(
  () => props.entityFocusRequest,
  (req) => {
    handleMapEntityFocusRequest(req ?? null)
  },
  { immediate: false },
)

watch(
  () => props.livePosition,
  () => {
    handleLivePosition()
  },
)

watch(
  () => props.mapMarkers,
  () => {
    handleMapMarkers()
  },
  { deep: true },
)

watch(
  () => props.routeFocusRequest,
  (req) => {
    handleMapRouteFocusRequest(req ?? null)
  },
)

watch([gridVisible, rotationDeg, offsetX, offsetY, origin], () => {
  syncDrawState()
})

watch(
  [
    fixedOverlayVisible,
    fixedOverlayOpacity,
    () => props.showFixedOverlayLabels,
  ],
  () => {
    applyFixedOverlayLayout()
  },
)

watch(mapStyle, (next) => {
  const map = mapRef.value
  if (!map) return
  mapReady.value = false
  map.setStyle(getMapLibreStyle(next))
})

watch(drawActiveKind, (mode) => {
  if (!mode) {
    window.removeEventListener('keydown', onDrawKeyDown)
    return
  }
  window.addEventListener('keydown', onDrawKeyDown)
})

function onDrawKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') cancelDraw()
}

onMounted(async () => {
  try {
    if (!mapRootRef.value) return
    mapLibreGlRef.value = maplibregl

    const map = new maplibregl.Map({
      container: mapRootRef.value,
      style: getMapLibreStyle(props.mapStyle),
      center: props.center,
      zoom: 17,
      bearing: props.bearing,
      pitch: 0,
      antialias: true,
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.keyboard.enable()
    if ((map.keyboard as { disableRotation?: () => void }).disableRotation) {
      ;(map.keyboard as { disableRotation?: () => void }).disableRotation!()
    }
    infoPopupRef.value = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'left',
      offset: 18,
    })

    mapRef.value = map
    markerRef.value = null

    const syncStatus = () => {
      if (map.getPitch() !== 0) map.setPitch(0)
    }

    const handleStyleLoad = () => {
      // 스타일 변경 후에는 custom source/layer가 사라지므로 필요한 레이어를 모두 다시 보장한다.
      applyKoreanLabels(map)
      ensureGridLayer(map)
      ensureGridBoundaryEditorLayers(map)
      ensureGridSelectionLayer(map)
      ensureFixedImageOverlayLayers(map)
      ensureFixedOverlayLabelLayer(map)
      ensureMeasurementLayers(map)
      ensurePlacementCellsLayer(map)
      syncStatus()
      scheduleGridDraw()
      syncMeasurementOverlay()
      syncGridBoundaryEditorSource()
      ensureGridSelectionLayer(map)
      syncFixedOverlaySources()
      syncOverlayNameMarkers()
      syncBlockImageMarkers()
      syncPlacementCellsSource()
      syncBlockRotateHandle()
      mapReady.value = true
    }

    map.on('load', handleStyleLoad)
    map.on('style.load', handleStyleLoad)
    map.on('move', syncStatus)
    map.on('rotate', syncStatus)
    map.on('move', scheduleGridDraw)
    map.on('rotate', scheduleGridDraw)
    map.on('zoom', scheduleGridDraw)
    map.on('move', syncBlockImageMarkers)
    map.on('rotate', syncBlockImageMarkers)
    map.on('zoom', syncBlockImageMarkers)
    map.on('move', syncBlockRotateHandle)
    map.on('rotate', syncBlockRotateHandle)
    map.on('zoom', syncBlockRotateHandle)
    map.on('click', handleMeasureClick)
    map.on('mousemove', handleMeasureMouseMove)
    map.on('dblclick', handleMeasureDoubleClick)
    map.on('mousedown', MEASURE_FILL_LAYER_ID, handleMeasureDragStart)
    map.on('mousedown', MEASURE_LINE_LAYER_ID, handleMeasureDragStart)
    map.on('mousemove', handleMeasureDragMove)
    map.on('mouseup', handleMeasureDragEnd)
  } catch (error) {
    errorMessage.value = `MapLibre GL JS 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
  }
})

onBeforeUnmount(() => {
  // Marker/Popup은 DOM을 직접 붙이므로 컴포넌트 해제 시 명시적으로 제거한다.
  cleanupGrid()
  cleanupOverlayDomMarkers()
  gridBoundaryResizeMarkerRef.value?.remove()
  gridBoundaryResizeMarkerRef.value = null
  cleanupFixedOverlayToast()
  infoPopupRef.value?.remove()
  infoPopupRef.value = null
  markerRef.value?.remove()
  markerRef.value = null
  cleanupEntityMarkers()
  mapLibreGlRef.value = null
  mapRef.value?.remove()
  mapRef.value = null
  window.removeEventListener('keydown', onDrawKeyDown)
})

const { shapeItems, parcelItems, selectedOverlayLabel } = useMapOverlayItems({
  circleMeasures,
  polygonMeasures,
  rectangleMeasures,
  selectedShape,
})

const { rotateRectangle, updateRectangleDimension } = useMapRectangleEditing({
  rectangleMeasures,
  rectanglesRef,
})

function getClientPointAngle(
  client: { x: number; y: number },
  centerProj: { x: number; y: number },
) {
  const rect = mapRef.value?.getCanvasContainer().getBoundingClientRect()
  if (!rect) return 0
  return Math.atan2(
    client.y - rect.top - centerProj.y,
    client.x - rect.left - centerProj.x,
  )
}

function startRectangleRotation(
  rectangle: RectangleShape,
  clientPoint: { x: number; y: number },
) {
  const map = mapRef.value
  if (!map || rectangle.points.length < 4) return
  const c = getAveragePoint(rectangle.points)
  if (!c) return
  const proj = map.project([c.lng, c.lat])
  rotateStateRef.value = {
    rectangleId: rectangle.id,
    centerPoint: c,
    centerProjected: proj,
    initialAngle: getClientPointAngle(clientPoint, proj),
    initialPoints: rectangle.points.map((p) => ({ ...p })),
  }
  map.dragPan.disable()
  window.addEventListener('mousemove', handleRectangleRotateMove)
  window.addEventListener('mouseup', handleRectangleRotateEnd)
}

function handleRectangleRotateMove(event: MouseEvent) {
  const rs = rotateStateRef.value
  if (!rs) return
  const nextAngle = getClientPointAngle(
    { x: event.clientX, y: event.clientY },
    rs.centerProjected,
  )
  const delta = rs.initialAngle - nextAngle
  const next = rectanglesRef.value.map((r) => {
    if (r.id !== rs.rectangleId) return r
    return {
      ...r,
      points: rotateRectanglePoints(rs.initialPoints, rs.centerPoint, delta),
    }
  })
  rectanglesRef.value = next
  rectangleMeasures.value = next
}

function handleRectangleRotateEnd() {
  if (!rotateStateRef.value) return
  rotateStateRef.value = null
  window.removeEventListener('mousemove', handleRectangleRotateMove)
  window.removeEventListener('mouseup', handleRectangleRotateEnd)
  mapRef.value?.dragPan.enable()
}

function focusUserLocation() {
  const map = mapRef.value
  if (!map) return

  if (!navigator.geolocation) {
    showFixedOverlayToast('이 브라우저에서는 현재 위치를 가져올 수 없습니다.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      map.easeTo({
        center: [longitude, latitude],
        zoom: Math.max(map.getZoom(), 17),
        pitch: 0,
        duration: 900,
      })
    },
    () => {
      showFixedOverlayToast('현재 위치 권한을 허용한 뒤 다시 시도하세요.')
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 10_000,
    },
  )
}

function resetMapDirection() {
  const map = mapRef.value
  if (!map) return
  map.easeTo({
    bearing: props.bearing,
    pitch: 0,
    duration: 500,
  })
}

function zoomInMap() {
  const map = mapRef.value
  if (!map) return
  map.zoomIn({ duration: 180 })
}

function zoomOutMap() {
  const map = mapRef.value
  if (!map) return
  map.zoomOut({ duration: 180 })
}

async function toggleMapFullscreen() {
  const container = mapShellRef.value
  if (!container) return
  if (document.fullscreenElement) await document.exitFullscreen()
  else await container.requestFullscreen()
  window.setTimeout(() => mapRef.value?.resize(), 120)
}

function updateDefaultBlockImage(src: string) {
  if (!src) return
  defaultBlockImageSrcRef.value = src
  defaultBlockImageSrc.value = src
}

// suppress unused warnings for some helper utilities
void formatMeters
void formatSquareMeters
void createCircleCoordinates

const drawingControls = useMapDrawingControls({
  measureMode,
  drawActiveKind,
  drawPointsCount,
  draftBlockColor,
  defaultBlockImageSrc,
  selectedShape,
  activateMeasureMode,
  cancelDraw,
  deleteOverlay,
  resetDraw,
  handleFocusOverlay,
  handleSelectOverlay,
  startPolygonDraw,
  updateBlockColor,
  updateBlockImage,
  updateCircleDiameter,
  updateDefaultBlockImage,
  updateOverlayName,
  updateRectangleDimension,
})

// 호출자(래퍼)가 그리기/선택/포커스를 명령형으로 제어하기 위한 API.
defineExpose({
  startPolygonDraw,
  startCircleDraw: drawingControls.startCircleDraw,
  startRectangleDraw: drawingControls.startRectangleDraw,
  startImageBlockDraw: drawingControls.startImageBlockDraw,
  cancelDraw,
  resetDraw,
  flyToShape,
  selectShape,
  removePolygon: removePolygonById,
  drawing: drawingControls,
  rotateRectangle,
  drawActiveKind,
  drawPointsCount,
})
</script>

<template>
  <div ref="mapShellRef" class="relative w-full h-full">
    <main
      ref="mapRootRef"
      class="map-root map-root--map w-full h-full"
      aria-label="MapLibre 지도"
    />

    <MapControls
      @locate-user="focusUserLocation"
      @secondary-action="resetMapDirection"
      @toggle-fullscreen="toggleMapFullscreen"
      @zoom-in="zoomInMap"
      @zoom-out="zoomOutMap"
    />

    <!-- 그리기 툴바/힌트는 도메인 컴포넌트를 래퍼가 주입한다. -->
    <slot
      name="toolbar"
      :active-kind="drawActiveKind"
      :points-count="drawPointsCount"
      :drawing="drawingControls"
    />
    <slot
      name="hint"
      :active-kind="drawActiveKind"
      :points-count="drawPointsCount"
      :measure-hint="measureHint"
      :measure-mode="measureMode"
    />

    <div
      v-if="fixedOverlayToastMessage"
      class="pointer-events-none absolute left-1/2 bottom-3 z-40 max-w-[min(360px,calc(100vw-24px))] -translate-x-1/2 px-4 py-3 border border-[rgba(144,240,183,0.2)] rounded-[12px] bg-[rgba(19,32,38,0.92)] text-center text-[13px] font-bold leading-[1.4] text-hw-white-dark shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
    >
      {{ fixedOverlayToastMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="absolute right-3 bottom-3 max-w-[min(560px,calc(100vw-24px))] px-3.5 py-3 border border-[rgba(255,112,112,0.45)] rounded-[12px] bg-[rgba(70,18,18,0.86)] text-[13px] leading-[1.5] text-hw-red-lighter"
    >
      {{ errorMessage }}
    </div>

    <!-- 페이지별 오버레이 주입 지점(검색 패널, 범례 등) -->
    <slot
      :shape-items="shapeItems"
      :drawing="drawingControls"
      :parcel-items="parcelItems"
      :selected-overlay-label="selectedOverlayLabel"
    />
  </div>
</template>
