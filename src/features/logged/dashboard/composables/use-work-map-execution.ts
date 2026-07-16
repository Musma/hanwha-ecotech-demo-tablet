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
}

interface MapExecutionContext {
  destination: MapCoordinate
  map: MapLibreMap
  routeCoordinates?: MapCoordinate[]
  start: MapCoordinate
  vehicleMarker: Marker
}

const ROUTE_SOURCE_ID = 'work-execution-route-source'
const ROUTE_CASING_LAYER_ID = 'work-execution-route-casing'
const ROUTE_LINE_LAYER_ID = 'work-execution-route-line'
const DEPARTURE_CAMERA_DURATION_MS = 700
const DEPARTURE_CAMERA_ZOOM_INCREASE = 1
const ROUTE_CAMERA_DURATION_MS = 700
const ROUTE_CAMERA_MAX_ZOOM_INCREASE = 2
const ROUTE_CAMERA_PADDING_PX = 80
const VEHICLE_MOVEMENT_DURATION_MS = 12_000
const EMPTY_ROUTE_DATA: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [],
}

function getSmoothMovementProgress(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10)
}

function getCoordinateDistance(from: MapCoordinate, to: MapCoordinate) {
  return Math.hypot(to[0] - from[0], to[1] - from[1])
}

export function useWorkMapExecution(options: WorkMapExecutionOptions) {
  let context: MapExecutionContext | null = null
  let animationFrameId: number | null = null
  let focusedDepartureCode = ''
  let routeEndpointMarkers: Marker[] = []

  function cancelMovement() {
    if (animationFrameId === null) return
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
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

  function removeRouteLayers() {
    if (!context) return
    clearRouteEndpointMarkers()
    if (context.map.getLayer(ROUTE_LINE_LAYER_ID)) {
      context.map.removeLayer(ROUTE_LINE_LAYER_ID)
    }
    if (context.map.getLayer(ROUTE_CASING_LAYER_ID)) {
      context.map.removeLayer(ROUTE_CASING_LAYER_ID)
    }
    if (context.map.getSource(ROUTE_SOURCE_ID)) {
      context.map.removeSource(ROUTE_SOURCE_ID)
    }
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

  function getExecutionRoute() {
    if (!context) return []
    return context.routeCoordinates && context.routeCoordinates.length >= 2
      ? context.routeCoordinates
      : [context.start, context.destination]
  }

  function interpolateRouteCoordinate(
    route: MapCoordinate[],
    progress: number,
  ): MapCoordinate {
    if (route.length <= 1) return route[0] ?? [0, 0]

    const easedProgress = getSmoothMovementProgress(progress)
    const segmentLengths = route
      .slice(1)
      .map((coordinate, index) =>
        getCoordinateDistance(route[index], coordinate),
      )
    const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0)
    if (totalLength <= 0) return route[route.length - 1]

    const targetLength = totalLength * easedProgress
    let accumulatedLength = 0
    for (let index = 0; index < segmentLengths.length; index += 1) {
      const segmentLength = segmentLengths[index]
      if (accumulatedLength + segmentLength < targetLength) {
        accumulatedLength += segmentLength
        continue
      }

      if (segmentLength <= 0) return route[index + 1]
      const segmentProgress = (targetLength - accumulatedLength) / segmentLength
      return [
        route[index][0] +
          (route[index + 1][0] - route[index][0]) * segmentProgress,
        route[index][1] +
          (route[index + 1][1] - route[index][1]) * segmentProgress,
      ]
    }

    return route[route.length - 1]
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

    const route = getExecutionRoute()
    ensureRouteLayers(context.map)
    const routeFeature: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route,
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

    const currentZoom = context.map.getZoom()
    const bounds = route.reduce(
      (nextBounds, coordinate) => nextBounds.extend(coordinate),
      new maplibregl.LngLatBounds(),
    )
    const routeCamera = context.map.cameraForBounds(bounds, {
      bearing: YARD_DEFAULT_BEARING,
      maxZoom: currentZoom + ROUTE_CAMERA_MAX_ZOOM_INCREASE,
      padding: ROUTE_CAMERA_PADDING_PX,
    })

    if (
      !routeCamera?.center ||
      routeCamera.zoom === undefined ||
      !Number.isFinite(routeCamera.zoom)
    ) {
      return
    }

    context.map.easeTo({
      ...routeCamera,
      duration: ROUTE_CAMERA_DURATION_MS,
      zoom: Math.max(currentZoom, routeCamera.zoom),
    })
  }

  function drawDestinationMarker() {
    if (!context) return

    const departureCode = options.departureCode()
    const destinationCode = options.destinationCode()
    if (!departureCode || !destinationCode) return

    routeEndpointMarkers = [
      createEndpointMarker(
        context.destination,
        `목적지 ${destinationCode}`,
        'destination',
      ),
    ]
  }

  function focusSelectedDeparture() {
    if (!context) return

    const departureCode = options.departureCode()
    if (!departureCode) {
      focusedDepartureCode = ''
      return
    }
    if (departureCode === focusedDepartureCode) return

    focusedDepartureCode = departureCode
    context.map.easeTo({
      bearing: YARD_DEFAULT_BEARING,
      center: context.start,
      duration: DEPARTURE_CAMERA_DURATION_MS,
      zoom: Math.min(
        context.map.getZoom() + DEPARTURE_CAMERA_ZOOM_INCREASE,
        context.map.getMaxZoom(),
      ),
    })
  }

  function animateVehicle() {
    if (!context) return

    cancelMovement()
    const startedAt = performance.now()
    const { vehicleMarker } = context
    const route = getExecutionRoute()

    function moveFrame(now: number) {
      const progress = Math.min(
        (now - startedAt) / VEHICLE_MOVEMENT_DURATION_MS,
        1,
      )
      vehicleMarker.setLngLat(interpolateRouteCoordinate(route, progress))

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
      removeRouteLayers()
      context.vehicleMarker.setLngLat(context.start)
      drawDestinationMarker()
      focusSelectedDeparture()
      return
    }

    if (phase === 'inProgress') {
      removeRouteLayers()
      context.vehicleMarker.setLngLat(context.start)
      drawDestinationMarker()
      animateVehicle()
      return
    }

    cancelMovement()
    context.vehicleMarker.setLngLat(context.destination)
    drawCompletedRoute()
  }

  function attachMapExecution(nextContext: MapExecutionContext) {
    context = nextContext
    syncExecution()
  }

  watch(
    [options.executionPhase, options.departureCode, options.destinationCode],
    syncExecution,
  )

  onUnmounted(() => {
    cancelMovement()
    clearRouteEndpointMarkers()
    context = null
  })

  return { attachMapExecution }
}
