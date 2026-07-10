<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { DialogDescription, useForwardProps } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import type { DialogDescriptionProps } from 'reka-ui'

const props = defineProps<
  DialogDescriptionProps & { class?: HTMLAttributes['class'] }
>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="forwardedProps"
    :class="
      cn(
        'text-hw-gray-main *:[a]:hover:text-hw-gray-darker text-sm *:[a]:underline *:[a]:underline-offset-3',
        props.class,
      )
    "
  >
    <slot />
  </DialogDescription>
</template>
