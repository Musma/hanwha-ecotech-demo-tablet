<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { computed, useAttrs } from 'vue'

import { cn } from '@/shared/helpers/utils'

import { textInputVariants, useFormField } from '.'

import type { TextInputVariants } from '.'

defineOptions({ inheritAttrs: false })

interface Props {
  status?: TextInputVariants['status']
  size?: TextInputVariants['size']
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  size: undefined,
  disabled: undefined,
  class: undefined,
})

// Native <input> v-model. No reka-ui primitive is needed for a plain input.
const model = defineModel<string | number>()

const attrs = useAttrs()
// FormField 안이면 컨텍스트에서 id/status/disabled 를 받고, 단독 사용이면
// prop / 네이티브 attr 로 동작한다(둘 다 지원).
const field = useFormField()
// prop 이름과 겹치지 않게 resolved* 로 둔다(템플릿에서 prop shadowing 모호성 제거).
const resolvedStatus = computed(
  () => props.status ?? field?.status.value ?? 'default',
)
const resolvedSize = computed(() => props.size ?? field?.size.value ?? 'l')
const resolvedDisabled = computed(
  () => props.disabled ?? field?.disabled.value ?? false,
)
const inputId = computed(
  () => field?.inputId ?? (attrs.id as string | undefined),
)
</script>

<template>
  <input
    v-bind="attrs"
    :id="inputId"
    v-model="model"
    :disabled="resolvedDisabled"
    data-slot="text-input"
    :data-status="resolvedStatus"
    :data-size="resolvedSize"
    :aria-invalid="resolvedStatus === 'error' || undefined"
    :aria-describedby="field?.helperId"
    :class="
      cn(
        textInputVariants({ status: resolvedStatus, size: resolvedSize }),
        props.class,
      )
    "
  />
</template>
