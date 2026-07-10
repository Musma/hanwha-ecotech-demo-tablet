<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { CheckIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import {
  checkboxBoxVariants,
  checkboxIndicatorVariants,
  checkboxVariants,
} from '.'

import type { CheckboxVariants } from '.'
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'

interface Props extends CheckboxRootProps {
  size?: CheckboxVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  size: 'l',
})

const emits = defineEmits<CheckboxRootEmits>()

// props + v-model 이벤트(update:modelValue)를 CheckboxRoot 로 함께 위임한다.
// emit 을 포워딩하지 않으면 클릭 시 상태가 부모로 돌아오지 않아 토글되지 않는다.
const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    data-slot="checkbox"
    :data-size="size"
    :class="cn(checkboxVariants({ size }), props.class)"
  >
    <span :class="checkboxBoxVariants({ size })" />
    <CheckboxIndicator :class="checkboxIndicatorVariants({ size })">
      <CheckIcon :stroke-width="3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
