<script setup lang="ts">
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl'
import { onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import { useWorkMapExecution } from '@/features/logged/dashboard/composables/use-work-map-execution'
import { ROAD_JIBUN_SEED } from '@/features/logged/dashboard/constants/road-jibun-data'
import {
  WORK_TEST_DEPARTURE_CODE,
  WORK_TEST_DESTINATION_CODE,
} from '@/features/logged/dashboard/constants/work-list'
import type { WorkExecutionPhase } from '@/features/logged/dashboard/types/work-list'
import { createOptimalRoadJibunRoute } from '@/features/logged/dashboard/utils/road-jibun-routing'
import { JIBUN_SEED } from '@/features/logged/jibun/constants/jibun-data'
import { getMapLibreStyle } from '@/shared/constants/map'
import { DEFAULT_GRID_SIZE_METERS } from '@/shared/constants/map-common'
import {
  YARD_DEFAULT_BEARING,
  YARD_DEFAULT_CENTER,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
  YARD_JIBUN_KIND_COLORS,
} from '@/shared/constants/map-yard'
import { normalizeGridBoundaryCoordinates } from '@/shared/helpers/map/map-geo-helpers'
import { getPhysicalGridAddress } from '@/shared/helpers/map/physical-address'
import {
  createYardJibunPolygons,
  createYardRoadJibunPolygons,
} from '@/shared/helpers/map/yard-jibun-polygons'

import type { Feature, MultiPolygon, Position } from 'geojson'

interface Props {
  departureCode?: string
  destinationCode: string
  executionPhase: WorkExecutionPhase
}

const props = withDefaults(defineProps<Props>(), {
  departureCode: '',
  executionPhase: 'waiting',
})

interface ParcelFeatureProperties {
  fill: string
}

interface ParcelFeatureGroup {
  data: Feature<MultiPolygon, ParcelFeatureProperties>
  fill: string
  fillLayerId: string
  lineLayerId: string
  sourceId: string
}

type PhysCell = [number, number]

interface PreferredRoadRoute {
  destinationRoadCell?: PhysCell
  roadWaypoints: PhysCell[]
  startRoadCell?: PhysCell
}

const MAP_ZOOM_OFFSET = 1
const JIBUN_MARKER_SCALE_MIN_ZOOM = 13
const JIBUN_MARKER_SCALE_MAX_ZOOM = 16
const JIBUN_MARKER_MIN_SCALE = 0.55
const JIBUN_MARKER_MAX_SCALE = 1
const ROAD_JIBUN_SOURCE_ID = 'work-list-road-jibun'
const ROAD_JIBUN_FILL_LAYER_ID = 'work-list-road-jibun-fill'
const ROAD_JIBUN_LINE_LAYER_ID = 'work-list-road-jibun-line'
const YARD_LONGITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([lng]) => lng)
const YARD_LATITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([, lat]) => lat)
const MAP_BOUNDS: LngLatBoundsLike = [
  [Math.min(...YARD_LONGITUDES), Math.min(...YARD_LATITUDES)],
  [Math.max(...YARD_LONGITUDES), Math.max(...YARD_LATITUDES)],
]
const YARD_GRID_ORIGIN = {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
}
const YARD_GRID_BOUNDARY = normalizeGridBoundaryCoordinates(
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_ORIGIN,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
)

const mapRootRef = useTemplateRef<HTMLDivElement>('mapRoot')
const mapRef = shallowRef<MapLibreMap | null>(null)
const mapReady = shallowRef(false)
const labelMarkerRefs = shallowRef<Marker[]>([])
const vehicleMarkerRef = shallowRef<Marker | null>(null)
const resizeObserverRef = shallowRef<ResizeObserver | null>(null)
const { attachMapExecution } = useWorkMapExecution({
  departureCode: () => props.departureCode,
  destinationCode: () => props.destinationCode,
  executionPhase: () => props.executionPhase,
})

const parcelPolygons = createYardJibunPolygons(JIBUN_SEED, {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
})
const roadPolygons = createYardRoadJibunPolygons(ROAD_JIBUN_SEED, {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
})

function getPolygonCenter(points: Array<{ lat: number; lng: number }>) {
  if (points.length === 0) return null
  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  )
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  }
}

function getPhysicalCellByCenter(center: { lat: number; lng: number }) {
  const label = getPhysicalGridAddress(
    center,
    YARD_GRID_ORIGIN,
    DEFAULT_GRID_SIZE_METERS,
    DEFAULT_GRID_SIZE_METERS,
    YARD_GRID_BOUNDARY,
  )
  const matched = /^\((\d+),\s*(\d+)\)$/.exec(label)
  if (!matched) return null

  return [Number(matched[1]), Number(matched[2])] satisfies PhysCell
}

function getParcelCenterByCode(code: string) {
  const polygon = parcelPolygons.find((item) => item.name === code)
  return polygon ? getPolygonCenter(polygon.points) : null
}

