<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { CalendarIcon } from '@lucide/vue'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from 'reka-ui'
import { computed, ref } from 'vue'

import CalendarPanel from '@/shared/components/ui/date-picker/CalendarPanel.vue'
import ClockPanel from '@/shared/components/ui/time-picker/ClockPanel.vue'
import { cn } from '@/shared/helpers/utils'

import type { DateTimePickerSize } from '.'

defineOptions({ inheritAttrs: false })

interface Props {
  placeholder?: string
  size?: DateTimePickerSize
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'YYYY-MM-DD 00:00',
  size: 'm',
  disabled: false,
  class: undefined,
})

// v-model 은 'YYYY-MM-DD HH:mm' 결합 문자열로 노출한다. 내부에서 날짜/시간으로
// 분해해 CalendarPanel / ClockPanel 각각에 연결하고, 둘 중 하나가 바뀌면 다시
// 결합해 emit 한다(둘 다 비면 undefined).
const model = defineModel<string>()

const open = ref(false)

// 결합 문자열 → { date, time }. 토큰에 '-' 면 날짜, ':' 면 시간으로 구분한다
// (한쪽만 선택된 경우에도 안전하게 분해).
const splitValue = computed(() => {
  let date = ''
  let time = ''
  for (const token of (model.value ?? '').trim().split(/\s+/)) {
    if (token.includes(':')) time = token
    else if (token.includes('-')) date = token
  }
  return { date, time }
})

function combine(date: string, time: string): string | undefined {
  const parts = [date, time].filter(Boolean)
  return parts.length ? parts.join(' ') : undefined
}

const dateModel = computed<string | undefined>({
  get: () => splitValue.value.date || undefined,
  set: (value) => {
    model.value = combine(value ?? '', splitValue.value.time)
  },
})

const timeModel = computed<string | undefined>({
  get: () => splitValue.value.time || undefined,
  set: (value) => {
    model.value = combine(splitValue.value.date, value ?? '')
  },
})

const hasValue = computed(() => Boolean(model.value))
const displayText = computed(() => model.value || props.placeholder)

// 필드(트리거)/탭 사이즈 분기. 패널 내부 사이즈는 각 패널이 처리한다.
const fieldClasses = computed(() =>
  props.size === 's'
    ? { trigger: 'h-6 text-c1', icon: 'size-3.5', tab: 'text-c1' }
    : { trigger: 'h-8 text-b3', icon: 'size-4', tab: 'text-b3' },
)

const tabTriggerClass = computed(() =>
  cn(
    'flex-1 py-1.5 text-center outline-none transition-colors',
    fieldClasses.value.tab,
    'text-hw-orange-main data-[state=active]:bg-hw-orange-main data-[state=active]:text-hw-white-main',
  ),
)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child :disabled="disabled">
      <button
        type="button"
        v-bind="$attrs"
        :disabled="disabled"
        data-slot="date-time-picker-trigger"
        :data-size="size"
        :class="
          cn(
            // 필드(트리거): DatePicker/TimePicker 와 동일.
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
        data-slot="date-time-picker-content"
        class="z-50 w-[var(--reka-popper-anchor-width)] min-w-[200px] rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main p-2 shadow-sm"
      >
        <TabsRoot default-value="date" class="flex flex-col gap-2">
          <!-- Date / Time 세그먼트 탭: 활성 orange 채움, 비활성 orange 텍스트 -->
          <TabsList
            class="flex overflow-hidden rounded-[4px] border border-solid border-hw-orange-main"
          >
            <TabsTrigger value="date" :class="tabTriggerClass"
              >Date</TabsTrigger
            >
            <TabsTrigger value="time" :class="tabTriggerClass"
              >Time</TabsTrigger
            >
          </TabsList>

          <TabsContent value="date" class="outline-none">
            <CalendarPanel v-model="dateModel" :size="size" />
          </TabsContent>
          <TabsContent value="time" class="outline-none">
            <ClockPanel v-model="timeModel" :size="size" />
          </TabsContent>
        </TabsRoot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
