<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { useVModel } from '@vueuse/core'

import { cn } from '@/shared/helpers/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
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
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="
      cn(
        'border-hw-white-darker dark:bg-hw-white-darker/30 focus-visible:border-hw-gray-main focus-visible:ring-hw-gray-main/50 aria-invalid:ring-hw-red-dark/20 dark:aria-invalid:ring-hw-red-dark/40 aria-invalid:border-hw-red-dark dark:aria-invalid:border-hw-red-dark/50 rounded-md border bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-3 aria-invalid:ring-3 md:text-sm flex field-sizing-content min-h-16 w-full outline-none placeholder:text-hw-gray-main disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