function getPreferredRoadRoute(
  departureCode: string,
  destinationCode: string,
): PreferredRoadRoute {
  if (!departureCode.startsWith('EM-') || !destinationCode.startsWith('N1-')) {
    return { roadWaypoints: [] }
  }

  return {
    startRoadCell: [26, 65],
    roadWaypoints: [[7, 65]],
    destinationRoadCell: [7, 52],
  }
}

function createParcelFeatureGroups(): ParcelFeatureGroup[] {
  const coordinatesByFill = new Map<string, MultiPolygon['coordinates']>()

  parcelPolygons.forEach((polygon) => {
    const ring: Position[] = polygon.points.map(({ lng, lat }) => [lng, lat])
    if (ring.length < 3) return
    ring.push([...ring[0]])

    const fill =
      YARD_JIBUN_KIND_COLORS[polygon.colorKey ?? ''] ??
      YARD_JIBUN_KIND_COLORS.yard
    const coordinates = coordinatesByFill.get(fill) ?? []
    coordinates.push([ring])
    coordinatesByFill.set(fill, coordinates)
  })

  return [...coordinatesByFill.entries()].map(([fill, coordinates], index) => ({
    sourceId: `work-list-jibun-${index}`,
    fillLayerId: `work-list-jibun-fill-${index}`,
    lineLayerId: `work-list-jibun-line-${index}`,
    fill,
    data: {
      type: 'Feature',
      geometry: { type: 'MultiPolygon', coordinates },
      properties: { fill },
    },
  }))
}

function createRoadJibunFeature(): Feature<
  MultiPolygon,
  Record<string, never>
> {
  const coordinates: MultiPolygon['coordinates'] = []

  roadPolygons.forEach((polygon) => {
    const ring: Position[] = polygon.points.map(({ lng, lat }) => [lng, lat])
    if (ring.length < 3) return
    ring.push([...ring[0]])
    coordinates.push([ring])
  })

  return {
    type: 'Feature',
    geometry: { type: 'MultiPolygon', coordinates },
    properties: {},
  }
}

function addRoadJibunLayers(map: MapLibreMap) {
  if (!map.getSource(ROAD_JIBUN_SOURCE_ID)) {
    map.addSource(ROAD_JIBUN_SOURCE_ID, {
      type: 'geojson',
      data: createRoadJibunFeature(),
    })
  }
  if (!map.getLayer(ROAD_JIBUN_FILL_LAYER_ID)) {
    map.addLayer({
      id: ROAD_JIBUN_FILL_LAYER_ID,
      type: 'fill',
      source: ROAD_JIBUN_SOURCE_ID,
      paint: {
        'fill-color': '#111111',
        'fill-opacity': 0.34,
      },
    })
  }
  if (!map.getLayer(ROAD_JIBUN_LINE_LAYER_ID)) {
    map.addLayer({
      id: ROAD_JIBUN_LINE_LAYER_ID,
      type: 'line',
      source: ROAD_JIBUN_SOURCE_ID,
      paint: {
        'line-color': '#111111',
        'line-opacity': 0,
        'line-width': 0,
      },
    })
  }
}

function clearParcelLabelMarkers() {
  labelMarkerRefs.value.forEach((marker) => marker.remove())
  labelMarkerRefs.value = []
}

function getResponsiveJibunMarkerScale(zoom: number) {
  if (!Number.isFinite(zoom)) return JIBUN_MARKER_MAX_SCALE
  if (zoom <= JIBUN_MARKER_SCALE_MIN_ZOOM) return JIBUN_MARKER_MIN_SCALE
  if (zoom >= JIBUN_MARKER_SCALE_MAX_ZOOM) return JIBUN_MARKER_MAX_SCALE

  const progress =
    (zoom - JIBUN_MARKER_SCALE_MIN_ZOOM) /
    (JIBUN_MARKER_SCALE_MAX_ZOOM - JIBUN_MARKER_SCALE_MIN_ZOOM)
  return (
    JIBUN_MARKER_MIN_SCALE +
    progress * (JIBUN_MARKER_MAX_SCALE - JIBUN_MARKER_MIN_SCALE)
  )
}

function updateResponsiveJibunMarkerScale() {
  const map = mapRef.value
  const scale = getResponsiveJibunMarkerScale(
    map?.getZoom() ?? JIBUN_MARKER_SCALE_MAX_ZOOM,
  )

  labelMarkerRefs.value.forEach((marker) => {
    marker
      .getElement()
      .style.setProperty('--dashboard-jibun-marker-scale', scale.toFixed(3))
  })
}

function addParcelLabelMarkers(map: MapLibreMap) {
  clearParcelLabelMarkers()
  labelMarkerRefs.value = parcelPolygons
    .map((polygon) => {
      if (!polygon.name || polygon.points.length === 0) return null

      const center = getPolygonCenter(polygon.points)
      if (!center) return null
      const element = document.createElement('div')
      element.className = 'dashboard-jibun-label'
      const body = document.createElement('span')
      body.className = 'dashboard-jibun-label__body'
      body.textContent = polygon.name
      element.append(body)

      return new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([center.lng, center.lat])
        .addTo(map)
    })
    .filter((marker): marker is Marker => Boolean(marker))
  updateResponsiveJibunMarkerScale()
}

