<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { CalendarIcon } from '@lucide/vue'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import { computed, ref } from 'vue'

import { cn } from '@/shared/helpers/utils'

import CalendarPanel from './CalendarPanel.vue'

import type { DatePickerSize } from '.'

defineOptions({ inheritAttrs: false })

interface Props {
  placeholder?: string
  size?: DatePickerSize
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'YYYY-MM-DD',
  size: 'm',
  disabled: false,
  class: undefined,
})

// v-model 은 'YYYY-MM-DD' 문자열. 달력 본문은 CalendarPanel 이 담당한다.
const model = defineModel<string>()

// 팝오버 열림 상태(필드 클릭 → 달력 열림).
const open = ref(false)

// 표시 텍스트: 선택값이 있으면 'YYYY-MM-DD', 없으면 placeholder.
const displayText = computed(() => model.value || props.placeholder)
const hasValue = computed(() => Boolean(model.value))

// 필드(트리거) 사이즈 분기. 달력 내부 사이즈는 CalendarPanel 이 처리한다.
const fieldClasses = computed(() =>
  props.size === 's'
    ? { trigger: 'h-6 text-c1', icon: 'size-3.5' }
    : { trigger: 'h-8 text-b3', icon: 'size-4' },
)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child :disabled="disabled">
      <button
        type="button"
        v-bind="$attrs"
        :disabled="disabled"
        data-slot="date-picker-trigger"
        :data-size="size"
        :class="
          cn(
            // 필드(트리거): text-input 스타일. radius 4px, 보더 gray-light,
            // 열림 시 orange-main. 높이/텍스트는 사이즈별, 너비는 w-full(부모 제어).
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
        <CalendarIcon
          :class="cn('shrink-0 text-hw-gray-dark', fieldClasses.icon)"
        />
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="start"
        :side-offset="4"
        data-slot="date-picker-content"
        class="z-50 w-[var(--reka-popper-anchor-width)] min-w-[200px] rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main p-2 shadow-sm"
      >
        <CalendarPanel v-model="model" :size="size" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
