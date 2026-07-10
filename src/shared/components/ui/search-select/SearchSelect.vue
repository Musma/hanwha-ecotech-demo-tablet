<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Select } from '@/shared/components/ui/select'

import type { SearchSelectOption, SearchSelectSize } from '.'

defineOptions({ inheritAttrs: false })

// 입력형 검색 Dropdown. 시각/동작은 `Select` 와 동일하며, 검색 필터가 항상
// 켜진 형태(`searchable`)다. 기존 API(options/placeholder/size/disabled)는
// 그대로 유지해 호출처를 바꾸지 않는다. 추가 속성($attrs)과 v-model 은
// Select 로 그대로 위임한다.
interface Props {
  options: SearchSelectOption[]
  placeholder?: string
  size?: SearchSelectSize
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  size: 'm',
  disabled: false,
  class: undefined,
})

const model = defineModel<string>()
</script>

<template>
  <Select
    v-model="model"
    searchable
    :options="props.options"
    :placeholder="props.placeholder"
    :size="props.size"
    :disabled="props.disabled"
    :class="props.class"
    v-bind="$attrs"
  />
</template>
