import { ref, shallowRef, type ShallowRef } from 'vue'

import {
  DEFAULT_GRID_SIZE_METERS,
  DRAWING_SNAP_METERS,
  GRID_SOURCE_ID,
} from '@/shared/constants/map-common'
import {
  buildGridGeoJson,
  createEmptyFeatureCollection,
  gridToWorldFrame,
  latLngToLocalMeters,
  localMetersToLatLng,
  worldToGridFrame,
  type DrawState,
  type LatLng,
  type LocalPoint,
} from '@/shared/helpers/map/grid-utils'
import {
  convertLngLatToLocalPolyPoint,
  createGridBoundaryEditorGeoJson,
  createGridSelectionGeoJson,
  getGridCellSelectionCoordinates,
  normalizeGridBoundaryCoordinates,
} from '@/shared/helpers/map/map-geo-helpers'
import { getPhysicalGridAddress } from '@/shared/helpers/map/physical-address'
import type { YardMapProps } from '@/shared/types/map/yard-map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapPopup = any

const GRID_BOUNDARY_EDITOR_SOURCE_ID = 'echotech-grid-boundary-editor-source'
const GRID_BOUNDARY_EDITOR_FILL_LAYER_ID =
  'echotech-grid-boundary-editor-fill-layer'
const GRID_BOUNDARY_EDITOR_LINE_LAYER_ID =
  'echotech-grid-boundary-editor-line-layer'
const GRID_SELECTION_SOURCE_ID = 'echotech-grid-selection-source'
const GRID_SELECTION_LAYER_ID = 'echotech-grid-selection-layer'

interface UseMapGridOptions {
  infoPopupRef: ShallowRef<MapPopup | null>
  mapRef: ShallowRef<MapInstance | null>
  props: YardMapProps
}

