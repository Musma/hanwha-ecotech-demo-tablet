<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableRowVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <tr data-slot="table-row" :class="cn(tableRowVariants(), props.class)">
    <slot />
  </tr>
</template>
