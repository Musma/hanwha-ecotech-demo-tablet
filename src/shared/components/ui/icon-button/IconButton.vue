<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Primitive } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import { iconButtonVariants } from '.'

import type { IconButtonVariants } from '.'
import type { PrimitiveProps } from 'reka-ui'

interface Props extends PrimitiveProps {
  variant?: IconButtonVariants['variant']
  size?: IconButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  class: undefined,
  size: 'l',
  variant: 'fill',
})
</script>

<template>
  <Primitive
    data-slot="icon-button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(iconButtonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