export function useMapGrid({ infoPopupRef, mapRef, props }: UseMapGridOptions) {
  let rafId = 0

  function gridCellMeters(): number {
    return props.gridSizeMeters || DEFAULT_GRID_SIZE_METERS
  }

  function cloneBoundaryCoordinates(): number[][] {
    const raw = props.boundaryCoordinates
    if (!Array.isArray(raw) || raw.length < 4) return []
    return raw.map((coord) => [...coord])
  }

  const origin = ref<LatLng>({ lat: props.center[1], lng: props.center[0] })
  const gridVisible = ref(props.gridVisible ?? false)
  const gridBoundaryCoordinates = ref<number[][]>(
    normalizeGridBoundaryCoordinates(
      cloneBoundaryCoordinates(),
      { lat: props.center[1], lng: props.center[0] },
      props.boundaryRotationDeg,
    ),
  )
  const gridBoundaryCoordinatesRef = shallowRef<number[][]>(
    gridBoundaryCoordinates.value,
  )
  const selectedGridCellCoordinates = ref<number[][]>([])
  const selectedGridCellCoordinatesRef = shallowRef<number[][]>([])
  const rotationDeg = ref(props.gridRotationDeg)
  const offsetX = ref(0)
  const offsetY = ref(props.gridOffsetY)
  const drawStateRef = ref<DrawState>({
    gridWidth: gridCellMeters(),
    gridHeight: gridCellMeters(),
    gridVisible: props.gridVisible ?? false,
    rotationDeg: props.gridRotationDeg,
    offsetX: 0,
    offsetY: props.gridOffsetY,
    origin: { lat: props.center[1], lng: props.center[0] },
  })

  function getNormalizedBoundary(): number[][] {
    return normalizeGridBoundaryCoordinates(
      cloneBoundaryCoordinates(),
      origin.value,
      props.boundaryRotationDeg,
    )
  }

  function pointsToPolyString(points: LatLng[]): string {
    if (!Array.isArray(points) || points.length === 0) return ''
    const boundary = getNormalizedBoundary()
    return points
      .map((point) => {
        const local = convertLngLatToLocalPolyPoint(
          point,
          boundary,
          origin.value,
        )
        if (!local) return null
        return `(${Math.round(local.x)},${Math.round(local.y)})`
      })
      .filter((value): value is string => Boolean(value))
      .join('')
  }

  function syncDrawState() {
    drawStateRef.value = {
      gridWidth: gridCellMeters(),
      gridHeight: gridCellMeters(),
      gridVisible: gridVisible.value,
      rotationDeg: rotationDeg.value,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
      origin: origin.value,
    }
    scheduleGridDraw()
  }

  function syncGridBoundaryCoordinates(next: number[][]) {
    gridBoundaryCoordinatesRef.value = next.map((coord) => [...coord])
    syncGridBoundaryEditorSource()
    scheduleGridDraw()
  }

  function syncSelectedGridCellCoordinates(next: number[][]) {
    selectedGridCellCoordinatesRef.value = next.map((coord) => [...coord])
    const map = mapRef.value
    if (!map) return
    const source = map.getSource(GRID_SELECTION_SOURCE_ID)
    if (source)
      source.setData(
        createGridSelectionGeoJson(
          selectedGridCellCoordinatesRef.value,
        ) as never,
      )
  }

  function ensureGridBoundaryEditorLayers(map: MapInstance) {
    if (!map.getSource(GRID_BOUNDARY_EDITOR_SOURCE_ID)) {
      map.addSource(GRID_BOUNDARY_EDITOR_SOURCE_ID, {
        type: 'geojson',
        data: createGridBoundaryEditorGeoJson(
          gridBoundaryCoordinatesRef.value,
        ) as never,
      })
    }
    if (!map.getLayer(GRID_BOUNDARY_EDITOR_FILL_LAYER_ID)) {
      map.addLayer({
        id: GRID_BOUNDARY_EDITOR_FILL_LAYER_ID,
        type: 'fill',
        source: GRID_BOUNDARY_EDITOR_SOURCE_ID,
        paint: { 'fill-color': '#4df0de', 'fill-opacity': 0.02 },
      })
    }
    if (!map.getLayer(GRID_BOUNDARY_EDITOR_LINE_LAYER_ID)) {
      map.addLayer({
        id: GRID_BOUNDARY_EDITOR_LINE_LAYER_ID,
        type: 'line',
        source: GRID_BOUNDARY_EDITOR_SOURCE_ID,
        paint: {
          'line-color': '#4df0de',
          'line-width': 2.2,
          'line-opacity': 0.95,
        },
      })
    }
  }

  function ensureGridSelectionLayer(map: MapInstance) {
    if (!map.getSource(GRID_SELECTION_SOURCE_ID)) {
      map.addSource(GRID_SELECTION_SOURCE_ID, {
        type: 'geojson',
        data: createGridSelectionGeoJson(
          selectedGridCellCoordinatesRef.value,
        ) as never,
      })
    }
    if (!map.getLayer(GRID_SELECTION_LAYER_ID)) {
      map.addLayer({
        id: GRID_SELECTION_LAYER_ID,
        type: 'line',
        source: GRID_SELECTION_SOURCE_ID,
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
          'line-opacity': 0.95,
        },
      })
    }
  }

  function syncGridBoundaryEditorSource() {
    const source = mapRef.value?.getSource(GRID_BOUNDARY_EDITOR_SOURCE_ID)
    if (source)
      source.setData(
        createGridBoundaryEditorGeoJson(
          gridBoundaryCoordinatesRef.value,
        ) as never,
      )
  }

  function buildGridInfoPopupHtml(lngLat: LatLng) {
    const ds = drawStateRef.value
    const address = getPhysicalGridAddress(
      lngLat,
      ds.origin,
      ds.gridWidth,
      ds.gridHeight,
      gridBoundaryCoordinatesRef.value,
    )
    return `
      <div class="grid-info-popup">
        <div><strong>좌표</strong>${lngLat.lng.toFixed(6)}, ${lngLat.lat.toFixed(6)}</div>
        <div><strong>물리지번</strong>${address || '-'}</div>
      </div>
    `
  }

  function showGridInfoPopup(lngLat: LatLng) {
    const popup = infoPopupRef.value
    const map = mapRef.value
    if (!popup || !map || !lngLat) return
    popup.setLngLat(lngLat).setHTML(buildGridInfoPopupHtml(lngLat)).addTo(map)
  }

  function snapPointToMeter(point: LatLng): LatLng {
    const {
      origin: snapOrigin,
      rotationDeg: rd,
      offsetX: ox,
      offsetY: oy,
    } = drawStateRef.value
    const local = latLngToLocalMeters(point.lat, point.lng, snapOrigin)
    const radians = (rd * Math.PI) / 180
    const grid = worldToGridFrame(local.x - ox, local.y - oy, radians)
    const sU =
      Math.round(grid.u / Math.max(1, DRAWING_SNAP_METERS)) *
      Math.max(1, DRAWING_SNAP_METERS)
    const sV =
      Math.round(grid.v / Math.max(1, DRAWING_SNAP_METERS)) *
      Math.max(1, DRAWING_SNAP_METERS)
    const w = gridToWorldFrame(sU, sV, radians)
    return localMetersToLatLng(w.x + ox, w.y + oy, snapOrigin)
  }

  function getSnappedGridDelta(from: LatLng, to: LatLng): LocalPoint {
    const { origin: snapOrigin, rotationDeg: rd } = drawStateRef.value
    const radians = (rd * Math.PI) / 180
    const fL = latLngToLocalMeters(from.lat, from.lng, snapOrigin)
    const tL = latLngToLocalMeters(to.lat, to.lng, snapOrigin)
    const fG = worldToGridFrame(fL.x, fL.y, radians)
    const tG = worldToGridFrame(tL.x, tL.y, radians)
    const du = tG.u - fG.u
    const dv = tG.v - fG.v
    const sU =
      Math.round(du / Math.max(1, DRAWING_SNAP_METERS)) *
      Math.max(1, DRAWING_SNAP_METERS)
    const sV =
      Math.round(dv / Math.max(1, DRAWING_SNAP_METERS)) *
      Math.max(1, DRAWING_SNAP_METERS)
    return gridToWorldFrame(sU, sV, radians)
  }

  function getGridAddress(lngLat: LatLng): string {
    const { origin: o, gridWidth, gridHeight } = drawStateRef.value
    return getPhysicalGridAddress(
      lngLat,
      o,
      gridWidth,
      gridHeight,
      gridBoundaryCoordinatesRef.value,
    )
  }

  function getSelectedGridCellAt(lngLat: LatLng): number[][] {
    const { origin: o, gridWidth, gridHeight } = drawStateRef.value
    return getGridCellSelectionCoordinates(
      lngLat,
      o,
      gridWidth,
      gridHeight,
      gridBoundaryCoordinatesRef.value,
    )
  }

  function scheduleGridDraw() {
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(drawGrid)
  }

  function drawGrid() {
    const map = mapRef.value
    if (!map || !map.isStyleLoaded() || !map.getSource(GRID_SOURCE_ID)) return
    const ds = drawStateRef.value
    const source = map.getSource(GRID_SOURCE_ID)
    if (!source) return
    if (!ds.gridVisible) {
      source.setData(createEmptyFeatureCollection() as never)
      return
    }
    const canvas = map.getCanvas()
    const corners = [
      map.unproject([0, 0]),
      map.unproject([canvas.width, 0]),
      map.unproject([canvas.width, canvas.height]),
      map.unproject([0, canvas.height]),
    ].map((point: { lat: number; lng: number }) => ({
      lat: point.lat,
      lng: point.lng,
    }))
    const { data } = buildGridGeoJson({
      corners,
      origin: ds.origin,
      gridWidth: ds.gridWidth,
      gridHeight: ds.gridHeight,
      rotationDeg: ds.rotationDeg,
      offsetX: ds.offsetX,
      offsetY: ds.offsetY,
      maskPolygons: [gridBoundaryCoordinatesRef.value].filter(
        (polygon) => polygon.length >= 4,
      ),
    })
    source.setData(data as never)
  }

  function cleanupGrid() {
    cancelAnimationFrame(rafId)
  }

  return {
    cleanupGrid,
    drawStateRef,
    drawGrid,
    ensureGridBoundaryEditorLayers,
    ensureGridSelectionLayer,
    getGridAddress,
    getNormalizedBoundary,
    getSelectedGridCellAt,
    getSnappedGridDelta,
    gridBoundaryCoordinates,
    gridBoundaryCoordinatesRef,
    gridCellMeters,
    gridVisible,
    offsetX,
    offsetY,
    origin,
    pointsToPolyString,
    rotationDeg,
    scheduleGridDraw,
    selectedGridCellCoordinates,
    selectedGridCellCoordinatesRef,
    showGridInfoPopup,
    snapPointToMeter,
    syncDrawState,
    syncGridBoundaryCoordinates,
    syncGridBoundaryEditorSource,
    syncSelectedGridCellCoordinates,
  }
}
