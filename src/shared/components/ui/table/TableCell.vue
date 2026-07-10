<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableCellVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <td data-slot="table-cell" :class="cn(tableCellVariants(), props.class)">
    <slot />
  </td>
</template>
