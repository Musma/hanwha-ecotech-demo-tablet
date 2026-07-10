<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { CircleAlertIcon, CircleCheckIcon } from '@lucide/vue'
import { computed } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { helperTextVariants, useFormField } from '.'

import type { HelperTextVariants } from '.'

interface Props {
  status?: HelperTextVariants['status']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  class: undefined,
})

// FormField 안이면 status 를 컨텍스트에서 받고, id 를 helperId 로 노출해
// TextInput 의 aria-describedby 대상이 된다.
const field = useFormField()
const resolvedStatus = computed(
  () => props.status ?? field?.status.value ?? 'default',
)
</script>

<template>
  <p
    :id="field?.helperId"
    data-slot="helper-text"
    :data-status="resolvedStatus"
    :class="cn(helperTextVariants({ status: resolvedStatus }), props.class)"
  >
    <!-- Leading icon: custom via `icon` slot, else a status icon for error/success. -->
    <slot name="icon">
      <CircleAlertIcon v-if="resolvedStatus === 'error'" />
      <CircleCheckIcon v-else-if="resolvedStatus === 'success'" />
    </slot>
    <slot />
  </p>
</template>
