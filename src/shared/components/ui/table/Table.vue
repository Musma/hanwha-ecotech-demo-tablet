<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="table-container" class="relative w-full overflow-x-auto">
    <table data-slot="table" :class="cn(tableVariants(), props.class)">
      <slot />
    </table>
  </div>
</template>
