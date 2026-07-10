<script setup lang="ts">
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl'
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import { JIBUN_SEED } from '@/features/logged/jibun/constants/jibun-data'
import { formatStartPhysicalJibun } from '@/features/logged/jibun/utils/jibun-utils'
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

interface ParcelLabelMarker {
  element: HTMLDivElement
  level: number
  marker: Marker
}

const LABEL_COLLISION_HEIGHT = 28
const LABEL_COLLISION_WIDTH = 72
const YARD_LONGITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([lng]) => lng)
const YARD_LATITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([, lat]) => lat)
const MAP_BOUNDS: LngLatBoundsLike = [
  [Math.min(...YARD_LONGITUDES), Math.min(...YARD_LATITUDES)],
  [Math.max(...YARD_LONGITUDES), Math.max(...YARD_LATITUDES)],
]

const mapRootRef = useTemplateRef<HTMLDivElement>('mapRoot')
const mapRef = shallowRef<MapLibreMap | null>(null)
const mapReady = shallowRef(false)
const labelMarkerRefs = shallowRef<ParcelLabelMarker[]>([])
const resizeObserverRef = shallowRef<ResizeObserver | null>(null)

const parcelPolygons = createYardJibunPolygons(JIBUN_SEED, {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
})
const jibunByPolygonId = new Map(
  JIBUN_SEED.map((jibun) => [`jibun-${jibun.id}`, jibun]),
)

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
  labelMarkerRefs.value.forEach(({ marker }) => marker.remove())
  labelMarkerRefs.value = []
}

function updateParcelLabelVisibility(map: MapLibreMap) {
  const canvas = map.getCanvas()
  const occupiedPoints: Array<{ x: number; y: number }> = []

  labelMarkerRefs.value
    .slice()
    .sort((left, right) => left.level - right.level)
    .forEach(({ element, marker }) => {
      const point = map.project(marker.getLngLat())
      const isOutside =
        point.x < 0 ||
        point.y < 0 ||
        point.x > canvas.clientWidth ||
        point.y > canvas.clientHeight
      const overlaps = occupiedPoints.some(
        (occupied) =>
          Math.abs(occupied.x - point.x) < LABEL_COLLISION_WIDTH &&
          Math.abs(occupied.y - point.y) < LABEL_COLLISION_HEIGHT,
      )

      element.hidden = isOutside || overlaps
      if (!element.hidden) occupiedPoints.push(point)
    })
}

function addParcelLabelMarkers(map: MapLibreMap) {
  clearParcelLabelMarkers()
  labelMarkerRefs.value = parcelPolygons
    .map((polygon) => {
      const jibun = jibunByPolygonId.get(polygon.id)
      const address = formatStartPhysicalJibun(jibun)
      if (!polygon.name || polygon.points.length === 0 || !address) return null

      const centroid = polygon.points.reduce(
        (acc, point) => ({
          lat: acc.lat + point.lat,
          lng: acc.lng + point.lng,
        }),
        { lat: 0, lng: 0 },
      )
      const element = document.createElement('div')
      element.className =
        'pointer-events-none flex flex-col items-center rounded-sm bg-hw-gray-darker/80 px-1.5 py-0.5 text-center leading-tight text-hw-white-main shadow-sm'

      const name = document.createElement('strong')
      name.className = 'text-c1 font-bold'
      name.textContent = polygon.name

      const physicalAddress = document.createElement('span')
      physicalAddress.className = 'whitespace-nowrap text-[9px] font-normal'
      physicalAddress.textContent = address
      element.append(name, physicalAddress)

      const marker = new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([
          centroid.lng / polygon.points.length,
          centroid.lat / polygon.points.length,
        ])
        .addTo(map)

      return { element, level: jibun?.level ?? 4, marker }
    })
    .filter((entry): entry is ParcelLabelMarker => Boolean(entry))

  updateParcelLabelVisibility(map)
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
      zoom: map.getZoom(),
    })

    createParcelFeatureGroups().forEach((group) => {
      map.addSource(group.sourceId, { type: 'geojson', data: group.data })
      map.addLayer({
        id: group.fillLayerId,
        type: 'fill',
        source: group.sourceId,
        paint: {
          'fill-color': group.fill,
          'fill-opacity': 0.18,
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
    map.on('move', () => updateParcelLabelVisibility(map))
    map.once('idle', () => {
      updateParcelLabelVisibility(map)
      mapReady.value = true
    })
  })

  resizeObserverRef.value = new ResizeObserver(() => {
    map.resize()
    updateParcelLabelVisibility(map)
  })
  resizeObserverRef.value.observe(mapRootRef.value)
}

onMounted(initializeMap)

onUnmounted(() => {
  resizeObserverRef.value?.disconnect()
  resizeObserverRef.value = null
  clearParcelLabelMarkers()
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
