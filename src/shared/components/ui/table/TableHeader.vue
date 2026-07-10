<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableHeaderVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <thead
    data-slot="table-header"
    :class="cn(tableHeaderVariants(), props.class)"
  >
    <slot />
  </thead>
</template>
