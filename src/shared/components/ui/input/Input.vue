<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { useVModel } from '@vueuse/core'

import { cn } from '@/shared/helpers/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'w-full min-w-0 rounded-[4px] border border-hw-gray-lighter bg-white px-2.5 py-2  text-[13px] font-normal leading-none tracking-[-0.2px] text-hw-gray-darker outline-none transition-[border-color,box-shadow] duration-[160ms] ease-smooth placeholder:text-hw-gray-light focus:border-hw-orange-main focus:shadow-[0_0_0_2px_rgba(243,115,33,0.15)] read-only:cursor-not-allowed read-only:bg-hw-white-light read-only:text-hw-gray-main disabled:cursor-not-allowed disabled:bg-hw-white-light disabled:text-hw-gray-main file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-hw-gray-darker',
        props.class,
      )
    "
  />
</template>
