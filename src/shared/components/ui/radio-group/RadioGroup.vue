<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { RadioGroupRoot, useForwardPropsEmits } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui'

interface Props extends RadioGroupRootProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
})

const emits = defineEmits<RadioGroupRootEmits>()

// props + v-model 이벤트(update:modelValue)를 RadioGroupRoot 로 함께 위임한다.
// emit 을 포워딩하지 않으면 선택 시 값이 부모로 돌아오지 않아 선택이 반영되지 않는다.
const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RadioGroupRoot
    v-bind="forwarded"
    data-slot="radio-group"
    :class="cn('grid gap-2', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
