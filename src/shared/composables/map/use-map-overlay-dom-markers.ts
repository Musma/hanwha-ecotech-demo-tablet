import { shallowRef, type Ref, type ShallowRef } from 'vue'

import type { LatLng } from '@/shared/helpers/map/grid-utils'
import type {
  CircleShape,
  PolygonShape,
  RectangleShape,
  SelectedShape,
} from '@/shared/helpers/map/measurement-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapRuntimeModule = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapMarker = any

interface UseMapOverlayDomMarkersOptions {
  blockVisible: Ref<boolean>
  circleMeasures: Ref<CircleShape[]>
  getAveragePoint: (points: LatLng[]) => LatLng | null
  getPointsBoundsCenter: (points: LatLng[]) => LatLng | null
  mapLibreGlRef: ShallowRef<MapRuntimeModule | null>
  mapRef: ShallowRef<MapInstance | null>
  parcelVisible: Ref<boolean>
  polygonMeasures: Ref<PolygonShape[]>
  rectangleMeasures: Ref<RectangleShape[]>
  selectedShape: Ref<SelectedShape | null>
  startRectangleRotation: (
    rectangle: RectangleShape,
    clientPoint: { x: number; y: number },
  ) => void
}

export function useMapOverlayDomMarkers({
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
}: UseMapOverlayDomMarkersOptions) {
  const overlayNameMarkersRef = shallowRef<MapMarker[]>([])
  const blockImageMarkersRef = shallowRef<MapMarker[]>([])
  const blockRotateHandleRef = shallowRef<MapMarker | null>(null)

  function syncOverlayNameMarkers() {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl) return
    overlayNameMarkersRef.value.forEach((marker) => marker.remove())
    overlayNameMarkersRef.value = []
    const next: MapMarker[] = []
    if (parcelVisible.value) {
      polygonMeasures.value.forEach((polygon) => {
        const centerPoint = getPointsBoundsCenter(polygon.points)
        if (!centerPoint || !polygon.name) return
        const el = document.createElement('div')
        el.className = 'overlay-name-marker overlay-name-marker--parcel'
        el.textContent = polygon.name
        next.push(
          new maplibreGl.Marker({ element: el, anchor: 'center' })
            .setLngLat([centerPoint.lng, centerPoint.lat])
            .addTo(map),
        )
      })
    }
    if (blockVisible.value) {
      circleMeasures.value.forEach((circle) => {
        if (!circle.center || !circle.name) return
        const el = document.createElement('div')
        el.className = 'overlay-name-marker overlay-name-marker--block'
        el.textContent = circle.name
        next.push(
          new maplibreGl.Marker({ element: el, anchor: 'center' })
            .setLngLat([circle.center.lng, circle.center.lat])
            .addTo(map),
        )
      })
      rectangleMeasures.value.forEach((rectangle) => {
        const centerPoint = getAveragePoint(rectangle.points)
        if (!centerPoint || !rectangle.name) return
        const el = document.createElement('div')
        el.className = 'overlay-name-marker overlay-name-marker--block'
        el.textContent = rectangle.name
        next.push(
          new maplibreGl.Marker({ element: el, anchor: 'center' })
            .setLngLat([centerPoint.lng, centerPoint.lat])
            .addTo(map),
        )
      })
    }
    overlayNameMarkersRef.value = next
  }

  function syncBlockImageMarkers() {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    if (!map || !maplibreGl) return
    blockImageMarkersRef.value.forEach((marker) => marker.remove())
    blockImageMarkersRef.value = []
    if (!blockVisible.value) return
    const next: MapMarker[] = []
    rectangleMeasures.value
      .filter(
        (rectangle) => rectangle.imageSrc && rectangle.points?.length >= 4,
      )
      .forEach((rectangle) => {
        const projected = rectangle.points.map((point) =>
          map.project([point.lng, point.lat]),
        )
        const topLeft = projected[0]
        const topRight = projected[1]
        const bottomLeft = projected[3]
        const width = Math.max(
          16,
          Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y),
        )
        const height = Math.max(
          16,
          Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y),
        )
        const rotation = Math.atan2(
          topRight.y - topLeft.y,
          topRight.x - topLeft.x,
        )
        const centerPoint = getAveragePoint(rectangle.points)
        if (!centerPoint) return
        const wrapper = document.createElement('div')
        wrapper.className = `block-image-marker ${selectedShape.value?.type === 'rectangle' && selectedShape.value.id === rectangle.id ? 'is-selected' : ''}`
        const frame = document.createElement('div')
        frame.className = 'block-image-marker__frame'
        frame.style.width = `${width}px`
        frame.style.height = `${height}px`
        frame.style.transform = `translate(-50%, -50%) rotate(${rotation}rad)`
        const image = document.createElement('img')
        image.className = 'block-image-marker__image'
        image.src = rectangle.imageSrc!
        image.alt = rectangle.name ?? '블록 이미지'
        image.draggable = false
        frame.appendChild(image)
        wrapper.appendChild(frame)
        next.push(
          new maplibreGl.Marker({ element: wrapper, anchor: 'center' })
            .setLngLat([centerPoint.lng, centerPoint.lat])
            .addTo(map),
        )
      })
    blockImageMarkersRef.value = next
  }

  function syncBlockRotateHandle() {
    const map = mapRef.value
    const maplibreGl = mapLibreGlRef.value
    blockRotateHandleRef.value?.remove()
    blockRotateHandleRef.value = null
    if (
      !map ||
      !maplibreGl ||
      !blockVisible.value ||
      selectedShape.value?.type !== 'rectangle'
    ) {
      return
    }
    const rectangle = rectangleMeasures.value.find(
      (item) => item.id === selectedShape.value!.id,
    )
    if (!rectangle || rectangle.points.length < 4) return
    const projected = rectangle.points.map((point) =>
      map.project([point.lng, point.lat]),
    )
    const topLeft = projected[0]
    const topRight = projected[1]
    const centerProjected = {
      x: (projected[0].x + projected[2].x) / 2,
      y: (projected[0].y + projected[2].y) / 2,
    }
    const topMid = {
      x: (topLeft.x + topRight.x) / 2,
      y: (topLeft.y + topRight.y) / 2,
    }
    const direction = {
      x: topMid.x - centerProjected.x,
      y: topMid.y - centerProjected.y,
    }
    const length = Math.max(1, Math.hypot(direction.x, direction.y))
    const handlePixel = {
      x: topMid.x + (direction.x / length) * 28,
      y: topMid.y + (direction.y / length) * 28,
    }
    const handleLngLat = map.unproject([handlePixel.x, handlePixel.y])
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'block-rotate-handle'
    el.setAttribute('aria-label', '블록 회전')
    el.title = '드래그해서 회전'
    el.addEventListener('mousedown', (event) => {
      event.preventDefault()
      event.stopPropagation()
      startRectangleRotation(rectangle, {
        x: event.clientX,
        y: event.clientY,
      })
    })
    blockRotateHandleRef.value = new maplibreGl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([handleLngLat.lng, handleLngLat.lat])
      .addTo(map)
  }

  function cleanupOverlayDomMarkers() {
    overlayNameMarkersRef.value.forEach((marker) => marker.remove())
    overlayNameMarkersRef.value = []
    blockImageMarkersRef.value.forEach((marker) => marker.remove())
    blockImageMarkersRef.value = []
    blockRotateHandleRef.value?.remove()
    blockRotateHandleRef.value = null
  }

  return {
    cleanupOverlayDomMarkers,
    syncBlockImageMarkers,
    syncBlockRotateHandle,
    syncOverlayNameMarkers,
  }
}
