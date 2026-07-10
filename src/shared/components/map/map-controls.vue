<script setup lang="ts">
interface Props {
  secondaryIcon?: string
  secondaryLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  secondaryIcon: 'ti ti-rotate-clockwise-2',
  secondaryLabel: '지도 방향 초기화',
})

const emit = defineEmits<{
  locateUser: []
  secondaryAction: []
  toggleFullscreen: []
  zoomIn: []
  zoomOut: []
}>()

type ControlEvent =
  | 'locateUser'
  | 'secondaryAction'
  | 'toggleFullscreen'
  | 'zoomIn'
  | 'zoomOut'

interface ControlButton {
  icon: string
  label: string
  event: ControlEvent
}

const controls: ControlButton[] = [
  {
    icon: 'ti ti-current-location',
    label: '내 위치 찾기',
    event: 'locateUser',
  },
  {
    icon: props.secondaryIcon,
    label: props.secondaryLabel,
    event: 'secondaryAction',
  },
  {
    icon: 'ti ti-arrows-maximize',
    label: '전체 화면 전환',
    event: 'toggleFullscreen',
  },
  {
    icon: 'ti ti-plus',
    label: '확대',
    event: 'zoomIn',
  },
  {
    icon: 'ti ti-minus',
    label: '축소',
    event: 'zoomOut',
  },
]

function handleClick(event: ControlButton['event']) {
  emit(event)
}
</script>

<template>
  <div
    class="absolute right-3 bottom-3 z-30 flex flex-col border border-hw-gray-main bg-white shadow-[0_2px_8px_rgba(0,0,0,0.28)]"
    aria-label="지도 컨트롤"
  >
    <button
      v-for="control in controls"
      :key="control.event"
      type="button"
      class="grid size-[38px] place-items-center border-b border-hw-gray-main bg-white text-[23px] leading-none text-hw-gray-darker transition-colors last:border-b-0 hover:bg-hw-white-lighter focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-hw-orange-main"
      :aria-label="control.label"
      :title="control.label"
      @click="handleClick(control.event)"
    >
      <i :class="control.icon" aria-hidden="true" />
    </button>
  </div>
</template>
