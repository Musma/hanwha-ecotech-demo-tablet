<script setup lang="ts">
import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import yard1ImageUrl from '@/shared/assets/map/yard1.png'
import yard2ImageUrl from '@/shared/assets/map/yard2.png'
import { getMapLibreStyle } from '@/shared/constants/map'
import { DEFAULT_GRID_SIZE_METERS } from '@/shared/constants/map-common'
import {
  YARD_DEFAULT_BEARING,
  YARD_DEFAULT_CENTER,
  YARD_DEFAULT_GRID_ROTATION,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
  YARD_JIBUN_KIND_COLORS,
} from '@/shared/constants/map-yard'
import { buildGridGeoJson } from '@/shared/helpers/map/grid-utils'
import { normalizeGridBoundaryCoordinates } from '@/shared/helpers/map/map-geo-helpers'
import type {
  MapEntityMarkerItem,
  YardMapProps,
} from '@/shared/types/map/yard-map'

import type { FeatureCollection, Geometry } from 'geojson'

type DashboardGeoJsonFeatureCollection = FeatureCollection<
  Geometry,
  Record<string, unknown>
>

interface Props {
  fixedOverlayVisible: boolean
  gridVisible?: boolean
  mapStyle: string
  mapMarkers?: MapEntityMarkerItem[]
  polygons?: YardMapProps['polygons']
  roadPolygons?: YardMapProps['roadPolygons']
}

const props = withDefaults(defineProps<Props>(), {
  gridVisible: false,
  mapMarkers: () => [],
  polygons: () => [],
  roadPolygons: () => [],
})

const MAP_VIEW_COORDINATES: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [127.587555, 34.899999],
  [127.600754, 34.908457],
  [127.605362, 34.90362],
  [127.592163, 34.895162],
]

const FIT_BOUNDS_PADDING = 20
const JIBUN_MARKER_SCALE_MIN_ZOOM = 13
const JIBUN_MARKER_SCALE_MAX_ZOOM = 16
const JIBUN_MARKER_MIN_SCALE = 0.55
const JIBUN_MARKER_MAX_SCALE = 1
const YARD_GRID_SOURCE_ID = 'dashboard-yard-grid'
const YARD_GRID_LAYER_ID = 'dashboard-yard-grid'
const JIBUN_POLYGON_SOURCE_ID = 'dashboard-jibun-polygons'
const JIBUN_POLYGON_FILL_LAYER_ID = 'dashboard-jibun-polygon-fill'
const JIBUN_POLYGON_LINE_LAYER_ID = 'dashboard-jibun-polygon-line'
const ROAD_JIBUN_SOURCE_ID = 'dashboard-road-jibun-polygons'
const ROAD_JIBUN_FILL_LAYER_ID = 'dashboard-road-jibun-polygon-fill'
const ROAD_JIBUN_LINE_LAYER_ID = 'dashboard-road-jibun-polygon-line'

type ImageOverlayCoordinates = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
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

const YARD_CAD_IMAGE_OVERLAYS = [
  {
    sourceId: 'yard-cad-image-2yard',
    layerId: 'yard-cad-image-2yard',
    label: '2YARD',
    url: yard2ImageUrl,
    coordinates: [
      [127.587585, 34.899842],
      [127.590244, 34.901574],
      [127.594853, 34.896818],
      [127.592158, 34.895121],
    ] satisfies ImageOverlayCoordinates,
  },
  {
    sourceId: 'yard-cad-image-1yard',
    layerId: 'yard-cad-image-1yard',
    label: '1YARD',
    url: yard1ImageUrl,
    coordinates: [
      [127.590772, 34.901531],
      [127.601043, 34.90818],
      [127.603523, 34.905675],
      [127.593202, 34.899038],
    ] satisfies ImageOverlayCoordinates,
  },
]

function createGridFeatureCollection(): DashboardGeoJsonFeatureCollection {
  const corners = YARD_GRID_BOUNDARY.map(([lng, lat]) => ({ lat, lng }))
  const { data } = buildGridGeoJson({
    corners,
    origin: YARD_GRID_ORIGIN,
    gridWidth: DEFAULT_GRID_SIZE_METERS,
    gridHeight: DEFAULT_GRID_SIZE_METERS,
    rotationDeg: YARD_DEFAULT_GRID_ROTATION,
    maskPolygons: YARD_GRID_BOUNDARY.length >= 4 ? [YARD_GRID_BOUNDARY] : [],
  })
  return data as DashboardGeoJsonFeatureCollection
}

const mapRootRef = shallowRef<HTMLDivElement | null>(null)
const mapRef = shallowRef<MapLibreMap | null>(null)
const markerRefs = shallowRef<Marker[]>([])
const labelMarkerRefs = shallowRef<Marker[]>([])
const mapLoaded = shallowRef(false)

