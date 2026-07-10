<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import { switchThumbVariants, switchVariants } from '.'

import type { SwitchVariants } from '.'
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui'

interface Props extends SwitchRootProps {
  size?: SwitchVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  size: 'l',
})

const emits = defineEmits<SwitchRootEmits>()

// props + v-model 이벤트(update:modelValue)를 SwitchRoot 로 함께 위임한다.
// emit 을 포워딩하지 않으면 클릭 시 상태가 부모로 돌아오지 않아 토글되지 않는다.
const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    data-slot="switch"
    :data-size="size"
    :class="cn(switchVariants({ size }), props.class)"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="switchThumbVariants({ size })"
    />
  </SwitchRoot>
</template>
