<script setup lang="ts">
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/helpers/utils'

import { inputGroupButtonVariants } from '.'

import type { InputGroupButtonProps } from '.'

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  size: 'xs',
  variant: 'ghost',
})
</script>

<template>
  <Button
    type="button"
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
