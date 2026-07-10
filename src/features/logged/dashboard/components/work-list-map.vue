<script setup lang="ts">
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
} from 'maplibre-gl'
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import { JIBUN_SEED } from '@/features/logged/jibun/constants/jibun-data'
import { getMapLibreStyle } from '@/shared/constants/map'
import {
  YARD_DEFAULT_CENTER,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_JIBUN_KIND_COLORS,
} from '@/shared/constants/map-yard'
import { createYardJibunPolygons } from '@/shared/helpers/map/yard-jibun-polygons'

import type { FeatureCollection, Polygon } from 'geojson'

interface ParcelProperties {
  id: string
  name: string
  fill: string
}

const PARCEL_SOURCE_ID = 'work-list-jibun'
const PARCEL_FILL_LAYER_ID = 'work-list-jibun-fill'
const PARCEL_LINE_LAYER_ID = 'work-list-jibun-line'
const YARD_LONGITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([lng]) => lng)
const YARD_LATITUDES = YARD_GRID_BOUNDARY_COORDINATES.map(([, lat]) => lat)
const MAP_BOUNDS: LngLatBoundsLike = [
  [Math.min(...YARD_LONGITUDES), Math.min(...YARD_LATITUDES)],
  [Math.max(...YARD_LONGITUDES), Math.max(...YARD_LATITUDES)],
]

const mapRootRef = useTemplateRef<HTMLDivElement>('mapRoot')
const mapRef = shallowRef<MapLibreMap | null>(null)
const resizeObserverRef = shallowRef<ResizeObserver | null>(null)

const parcelPolygons = createYardJibunPolygons(JIBUN_SEED, {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
})

function createParcelFeatureCollection(): FeatureCollection<
  Polygon,
  ParcelProperties
> {
  return {
    type: 'FeatureCollection',
    features: parcelPolygons.map((polygon) => {
      const coordinates = polygon.points.map(({ lng, lat }) => [lng, lat])
      coordinates.push(coordinates[0])
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        properties: {
          id: polygon.id,
          name: polygon.name ?? '',
          fill:
            YARD_JIBUN_KIND_COLORS[polygon.colorKey ?? ''] ??
            YARD_JIBUN_KIND_COLORS.yard,
        },
      }
    }),
  }
}

function initializeMap() {
  if (!mapRootRef.value) return

  const map = new maplibregl.Map({
    container: mapRootRef.value,
    style: getMapLibreStyle('vworld-base'),
    bounds: MAP_BOUNDS,
    fitBoundsOptions: { padding: 24 },
    pitch: 0,
    bearing: 0,
    dragRotate: false,
    touchZoomRotate: false,
    renderWorldCopies: false,
    attributionControl: false,
  })

  mapRef.value = map
  map.once('load', () => {
    map.addSource(PARCEL_SOURCE_ID, {
      type: 'geojson',
      data: createParcelFeatureCollection(),
    })
    map.addLayer({
      id: PARCEL_FILL_LAYER_ID,
      type: 'fill',
      source: PARCEL_SOURCE_ID,
      paint: {
        'fill-color': ['get', 'fill'],
        'fill-opacity': 0.18,
      },
    })
    map.addLayer({
      id: PARCEL_LINE_LAYER_ID,
      type: 'line',
      source: PARCEL_SOURCE_ID,
      paint: {
        'line-color': ['get', 'fill'],
        'line-opacity': 0.9,
        'line-width': 1.5,
      },
    })
  })

  resizeObserverRef.value = new ResizeObserver(() => map.resize())
  resizeObserverRef.value.observe(mapRootRef.value)
}

onMounted(initializeMap)

onUnmounted(() => {
  resizeObserverRef.value?.disconnect()
  resizeObserverRef.value = null
  mapRef.value?.remove()
  mapRef.value = null
})
</script>

<template>
  <section
    class="relative min-h-0 overflow-hidden rounded-sm border border-hw-gray-lighter bg-hw-white-darker"
    aria-label="지번 지도"
  >
    <div ref="mapRoot" class="h-full w-full" />
  </section>
</template>
