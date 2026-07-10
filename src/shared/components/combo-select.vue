<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, XIcon } from '@lucide/vue'
import { computed } from 'vue'

import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from '@/shared/components/ui/combobox'
import { cn } from '@/shared/helpers/utils'

// shadcn-vue(reka-ui) Combobox 프리미티브를 감싼 검색형 단일 선택 컴포넌트다.
// 도메인 폼/테이블에서 options 배열만 넘기면 되도록 기존 호출부 API를 유지한다.

interface ComboOption {
  value: string | number
  label: string
  sub?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined
    options: ComboOption[]
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
  }>(),
  {
    placeholder: '선택',
    disabled: false,
    allowClear: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selected = computed(
  () =>
    props.options.find((o) => String(o.value) === String(props.modelValue)) ??
    null,
)

function onModelUpdate(value: unknown) {
  if (value === null || value === undefined) return
  emit('update:modelValue', value as string | number)
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <Combobox
    :model-value="selected?.value ?? null"
    :disabled="disabled"
    @update:model-value="onModelUpdate"
  >
    <ComboboxAnchor class="w-full">
      <ComboboxTrigger
        :disabled="disabled"
        :class="
          cn(
            'group flex w-full items-center gap-1.5 rounded-[4px] border border-hw-gray-lighter bg-white px-2.5 py-2 text-left outline-none transition-[border-color,box-shadow] duration-[160ms] ease-smooth focus:border-hw-orange-main focus:shadow-[0_0_0_2px_rgba(243,115,33,0.15)] data-[state=open]:border-hw-orange-main',
            disabled && 'cursor-not-allowed opacity-60',
          )
        "
      >
        <span
          class="flex-1 truncate text-[13px] font-normal leading-none tracking-[-0.2px]"
          :class="selected ? 'text-hw-gray-darker' : 'text-hw-gray-light'"
        >
          {{ selected ? selected.label : placeholder }}
        </span>
        <XIcon
          v-if="selected && allowClear && !disabled"
          class="size-3.5 shrink-0 text-hw-gray-main hover:text-hw-gray-darker"
          @click.stop.prevent="clear"
          @pointerdown.stop.prevent
        />
        <ChevronDownIcon
          class="size-4 shrink-0 text-hw-gray-main transition-transform duration-[160ms] ease-smooth group-data-[state=open]:rotate-180"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList>
      <ComboboxInput placeholder="검색" />
      <ComboboxEmpty
        class="py-3 text-center text-xs leading-[1.4] text-hw-gray-main"
      >
        일치하는 항목이 없습니다.
      </ComboboxEmpty>
      <ComboboxGroup>
        <ComboboxItem
          v-for="o in options"
          :key="String(o.value)"
          :value="o.value"
          class="gap-2"
        >
          <span
            class="flex-1 truncate text-[13px] font-normal leading-[1.3] tracking-[-0.2px] text-hw-gray-darker"
          >
            {{ o.label }}
          </span>
          <span
            v-if="o.sub"
            class="shrink-0 text-[11px] font-normal leading-none text-hw-gray-main"
          >
            {{ o.sub }}
          </span>
          <ComboboxItemIndicator>
            <CheckIcon class="size-3.5 text-hw-orange-main" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>
