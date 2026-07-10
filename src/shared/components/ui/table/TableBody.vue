<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { tableBodyVariants } from '.'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <tbody data-slot="table-body" :class="cn(tableBodyVariants(), props.class)">
    <slot />
  </tbody>
</template>
