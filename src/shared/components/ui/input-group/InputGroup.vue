<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/shared/helpers/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="input-group"
    role="group"
    :class="
      cn(
        'border-hw-white-darker dark:bg-hw-white-darker/30 has-[[data-slot=input-group-control]:focus-visible]:border-hw-gray-main has-[[data-slot=input-group-control]:focus-visible]:ring-hw-gray-main/50 has-[[data-slot][aria-invalid=true]]:ring-hw-red-dark/20 has-[[data-slot][aria-invalid=true]]:border-hw-red-dark dark:has-[[data-slot][aria-invalid=true]]:ring-hw-red-dark/40 h-9 rounded-md border shadow-xs transition-[color,box-shadow] in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-3 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5 group/input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
