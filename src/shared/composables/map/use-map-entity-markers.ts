import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

import type { LatLng } from '@/shared/helpers/map/grid-utils'
import {
  buildEntityPopupHtml,
  convertLocalPolyPointToLngLat,
  isPhysPair,
} from '@/shared/helpers/map/map-geo-helpers'
import type {
  MapEntityFocusRequest,
  YardMapProps,
  MapRouteFocusRequest,
} from '@/shared/types/map/yard-map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapRuntimeModule = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapMarker = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapPopup = any

interface UseMapEntityMarkersOptions {
  mapRef: ShallowRef<MapInstance | null>
  mapLibreGlRef: ShallowRef<MapRuntimeModule | null>
  mapReady: Ref<boolean>
  props: YardMapProps
  gridCellMeters: () => number
  getNormalizedBoundary: () => number[][]
  origin: Ref<LatLng>
}

export function useMapEntityMarkers({
  mapRef,
  mapLibreGlRef,
  mapReady,
  props,
  gridCellMeters,
  getNormalizedBoundary,
  origin,
}: UseMapEntityMarkersOptions) {
  const entityFocusMarkerRef = shallowRef<MapMarker | null>(null)
  const lastEntityFocusKeyRef = ref<string | null>(null)
  const routeMarkersRef = shallowRef<MapMarker[]>([])
  const lastRouteFocusKeyRef = ref<string | null>(null)
  const entityMarkersRef = shallowRef<MapMarker[]>([])
  const entityPopupRef = shallowRef<MapPopup | null>(null)
  const liveMarkerRef = shallowRef<MapMarker | null>(null)

  function openEntityPopup(
    markerElement: HTMLElement | null,
    lngLat: LatLng,
    html: string,
  ) {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl || !lngLat) return
    entityPopupRef.value?.remove()
    const markerHeight = markerElement?.offsetHeight ?? 32
    entityPopupRef.value = new maplibreGl.Popup({
      offset: markerHeight + 12,
      anchor: 'bottom',
      closeButton: true,
      closeOnClick: true,
      maxWidth: '260px',
      className: 'entity-popup-wrap',
    })
    entityPopupRef
      .value!.setLngLat([lngLat.lng, lngLat.lat])
      .setHTML(html)
      .addTo(map)
  }

  function toLngLatFromPhys(phys: number[]) {
    const cell = gridCellMeters()
    const boundary = getNormalizedBoundary()
    return convertLocalPolyPointToLngLat(
      { x: phys[0] * cell + cell / 2, y: phys[1] * cell + cell / 2 },
      boundary,
      origin.value,
    )
  }

  function handleMapEntityFocusRequest(req: MapEntityFocusRequest | null) {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl || !mapReady.value) return
    if (!req || !isPhysPair(req.phys)) {
      entityFocusMarkerRef.value?.remove()
      entityFocusMarkerRef.value = null
      lastEntityFocusKeyRef.value = null
      return
    }
    const key = `${req.no}:${req.requestedAt}`
    if (lastEntityFocusKeyRef.value === key) return
    entityPopupRef.value?.remove()
    const lngLat = toLngLatFromPhys(req.phys)
    if (!lngLat) return
    lastEntityFocusKeyRef.value = key
    entityFocusMarkerRef.value?.remove()
    entityFocusMarkerRef.value = null
    const el = document.createElement('div')
    el.className = `block-focus-marker${req.tone === 'material' ? ' block-focus-marker--material' : ''}`
    el.innerHTML =
      `<span class="block-focus-marker__no">${req.no}</span>` +
      `<span class="block-focus-marker__sub">${req.name ?? ''}</span>`
    if (req.popup) {
      el.style.cursor = 'pointer'
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        if (!mapRef.value) return
        openEntityPopup(
          el,
          lngLat,
          buildEntityPopupHtml({ tone: req.tone, popup: req.popup as never }),
        )
      })
    }
    entityFocusMarkerRef.value = new maplibreGl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([lngLat.lng, lngLat.lat])
      .addTo(map)
    map.easeTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: Math.max(map.getZoom(), 16.5),
      duration: 800,
    })
  }

  function handleLivePosition() {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl || !mapReady.value) return
    const live = props.livePosition
    if (!live || !isPhysPair(live.phys)) {
      liveMarkerRef.value?.remove()
      liveMarkerRef.value = null
      return
    }
    const lngLat = toLngLatFromPhys(live.phys)
    if (!lngLat) return
    if (!liveMarkerRef.value) {
      const el = document.createElement('div')
      el.className = 'live-marker'
      el.innerHTML =
        `<span class="live-marker__pulse"></span><span class="live-marker__dot"></span>` +
        `<span class="live-marker__label">${live.label || '현재위치'}</span>`
      liveMarkerRef.value = new maplibreGl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map)
    } else {
      liveMarkerRef.value.setLngLat([lngLat.lng, lngLat.lat])
    }
  }

  function handleMapMarkers() {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl || !mapReady.value) return
    entityMarkersRef.value.forEach((m) => m.remove())
    entityMarkersRef.value = []
    entityPopupRef.value?.remove()
    if (!Array.isArray(props.mapMarkers) || props.mapMarkers.length === 0)
      return
    props.mapMarkers.forEach((item) => {
      if (!item || !isPhysPair(item.phys)) return
      const lngLat = toLngLatFromPhys(item.phys)
      if (!lngLat) return
      const el = document.createElement('div')
      el.className = `map-entity-marker map-entity-marker--${item.tone || 'block'}`
      el.textContent = item.label ?? ''
      if (item.name) el.title = `${item.label} · ${item.name}`
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        if (!mapRef.value) return
        openEntityPopup(el, lngLat, buildEntityPopupHtml(item as never))
      })
      entityMarkersRef.value.push(
        new maplibreGl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lngLat.lng, lngLat.lat])
          .addTo(map),
      )
    })
  }

  function handleMapRouteFocusRequest(req: MapRouteFocusRequest | null) {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl || !mapReady.value) return
    const from = req?.from
    const to = req?.to
    if (
      !req ||
      !from ||
      !to ||
      !isPhysPair(from.phys) ||
      !isPhysPair(to.phys)
    ) {
      routeMarkersRef.value.forEach((m) => m.remove())
      routeMarkersRef.value = []
      lastRouteFocusKeyRef.value = null
      return
    }
    const key = `${req.req}:${req.requestedAt}`
    if (lastRouteFocusKeyRef.value === key) return
    entityPopupRef.value?.remove()
    const fromLL = toLngLatFromPhys(from.phys)
    const toLL = toLngLatFromPhys(to.phys)
    if (!fromLL || !toLL) return
    lastRouteFocusKeyRef.value = key
    routeMarkersRef.value.forEach((m) => m.remove())
    routeMarkersRef.value = []
    const make = (
      label: string,
      name: string,
      lngLat: LatLng,
      toneClass: string,
    ) => {
      const el = document.createElement('div')
      el.className = `block-focus-marker ${toneClass}`
      el.innerHTML =
        `<span class="block-focus-marker__no">${label}</span>` +
        `<span class="block-focus-marker__sub">${name ?? ''}</span>`
      if (req.popup) {
        el.style.cursor = 'pointer'
        el.addEventListener('click', (event) => {
          event.stopPropagation()
          if (!mapRef.value) return
          openEntityPopup(
            el,
            lngLat,
            buildEntityPopupHtml({
              tone: 'dispatch',
              popup: req.popup as never,
            }),
          )
        })
      }
      return new maplibreGl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map)
    }
    routeMarkersRef.value.push(
      make('출발', from.label, fromLL, 'block-focus-marker--from'),
    )
    routeMarkersRef.value.push(
      make('도착', to.label, toLL, 'block-focus-marker--to'),
    )
    map.resize()
    const animateFit = !props.livePosition
    map.fitBounds(
      [
        [Math.min(fromLL.lng, toLL.lng), Math.min(fromLL.lat, toLL.lat)],
        [Math.max(fromLL.lng, toLL.lng), Math.max(fromLL.lat, toLL.lat)],
      ],
      {
        padding: 90,
        duration: animateFit ? 800 : 0,
        maxZoom: 17,
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      },
    )
  }

  function cleanupEntityMarkers() {
    entityFocusMarkerRef.value?.remove()
    entityFocusMarkerRef.value = null
    routeMarkersRef.value.forEach((m) => m.remove())
    routeMarkersRef.value = []
    entityMarkersRef.value.forEach((m) => m.remove())
    entityMarkersRef.value = []
    entityPopupRef.value?.remove()
    entityPopupRef.value = null
    liveMarkerRef.value?.remove()
    liveMarkerRef.value = null
  }

  return {
    cleanupEntityMarkers,
    handleMapEntityFocusRequest,
    handleLivePosition,
    handleMapMarkers,
    handleMapRouteFocusRequest,
  }
}