const mapBounds = computed<LngLatBoundsLike>(() => {
  const lngs = MAP_VIEW_COORDINATES.map(([lng]) => lng)
  const lats = MAP_VIEW_COORDINATES.map(([, lat]) => lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
})

function createEmptyFeatureCollection(): DashboardGeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [],
  }
}

function createPolygonFeatureCollection(): DashboardGeoJsonFeatureCollection {
  const features: DashboardGeoJsonFeatureCollection['features'] = []

  for (const polygon of props.polygons) {
    if (polygon.points.length < 3) continue
    const coordinates = polygon.points.map((point) => [point.lng, point.lat])
    coordinates.push(coordinates[0])
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
      properties: {
        id: polygon.id,
        name: polygon.name ?? '',
        fill: YARD_JIBUN_KIND_COLORS[polygon.colorKey ?? ''] ?? '#94A3B8',
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

function createRoadJibunFeatureCollection(): DashboardGeoJsonFeatureCollection {
  const features: DashboardGeoJsonFeatureCollection['features'] = []

  for (const polygon of props.roadPolygons) {
    if (polygon.points.length < 3) continue
    const coordinates = polygon.points.map((point) => [point.lng, point.lat])
    coordinates.push(coordinates[0])
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
      properties: {
        id: polygon.id,
        name: polygon.name ?? '',
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

function ensureRoadJibunLayers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  if (!map.getSource(ROAD_JIBUN_SOURCE_ID)) {
    map.addSource(ROAD_JIBUN_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection(),
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
  if (map.getLayer(ROAD_JIBUN_LINE_LAYER_ID)) {
    map.setPaintProperty(ROAD_JIBUN_LINE_LAYER_ID, 'line-opacity', 0)
    map.setPaintProperty(ROAD_JIBUN_LINE_LAYER_ID, 'line-width', 0)
  }
}

function updateRoadJibunLayers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  ensureRoadJibunLayers()
  ;(map.getSource(ROAD_JIBUN_SOURCE_ID) as GeoJSONSource | undefined)?.setData(
    createRoadJibunFeatureCollection(),
  )
}

function ensureDashboardOverlayLayers() {
  const map = mapRef.value
  if (!map) return

  for (const overlay of YARD_CAD_IMAGE_OVERLAYS) {
    if (!map.getSource(overlay.sourceId)) {
      map.addSource(overlay.sourceId, {
        type: 'image',
        url: overlay.url,
        coordinates: overlay.coordinates,
      })
    }
    if (!map.getLayer(overlay.layerId)) {
      map.addLayer({
        id: overlay.layerId,
        type: 'raster',
        source: overlay.sourceId,
        paint: {
          'raster-opacity': 1,
        },
      })
    }
  }

  if (!map.getSource(YARD_GRID_SOURCE_ID)) {
    map.addSource(YARD_GRID_SOURCE_ID, {
      type: 'geojson',
      data: createGridFeatureCollection(),
    })
  }
  if (!map.getLayer(YARD_GRID_LAYER_ID)) {
    map.addLayer({
      id: YARD_GRID_LAYER_ID,
      type: 'line',
      source: YARD_GRID_SOURCE_ID,
      layout: {
        visibility: 'none',
      },
      paint: {
        'line-color': 'rgba(77, 240, 222, 0.58)',
        'line-width': 1.4,
      },
    })
  }
}

function updateCadVisibility() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  for (const overlay of YARD_CAD_IMAGE_OVERLAYS) {
    if (!map.getLayer(overlay.layerId)) continue
    map.setLayoutProperty(
      overlay.layerId,
      'visibility',
      props.fixedOverlayVisible ? 'visible' : 'none',
    )
  }
}

function updateGridVisibility() {
  const map = mapRef.value
  if (!map || !mapLoaded.value || !map.getLayer(YARD_GRID_LAYER_ID)) return
  map.setLayoutProperty(
    YARD_GRID_LAYER_ID,
    'visibility',
    props.gridVisible ? 'visible' : 'none',
  )
}

function ensureJibunLayers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  if (!map.getSource(JIBUN_POLYGON_SOURCE_ID)) {
    map.addSource(JIBUN_POLYGON_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection(),
    })
  }
  if (!map.getLayer(JIBUN_POLYGON_FILL_LAYER_ID)) {
    map.addLayer({
      id: JIBUN_POLYGON_FILL_LAYER_ID,
      type: 'fill',
      source: JIBUN_POLYGON_SOURCE_ID,
      paint: {
        'fill-color': ['get', 'fill'],
        'fill-opacity': 0.22,
      },
    })
  }
  if (!map.getLayer(JIBUN_POLYGON_LINE_LAYER_ID)) {
    map.addLayer({
      id: JIBUN_POLYGON_LINE_LAYER_ID,
      type: 'line',
      source: JIBUN_POLYGON_SOURCE_ID,
      paint: {
        'line-color': ['get', 'fill'],
        'line-opacity': 0.9,
        'line-width': 1.5,
      },
    })
  }
}

function updateJibunLayers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  ensureJibunLayers()
  ;(
    map.getSource(JIBUN_POLYGON_SOURCE_ID) as GeoJSONSource | undefined
  )?.setData(createPolygonFeatureCollection())
  updateLabelMarkers()
}

function clearMarkers() {
  markerRefs.value.forEach((marker) => marker.remove())
  markerRefs.value = []
}

function clearLabelMarkers() {
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

function updateLabelMarkers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  clearLabelMarkers()
  labelMarkerRefs.value = props.polygons
    .map((polygon) => {
      if (polygon.points.length === 0 || !polygon.name) return null
      const centroid = polygon.points.reduce(
        (acc, point) => ({
          lat: acc.lat + point.lat,
          lng: acc.lng + point.lng,
        }),
        { lat: 0, lng: 0 },
      )
      const el = document.createElement('div')
      el.className = 'dashboard-jibun-label'
      const body = document.createElement('span')
      body.className = 'dashboard-jibun-label__body'
      body.textContent = polygon.name
      el.append(body)
      return new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([
          centroid.lng / polygon.points.length,
          centroid.lat / polygon.points.length,
        ])
        .addTo(map)
    })
    .filter((marker): marker is Marker => Boolean(marker))
  updateResponsiveJibunMarkerScale()
}

function updateMarkers() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  clearMarkers()
  markerRefs.value = props.mapMarkers
    .map((marker) => {
      if (!Array.isArray(marker.phys) || marker.phys.length < 2) return null
      const el = document.createElement('div')
      el.className =
        'flex h-7 min-w-7 items-center justify-center rounded-full bg-hw-orange-main px-2 text-c1 font-bold text-hw-white-main shadow-sm'
      el.textContent = marker.label ?? marker.name ?? ''
      return new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([marker.phys[0], marker.phys[1]])
        .addTo(map)
    })
    .filter((marker): marker is Marker => Boolean(marker))
}

function initializeMap() {
  if (!mapRootRef.value) return

  const map = new maplibregl.Map({
    container: mapRootRef.value,
    style: getMapLibreStyle(props.mapStyle),
    bounds: mapBounds.value,
    fitBoundsOptions: {
      bearing: YARD_DEFAULT_BEARING,
      padding: FIT_BOUNDS_PADDING,
    },
    bearing: YARD_DEFAULT_BEARING,
    pitch: 0,
    dragRotate: false,
    touchZoomRotate: false,
  })

  mapRef.value = map
  map.on('zoom', updateResponsiveJibunMarkerScale)
  map.once('load', () => {
    map.jumpTo({
      bearing: YARD_DEFAULT_BEARING,
      pitch: 0,
      zoom: map.getZoom(),
    })
    mapLoaded.value = true
    ensureDashboardOverlayLayers()
    updateCadVisibility()
    updateGridVisibility()
    updateRoadJibunLayers()
    updateJibunLayers()
    updateMarkers()
  })
}

function syncMapStyle() {
  const map = mapRef.value
  if (!map || !mapLoaded.value) return

  mapLoaded.value = false
  map.setStyle(getMapLibreStyle(props.mapStyle))
  map.once('style.load', () => {
    map.jumpTo({
      bearing: YARD_DEFAULT_BEARING,
      pitch: 0,
      zoom: map.getZoom(),
    })
    mapLoaded.value = true
    ensureDashboardOverlayLayers()
    updateCadVisibility()
    updateGridVisibility()
    updateRoadJibunLayers()
    updateJibunLayers()
    updateMarkers()
  })
}

watch(
  () => props.fixedOverlayVisible,
  () => updateCadVisibility(),
)

watch(
  () => props.mapStyle,
  () => syncMapStyle(),
)

watch(
  () => props.gridVisible,
  () => updateGridVisibility(),
)

watch(
  () => props.polygons,
  () => updateJibunLayers(),
  { deep: true },
)

watch(
  () => props.roadPolygons,
  () => updateRoadJibunLayers(),
  { deep: true },
)

watch(
  () => props.mapMarkers,
  () => updateMarkers(),
  { deep: true },
)

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  clearMarkers()
  clearLabelMarkers()
  mapRef.value?.off('zoom', updateResponsiveJibunMarkerScale)
  mapRef.value?.remove()
  mapRef.value = null
  mapLoaded.value = false
})
</script>

<template>
  <div
    class="relative flex min-w-0 min-h-0 overflow-hidden rounded-sm border border-hw-white-darker bg-hw-gray-darker"
  >
    <div ref="mapRootRef" class="h-full w-full" />

    <slot />
  </div>
</template>
