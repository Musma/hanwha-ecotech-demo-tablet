import { ref, shallowRef, type ShallowRef } from 'vue'

import { GRID_LAYER_ID } from '@/shared/constants/map-common'
import {
  cloneFixedImageOverlays,
  createFixedOverlayLabelGeoJson,
  getFixedOverlayCoordinates,
  type FixedImageOverlay,
} from '@/shared/helpers/map/map-geo-helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any

const FIXED_OVERLAY_LABEL_SOURCE_ID = 'echotech-fixed-overlay-label-source'
const FIXED_OVERLAY_LABEL_LAYER_ID = 'echotech-fixed-overlay-label-layer'

interface UseMapFixedOverlaysOptions {
  getShowLabels: () => boolean
  initialOverlays: FixedImageOverlay[]
  initialVisible: boolean
  mapRef: ShallowRef<MapInstance | null>
}

export function useMapFixedOverlays({
  getShowLabels,
  initialOverlays,
  initialVisible,
  mapRef,
}: UseMapFixedOverlaysOptions) {
  const fixedOverlayVisible = ref(initialVisible)
  const fixedOverlayOpacity = ref('1')
  const fixedOverlayToastMessage = ref('')
  const fixedOverlays = ref<FixedImageOverlay[]>(
    cloneFixedImageOverlays(initialOverlays),
  )
  const fixedOverlaysRefData = shallowRef<FixedImageOverlay[]>(
    cloneFixedImageOverlays(initialOverlays),
  )

  let fixedOverlayToastTimer: ReturnType<typeof setTimeout> | null = null

  function syncFixedOverlayData(next: FixedImageOverlay[]) {
    fixedOverlaysRefData.value = next.map((overlay) => ({
      ...overlay,
      coordinates: getFixedOverlayCoordinates(overlay).map((coord) => [
        ...coord,
      ]),
    }))
  }

  function updateFixedOverlays(next: FixedImageOverlay[]) {
    fixedOverlays.value = cloneFixedImageOverlays(next)
    syncFixedOverlayData(fixedOverlays.value)
    syncFixedOverlaySources()
    syncFixedOverlayLabelSource()
    applyFixedOverlayLayout()
  }

  function ensureFixedImageOverlayLayers(map: MapInstance) {
    fixedOverlaysRefData.value.forEach((overlay) => {
      const coordinates = getFixedOverlayCoordinates(overlay)
      if (coordinates.length !== 4) return
      if (!map.getSource(overlay.sourceId)) {
        map.addSource(overlay.sourceId, {
          type: 'image',
          url: overlay.imageSrc,
          coordinates,
        })
      }
      if (!map.getLayer(overlay.layerId)) {
        map.addLayer(
          {
            id: overlay.layerId,
            type: 'raster',
            source: overlay.sourceId,
            paint: {
              'raster-opacity': Math.min(
                1,
                Math.max(0, Number(fixedOverlayOpacity.value)),
              ),
              'raster-fade-duration': 0,
            },
            layout: {
              visibility: fixedOverlayVisible.value ? 'visible' : 'none',
            },
          },
          undefined,
        )
      }
      if (map.getLayer(overlay.layerId) && map.getLayer(GRID_LAYER_ID)) {
        map.moveLayer(overlay.layerId, GRID_LAYER_ID)
      }
    })
  }

  function ensureFixedOverlayLabelLayer(map: MapInstance) {
    const visibility =
      fixedOverlayVisible.value && getShowLabels() ? 'visible' : 'none'
    if (!map.getSource(FIXED_OVERLAY_LABEL_SOURCE_ID)) {
      map.addSource(FIXED_OVERLAY_LABEL_SOURCE_ID, {
        type: 'geojson',
        data: createFixedOverlayLabelGeoJson(
          fixedOverlaysRefData.value,
        ) as never,
      })
    }
    if (!map.getLayer(FIXED_OVERLAY_LABEL_LAYER_ID)) {
      map.addLayer({
        id: FIXED_OVERLAY_LABEL_LAYER_ID,
        type: 'symbol',
        source: FIXED_OVERLAY_LABEL_SOURCE_ID,
        layout: {
          visibility,
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 30,
          'text-anchor': 'top',
          'text-offset': [0, 1.1],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-rotation-alignment': 'viewport',
          'text-pitch-alignment': 'viewport',
        },
        paint: {
          'text-color': '#111111',
          'text-halo-color': 'rgba(255, 255, 255, 0.98)',
          'text-halo-width': 16,
          'text-halo-blur': 0.6,
        },
      })
    }
    if (map.getLayer(FIXED_OVERLAY_LABEL_LAYER_ID)) {
      map.moveLayer(FIXED_OVERLAY_LABEL_LAYER_ID)
    }
  }

  function syncFixedOverlaySources() {
    const map = mapRef.value
    if (!map) return
    fixedOverlaysRefData.value.forEach((overlay) => {
      const coordinates = getFixedOverlayCoordinates(overlay)
      const source = map.getSource(overlay.sourceId)
      if (!source || coordinates.length !== 4) return
      if (source.setCoordinates) source.setCoordinates(coordinates)
      else source.updateImage?.({ url: overlay.imageSrc, coordinates })
    })
  }

  function syncFixedOverlayLabelSource() {
    const source = mapRef.value?.getSource(FIXED_OVERLAY_LABEL_SOURCE_ID)
    if (source) {
      source.setData(
        createFixedOverlayLabelGeoJson(fixedOverlaysRefData.value) as never,
      )
    }
  }

  function applyFixedOverlayLayout() {
    const map = mapRef.value
    if (!map) return
    const clamped = Math.min(1, Math.max(0, Number(fixedOverlayOpacity.value)))
    const labelVisibility =
      fixedOverlayVisible.value && getShowLabels() ? 'visible' : 'none'
    fixedOverlaysRefData.value.forEach((overlay) => {
      if (map.getLayer(overlay.layerId)) {
        map.setPaintProperty(overlay.layerId, 'raster-opacity', clamped)
        map.setLayoutProperty(
          overlay.layerId,
          'visibility',
          fixedOverlayVisible.value ? 'visible' : 'none',
        )
      }
    })
    if (map.getLayer(FIXED_OVERLAY_LABEL_LAYER_ID)) {
      map.setLayoutProperty(
        FIXED_OVERLAY_LABEL_LAYER_ID,
        'visibility',
        labelVisibility,
      )
    }
  }

  function showFixedOverlayToast(message: string) {
    fixedOverlayToastMessage.value = message
    if (fixedOverlayToastTimer) window.clearTimeout(fixedOverlayToastTimer)
    fixedOverlayToastTimer = window.setTimeout(() => {
      fixedOverlayToastMessage.value = ''
      fixedOverlayToastTimer = null
    }, 2200)
  }

  function cleanupFixedOverlayToast() {
    if (!fixedOverlayToastTimer) return
    window.clearTimeout(fixedOverlayToastTimer)
    fixedOverlayToastTimer = null
  }

  return {
    applyFixedOverlayLayout,
    cleanupFixedOverlayToast,
    ensureFixedImageOverlayLayers,
    ensureFixedOverlayLabelLayer,
    fixedOverlayOpacity,
    fixedOverlayToastMessage,
    fixedOverlayVisible,
    fixedOverlays,
    showFixedOverlayToast,
    syncFixedOverlayLabelSource,
    syncFixedOverlaySources,
    updateFixedOverlays,
  }
}
