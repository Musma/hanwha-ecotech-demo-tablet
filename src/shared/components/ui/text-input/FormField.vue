<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { computed, useId } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { provideFormField } from '.'

import type { FieldSize, FieldStatus } from '.'

interface Props {
  status?: FieldStatus
  size?: FieldSize
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  status: 'default',
  size: 'l',
  disabled: false,
  class: undefined,
})

// 자식(FieldLabel·TextInput·HelperText)이 공유할 id·상태·사이즈를 한 번만 만든다.
const uid = useId()
provideFormField({
  inputId: `${uid}-input`,
  helperId: `${uid}-helper`,
  status: computed(() => props.status ?? 'default'),
  size: computed(() => props.size ?? 'l'),
  disabled: computed(() => props.disabled ?? false),
})
</script>

<template>
  <div data-slot="form-field" :class="cn('flex flex-col gap-0.5', props.class)">
    <slot />
  </div>
</template>
