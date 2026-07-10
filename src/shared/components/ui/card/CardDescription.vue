<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card-description"
    :class="cn('text-hw-gray-main text-sm', props.class)"
  >
    <slot />
  </div>
</template>
