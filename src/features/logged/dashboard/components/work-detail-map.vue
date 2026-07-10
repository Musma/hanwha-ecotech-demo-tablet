<script setup lang="ts">
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'

import 'maplibre-gl/dist/maplibre-gl.css'

import type { WorkItem } from '@/features/logged/dashboard/types/work-list'
import { getMapLibreStyle } from '@/shared/constants/map'
import {
  YARD_DEFAULT_BEARING,
  YARD_DEFAULT_CENTER,
} from '@/shared/constants/map-yard'

interface Props {
  task: WorkItem
}

defineProps<Props>()

const mapRootRef = useTemplateRef<HTMLDivElement>('mapRoot')
const mapRef = shallowRef<MapLibreMap | null>(null)
const mapReady = shallowRef(false)
const resizeObserverRef = shallowRef<ResizeObserver | null>(null)

function initializeMap() {
  if (!mapRootRef.value) return

  const map = new maplibregl.Map({
    container: mapRootRef.value,
    style: getMapLibreStyle('vworld-base'),
    center: YARD_DEFAULT_CENTER,
    zoom: 16.8,
    pitch: 0,
    bearing: YARD_DEFAULT_BEARING,
    dragRotate: false,
    touchZoomRotate: false,
    renderWorldCopies: false,
    attributionControl: false,
  })

  mapRef.value = map
  map.once('idle', () => {
    mapReady.value = true
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
  mapReady.value = false
})
</script>

<template>
  <section
    class="relative min-h-0 overflow-hidden rounded-sm border border-hw-gray-lighter bg-hw-white-darker"
    aria-label="작업 위치 지도"
    :aria-busy="!mapReady"
  >
    <div ref="mapRoot" class="h-full w-full" />

    <div
      class="pointer-events-none absolute top-[16%] right-[3%] flex h-[21%] w-[31%] items-center justify-center rounded-xs bg-hw-blue-lighter/70 text-b1 font-bold text-hw-gray-darker shadow-sm"
    >
      AA1002
    </div>

    <div
      class="pointer-events-none absolute bottom-[10%] left-[8%] flex h-[46%] w-[17%] items-center justify-center rounded-xs bg-hw-blue-lighter/70 text-b1 font-bold text-hw-gray-darker shadow-sm"
    >
      <span>{{ task.departureCode }}</span>
      <span
        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xs bg-hw-blue-darker px-3 py-1 text-b2 font-bold text-hw-white-main shadow-lg"
      >
        {{ task.objectCode }}
      </span>
    </div>

    <div
      class="pointer-events-none absolute top-[45%] left-[53%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-hw-orange-main bg-hw-orange-lighter/25 [@media(min-height:760px)]:h-36 [@media(min-height:760px)]:w-36"
      aria-hidden="true"
    >
      <i class="ti ti-map-pin text-[42px] text-hw-orange-dark" />
    </div>
  </section>
</template>
