<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableHeadVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <th
    data-slot="table-head"
    scope="col"
    :class="cn(tableHeadVariants(), props.class)"
  >
    <slot />
  </th>
</template>
