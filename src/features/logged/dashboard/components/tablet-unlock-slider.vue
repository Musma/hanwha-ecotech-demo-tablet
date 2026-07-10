<script setup lang="ts">
import { computed, onUnmounted, shallowRef, useTemplateRef } from 'vue'

const UNLOCK_THRESHOLD = 0.78
const TRACK_HORIZONTAL_PADDING = 8

const emit = defineEmits<{
  unlock: []
}>()

const sliderRef = useTemplateRef<HTMLElement>('slider')
const handleRef = useTemplateRef<HTMLButtonElement>('handle')
const isDragging = shallowRef(false)
const dragProgress = shallowRef(0)
const dragRange = shallowRef(0)
const dragStartX = shallowRef(0)
const activePointerId = shallowRef<number | null>(null)

const handleStyle = computed(() => ({
  transform: `translate3d(${dragProgress.value * dragRange.value}px, 0, 0)`,
}))

const progressStyle = computed(() => ({
  width: `${dragProgress.value * 100}%`,
}))

const labelStyle = computed(() => ({
  opacity: Math.max(0, 1 - dragProgress.value * 1.6),
}))

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value))
}

function handlePointerDown(event: PointerEvent) {
  if (!event.isPrimary) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const slider = sliderRef.value
  const handle = handleRef.value
  if (!slider || !handle) return

  dragRange.value = Math.max(
    0,
    slider.clientWidth - handle.offsetWidth - TRACK_HORIZONTAL_PADDING,
  )
  dragStartX.value = event.clientX - dragProgress.value * dragRange.value
  activePointerId.value = event.pointerId
  isDragging.value = true
  handle.setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', handlePointerMove, { passive: false })
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerCancel)
}

function handlePointerMove(event: PointerEvent) {
  if (
    !isDragging.value ||
    activePointerId.value !== event.pointerId ||
    dragRange.value === 0
  ) {
    return
  }

  event.preventDefault()
  dragProgress.value = clampProgress(
    (event.clientX - dragStartX.value) / dragRange.value,
  )
}

function stopDragListeners() {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerCancel)
}

function releasePointer(event: PointerEvent) {
  const handle = handleRef.value
  if (handle?.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId)
  }
}

function handlePointerUp(event: PointerEvent) {
  if (!isDragging.value || activePointerId.value !== event.pointerId) return

  isDragging.value = false
  activePointerId.value = null
  stopDragListeners()
  releasePointer(event)

  if (dragProgress.value >= UNLOCK_THRESHOLD) {
    dragProgress.value = 1
    emit('unlock')
    return
  }

  dragProgress.value = 0
}

function handlePointerCancel(event: PointerEvent) {
  if (!isDragging.value || activePointerId.value !== event.pointerId) return

  isDragging.value = false
  activePointerId.value = null
  stopDragListeners()
  releasePointer(event)
  dragProgress.value = 0
}

function unlockWithKeyboard() {
  dragProgress.value = 1
  emit('unlock')
}

onUnmounted(stopDragListeners)
</script>

<template>
  <div
    ref="slider"
    data-testid="tablet-unlock-slider"
    class="relative h-14 w-full max-w-sm overflow-hidden rounded-full border border-hw-white-main/30 bg-hw-gray-darker/45 p-1 shadow-lg backdrop-blur-sm sm:max-w-md"
  >
    <span
      class="absolute inset-y-0 left-0 bg-hw-orange-main/35"
      :class="{ 'transition-[width] duration-300 ease-smooth': !isDragging }"
      :style="progressStyle"
      aria-hidden="true"
    />

    <span
      class="pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-s2 font-bold text-hw-white-main transition-opacity"
      :style="labelStyle"
    >
      밀어서 해제
      <i class="ti ti-chevrons-right ml-1 text-base" aria-hidden="true" />
    </span>

    <button
      ref="handle"
      type="button"
      data-testid="tablet-unlock-handle"
      class="absolute left-1 top-1 flex size-12 touch-none select-none items-center justify-center rounded-full bg-hw-orange-main text-xl text-hw-white-main shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hw-white-main active:cursor-grabbing"
      :class="{
        'cursor-grab transition-transform duration-300 ease-smooth':
          !isDragging,
      }"
      :style="handleStyle"
      aria-label="밀어서 해제. 오른쪽 끝까지 드래그하세요"
      @pointerdown="handlePointerDown"
      @keydown.enter.prevent="unlockWithKeyboard"
      @keydown.space.prevent="unlockWithKeyboard"
    >
      <i class="ti ti-lock" aria-hidden="true" />
    </button>
  </div>
</template>