function addVehicleMarker(map: MapLibreMap) {
  vehicleMarkerRef.value?.remove()
  vehicleMarkerRef.value = null

  const departureCode = props.departureCode || WORK_TEST_DEPARTURE_CODE
  const destinationCode = props.destinationCode || WORK_TEST_DESTINATION_CODE
  const startCenter = getParcelCenterByCode(departureCode)
  const destinationCenter = getParcelCenterByCode(destinationCode)
  if (!startCenter || !destinationCenter) return
  const startCoordinate: [number, number] = [startCenter.lng, startCenter.lat]
  const destinationCoordinate: [number, number] = [
    destinationCenter.lng,
    destinationCenter.lat,
  ]
  const startPhys = getPhysicalCellByCenter(startCenter)
  const destinationPhys = getPhysicalCellByCenter(destinationCenter)
  const preferredRoadRoute = getPreferredRoadRoute(
    departureCode,
    destinationCode,
  )
  const routeCoordinates =
    startPhys && destinationPhys
      ? createOptimalRoadJibunRoute({
          startLngLat: startCoordinate,
          startPhys,
          destinationLngLat: destinationCoordinate,
          destinationPhys,
          preferredStartRoadCell: preferredRoadRoute.startRoadCell,
          preferredRoadWaypoints: preferredRoadRoute.roadWaypoints,
          preferredDestinationRoadCell: preferredRoadRoute.destinationRoadCell,
        })
      : null

  const element = document.createElement('div')
  element.className = 'dashboard-map-marker dashboard-map-marker--vehicle'
  element.style.zIndex = '3'
  element.title = '차량'

  const waves = Array.from({ length: 3 }, () => {
    const wave = document.createElement('span')
    wave.className = 'dashboard-map-marker__wave'
    return wave
  })
  element.append(...waves)

  const tag = document.createElement('span')
  tag.className = 'dashboard-map-marker__tag'
  const icon = document.createElement('i')
  icon.className = 'ti ti-truck'
  icon.setAttribute('aria-hidden', 'true')
  tag.append(icon)
  element.append(tag)

  vehicleMarkerRef.value = new maplibregl.Marker({
    element,
    anchor: 'bottom',
  })
    .setLngLat(startCoordinate)
    .addTo(map)

  attachMapExecution({
    map,
    vehicleMarker: vehicleMarkerRef.value,
    start: startCoordinate,
    destination: destinationCoordinate,
    routeCoordinates: routeCoordinates ?? undefined,
  })
}

function initializeMap() {
  if (!mapRootRef.value) return

  const map = new maplibregl.Map({
    container: mapRootRef.value,
    style: getMapLibreStyle('vworld-base'),
    bounds: MAP_BOUNDS,
    fitBoundsOptions: {
      bearing: YARD_DEFAULT_BEARING,
      padding: 24,
    },
    pitch: 0,
    bearing: YARD_DEFAULT_BEARING,
    dragRotate: false,
    touchZoomRotate: false,
    renderWorldCopies: false,
    attributionControl: false,
  })

  mapRef.value = map
  map.on('zoom', updateResponsiveJibunMarkerScale)
  map.once('load', () => {
    map.jumpTo({
      bearing: YARD_DEFAULT_BEARING,
      pitch: 0,
      zoom: map.getZoom() + MAP_ZOOM_OFFSET,
    })

    addRoadJibunLayers(map)
    createParcelFeatureGroups().forEach((group) => {
      map.addSource(group.sourceId, { type: 'geojson', data: group.data })
      map.addLayer({
        id: group.fillLayerId,
        type: 'fill',
        source: group.sourceId,
        paint: {
          'fill-color': group.fill,
          'fill-opacity': 0.22,
        },
      })
      map.addLayer({
        id: group.lineLayerId,
        type: 'line',
        source: group.sourceId,
        paint: {
          'line-color': group.fill,
          'line-opacity': 0.9,
          'line-width': 1.5,
        },
      })
    })

    addParcelLabelMarkers(map)
    addVehicleMarker(map)
    map.once('idle', () => {
      mapReady.value = true
    })
  })

  resizeObserverRef.value = new ResizeObserver(() => map.resize())
  resizeObserverRef.value.observe(mapRootRef.value)
}

onMounted(initializeMap)

watch([() => props.departureCode, () => props.destinationCode], () => {
  if (!mapRef.value || !mapReady.value) return
  addVehicleMarker(mapRef.value)
})

onUnmounted(() => {
  resizeObserverRef.value?.disconnect()
  resizeObserverRef.value = null
  clearParcelLabelMarkers()
  vehicleMarkerRef.value?.remove()
  vehicleMarkerRef.value = null
  mapRef.value?.off('zoom', updateResponsiveJibunMarkerScale)
  mapRef.value?.remove()
  mapRef.value = null
  mapReady.value = false
})
</script>

<template>
  <section
    class="relative min-h-0 overflow-hidden rounded-sm border border-hw-gray-lighter bg-hw-white-darker"
    aria-label="지번 지도"
    :aria-busy="!mapReady"
  >
    <div ref="mapRoot" class="h-full w-full" />
  </section>
</template>
