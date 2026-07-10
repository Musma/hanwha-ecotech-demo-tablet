import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type Marker,
} from 'maplibre-gl'
import { onUnmounted, watch } from 'vue'

import type { WorkExecutionPhase } from '@/features/logged/dashboard/types/work-list'
import { YARD_DEFAULT_BEARING } from '@/shared/constants/map-yard'

import type { Feature, FeatureCollection, LineString } from 'geojson'

export type MapCoordinate = [number, number]

interface WorkMapExecutionOptions {
  departureCode: () => string
  destinationCode: () => string
  executionPhase: () => WorkExecutionPhase
  objectCode: () => string
}

interface MapExecutionContext {
  destination: MapCoordinate
  map: MapLibreMap
  start: MapCoordinate
  vehicleMarker: Marker
}

const ROUTE_SOURCE_ID = 'work-execution-route-source'
const ROUTE_CASING_LAYER_ID = 'work-execution-route-casing'
const ROUTE_LINE_LAYER_ID = 'work-execution-route-line'
const VEHICLE_MOVEMENT_DURATION_MS = 12_000
const EMPTY_ROUTE_DATA: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [],
}

export function useWorkMapExecution(options: WorkMapExecutionOptions) {
  let context: MapExecutionContext | null = null
  let animationFrameId: number | null = null
  let taskMarker: Marker | null = null
  let routeEndpointMarkers: Marker[] = []

  function cancelMovement() {
    if (animationFrameId === null) return
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  function clearTaskMarker() {
    taskMarker?.remove()
    taskMarker = null
  }

  function clearRouteEndpointMarkers() {
    routeEndpointMarkers.forEach((marker) => marker.remove())
    routeEndpointMarkers = []
  }

  function setRouteData(data: FeatureCollection<LineString>) {
    if (!context) return
    const source = context.map.getSource(ROUTE_SOURCE_ID) as
      | GeoJSONSource
      | undefined
    source?.setData(data)
  }

  function clearRoute() {
    setRouteData(EMPTY_ROUTE_DATA)
    clearRouteEndpointMarkers()
  }

  function ensureRouteLayers(map: MapLibreMap) {
    if (map.getSource(ROUTE_SOURCE_ID)) return

    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_ROUTE_DATA,
    })
    map.addLayer({
      id: ROUTE_CASING_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#FFFFFF',
        'line-opacity': 0.95,
        'line-width': 7,
      },
    })
    map.addLayer({
      id: ROUTE_LINE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#21A3E6',
        'line-opacity': 1,
        'line-width': 4,
      },
    })
  }

  function createPickupMarker() {
    clearTaskMarker()
    if (!context || !options.departureCode() || !options.objectCode()) return

    const element = document.createElement('div')
    element.className =
      'pointer-events-none flex h-28 w-24 flex-col items-center justify-end rounded-xs bg-hw-blue-lighter/70 pb-3 text-b2 font-bold text-hw-gray-darker shadow-sm'
    element.style.zIndex = '1'

    const departureLabel = document.createElement('span')
    departureLabel.className = 'mb-auto mt-auto'
    departureLabel.textContent = options.departureCode()

    const objectLabel = document.createElement('span')
    objectLabel.className =
      'rounded-xs bg-hw-blue-darker px-3 py-1 text-s2 font-bold text-hw-white-main shadow-lg'
    objectLabel.textContent = options.objectCode()
    element.append(departureLabel, objectLabel)

    taskMarker = new maplibregl.Marker({
      element,
      anchor: 'bottom',
      offset: [0, 8],
    })
      .setLngLat(context.start)
      .addTo(context.map)
  }

  function createEndpointMarker(
    coordinate: MapCoordinate,
    labelText: string,
    variant: 'origin' | 'destination',
  ) {
    const element = document.createElement('div')
    element.className = 'pointer-events-none relative h-3 w-3'
    element.style.zIndex = '2'

    const dot = document.createElement('span')
    dot.className =
      variant === 'origin'
        ? 'absolute inset-0 rounded-full border-2 border-hw-white-main bg-hw-green-light shadow-md'
        : 'absolute inset-0 rounded-full border-2 border-hw-white-main bg-hw-blue-main shadow-md'

    const label = document.createElement('span')
    label.className =
      variant === 'origin'
        ? 'absolute top-1/2 right-full mr-2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-hw-green-main px-2 py-1 text-c1 font-bold text-hw-white-main shadow-md'
        : 'absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-hw-blue-main px-2 py-1 text-c1 font-bold text-hw-white-main shadow-md'
    label.textContent = labelText
    element.append(dot, label)

    return new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat(coordinate)
      .addTo(context!.map)
  }

  function drawCompletedRoute() {
    if (!context) return

    const routeFeature: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [context.start, context.destination],
      },
    }
    setRouteData({
      type: 'FeatureCollection',
      features: [routeFeature],
    })
    clearRouteEndpointMarkers()
    routeEndpointMarkers = [
      createEndpointMarker(
        context.start,
        `출발 ${options.departureCode()}`,
        'origin',
      ),
      createEndpointMarker(
        context.destination,
        `도착 ${options.destinationCode()}`,
        'destination',
      ),
    ]

    const bounds = new maplibregl.LngLatBounds(
      context.start,
      context.destination,
    )
    context.map.fitBounds(bounds, {
      bearing: YARD_DEFAULT_BEARING,
      duration: 700,
      maxZoom: context.map.getZoom(),
      padding: 80,
    })
  }

  function animateVehicle() {
    if (!context) return

    cancelMovement()
    const startedAt = performance.now()
    const { start, destination, vehicleMarker } = context

    function moveFrame(now: number) {
      const progress = Math.min(
        (now - startedAt) / VEHICLE_MOVEMENT_DURATION_MS,
        1,
      )
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

      vehicleMarker.setLngLat([
        start[0] + (destination[0] - start[0]) * easedProgress,
        start[1] + (destination[1] - start[1]) * easedProgress,
      ])

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(moveFrame)
        return
      }
      animationFrameId = null
    }

    animationFrameId = requestAnimationFrame(moveFrame)
  }

  function syncExecution() {
    if (!context) return

    const phase = options.executionPhase()
    if (phase === 'waiting') {
      cancelMovement()
      clearRoute()
      context.vehicleMarker.setLngLat(context.start)
      createPickupMarker()
      return
    }

    clearTaskMarker()
    if (phase === 'inProgress') {
      clearRoute()
      context.vehicleMarker.setLngLat(context.start)
      animateVehicle()
      return
    }

    cancelMovement()
    context.vehicleMarker.setLngLat(context.destination)
    drawCompletedRoute()
  }

  function attachMapExecution(nextContext: MapExecutionContext) {
    context = nextContext
    ensureRouteLayers(context.map)
    syncExecution()
  }

  watch(
    [
      options.executionPhase,
      options.departureCode,
      options.destinationCode,
      options.objectCode,
    ],
    syncExecution,
  )

  onUnmounted(() => {
    cancelMovement()
    clearTaskMarker()
    clearRouteEndpointMarkers()
    context = null
  })

  return { attachMapExecution }
}
