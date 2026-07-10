<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { computed } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { fieldLabelVariants, useFormField } from '.'

import type { FieldSize } from '.'

interface Props {
  size?: FieldSize
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  class: undefined,
})

// FormField 안이면 input 과 자동 연결(for)하고 size 를 상속한다.
const field = useFormField()
const resolvedSize = computed(() => props.size ?? field?.size.value ?? 'l')
</script>

<template>
  <label
    :for="field?.inputId"
    data-slot="field-label"
    :class="cn(fieldLabelVariants({ size: resolvedSize }), props.class)"
  >
    <slot />
  </label>
</template>
