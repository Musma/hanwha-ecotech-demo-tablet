<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { AlarmClockIcon } from '@lucide/vue'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import { computed, ref } from 'vue'

import { cn } from '@/shared/helpers/utils'

import ClockPanel from './ClockPanel.vue'

import type { TimePickerSize } from '.'

defineOptions({ inheritAttrs: false })

interface Props {
  placeholder?: string
  size?: TimePickerSize
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '00:00',
  size: 'm',
  disabled: false,
  class: undefined,
})

// v-model 은 'HH:mm' 24시간제 문자열. 시계 본문은 ClockPanel 이 담당한다.
const model = defineModel<string>()

// 팝오버 열림 상태(필드 클릭 → 시계 열림).
const open = ref(false)

const hasValue = computed(() => Boolean(model.value))
const displayText = computed(() => model.value || props.placeholder)

// 필드(트리거)/팝업 패딩 사이즈 분기. 시계 내부 사이즈는 ClockPanel 이 처리.
const fieldClasses = computed(() =>
  props.size === 's'
    ? { trigger: 'h-6 text-c1', icon: 'size-3.5', popupPadding: 'px-2 py-2' }
    : { trigger: 'h-8 text-b3', icon: 'size-4', popupPadding: 'px-2 py-4' },
)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child :disabled="disabled">
      <button
        type="button"
        v-bind="$attrs"
        :disabled="disabled"
        data-slot="time-picker-trigger"
        :data-size="size"
        :class="
          cn(
            // 필드(트리거): DatePicker 와 동일. radius 4px, 보더 gray-light,
            // 열림 시 orange-main. 높이/텍스트는 사이즈별, 너비 w-full(부모 제어).
            'group flex w-full items-center justify-between gap-2 rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main px-2 outline-none transition-colors',
            fieldClasses.trigger,
            'focus:border-hw-orange-main data-[state=open]:border-hw-orange-main',
            'disabled:cursor-not-allowed disabled:bg-hw-white-lighter disabled:text-hw-gray-main',
            props.class,
          )
        "
      >
        <span
          :class="
            cn(
              'truncate text-left',
              hasValue ? 'text-hw-gray-dark' : 'text-hw-gray-light',
            )
          "
        >
          {{ displayText }}
        </span>
        <AlarmClockIcon
          :class="cn('shrink-0 text-hw-gray-dark', fieldClasses.icon)"
        />
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="start"
        :side-offset="4"
        data-slot="time-picker-content"
        :class="
          cn(
            'z-50 w-[var(--reka-popper-anchor-width)] min-w-[200px] rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main shadow-sm',
            fieldClasses.popupPadding,
          )
        "
      >
        <ClockPanel v-model="model" :size="size" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
