<script setup lang="ts">
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl'
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import { JIBUN_SEED } from '@/features/logged/jibun/constants/jibun-data'
import { getMapLibreStyle } from '@/shared/constants/map'
import {
  YARD_DEFAULT_BEARING,
  YARD_DEFAULT_CENTER,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_JIBUN_KIND_COLORS,
} from '@/shared/constants/map-yard'
import { createYardJibunPolygons } from '@/shared/helpers/map/yard-jibun-polygons'

import type { Feature, MultiPolygon, Position } from 'geojson'

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

const MAP_ZOOM_OFFSET = 1
const VEHICLE_MARKER_LEFT_OFFSET_PX = 36
const YARD_LONGITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([lng]) => lng)
const YARD_LATITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([, lat]) => lat)
const MAP_BOUNDS: LngLatBoundsLike = [
  [Math.min(...YARD_LONGITUDES), Math.min(...YARD_LATITUDES)],
  [Math.max(...YARD_LONGITUDES), Math.max(...YARD_LATITUDES)],
]

const mapRootRef = useTemplateRef<HTMLDivElement>('mapRoot')
const mapRef = shallowRef<MapLibreMap | null>(null)
const mapReady = shallowRef(false)
const labelMarkerRefs = shallowRef<Marker[]>([])
const vehicleMarkerRef = shallowRef<Marker | null>(null)
const resizeObserverRef = shallowRef<ResizeObserver | null>(null)

const parcelPolygons = createYardJibunPolygons(JIBUN_SEED, {
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

function clearParcelLabelMarkers() {
  labelMarkerRefs.value.forEach((marker) => marker.remove())
  labelMarkerRefs.value = []
}

function addParcelLabelMarkers(map: MapLibreMap) {
  clearParcelLabelMarkers()
  labelMarkerRefs.value = parcelPolygons
    .map((polygon) => {
      if (!polygon.name || polygon.points.length === 0) return null

      const center = getPolygonCenter(polygon.points)
      if (!center) return null
      const element = document.createElement('div')
      element.className =
        'rounded-sm bg-hw-gray-darker/75 px-1.5 py-0.5 text-c1 font-bold text-hw-white-main shadow-sm'
      element.textContent = polygon.name

      return new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([center.lng, center.lat])
        .addTo(map)
    })
    .filter((marker): marker is Marker => Boolean(marker))
}

function addVehicleMarker(map: MapLibreMap) {
  vehicleMarkerRef.value?.remove()
  vehicleMarkerRef.value = null

  const r1Polygon = parcelPolygons.find((polygon) => polygon.name === 'R1')
  const center = r1Polygon ? getPolygonCenter(r1Polygon.points) : null
  if (!center) return
  const r1ScreenPoint = map.project(center)
  const vehiclePosition = map.unproject([
    r1ScreenPoint.x - VEHICLE_MARKER_LEFT_OFFSET_PX,
    r1ScreenPoint.y,
  ])

  const element = document.createElement('div')
  element.className = 'dashboard-map-marker dashboard-map-marker--vehicle'
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
    .setLngLat(vehiclePosition)
    .addTo(map)
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
  map.once('load', () => {
    map.jumpTo({
      bearing: YARD_DEFAULT_BEARING,
      pitch: 0,
      zoom: map.getZoom() + MAP_ZOOM_OFFSET,
    })

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

onUnmounted(() => {
  resizeObserverRef.value?.disconnect()
  resizeObserverRef.value = null
  clearParcelLabelMarkers()
  vehicleMarkerRef.value?.remove()
  vehicleMarkerRef.value = null
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
