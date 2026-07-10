<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import {
  radioDotVariants,
  radioIndicatorVariants,
  radioItemVariants,
  radioRingVariants,
} from '.'

import type { RadioItemVariants } from '.'
import type { RadioGroupItemProps } from 'reka-ui'

interface Props extends RadioGroupItemProps {
  size?: RadioItemVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  size: 'l',
})

// RadioGroupItem 은 emit 이 없고 group context 로 선택을 처리한다.
// props 만 위임한다.
const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <RadioGroupItem
    v-bind="forwarded"
    data-slot="radio-group-item"
    :data-size="size"
    :class="cn(radioItemVariants({ size }), props.class)"
  >
    <span :class="radioRingVariants({ size })" />
    <RadioGroupIndicator :class="radioIndicatorVariants()">
      <span :class="radioDotVariants({ size })" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
