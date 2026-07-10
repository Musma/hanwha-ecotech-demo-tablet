<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { ComboboxEmpty } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import type { ComboboxEmptyProps } from 'reka-ui'

const props = defineProps<
  ComboboxEmptyProps & { class?: HTMLAttributes['class'] }
>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <ComboboxEmpty
    data-slot="combobox-empty"
    v-bind="delegatedProps"
    :class="
      cn(
        'text-hw-gray-main hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex',
        props.class,
      )
    "
  >
    <slot />
  </ComboboxEmpty>
</template>
