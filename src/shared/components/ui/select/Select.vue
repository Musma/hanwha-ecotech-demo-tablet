<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { ChevronDownIcon } from '@lucide/vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { computed, ref } from 'vue'

import { cn } from '@/shared/helpers/utils'

import type { SelectOption, SelectSize } from '.'

defineOptions({ inheritAttrs: false })

interface Props {
  options: SelectOption[]
  placeholder?: string
  size?: SelectSize
  disabled?: boolean
  /**
   * 입력 필드에 타이핑해 항목을 필터링할 수 있게 한다. 기본은 `false`(순수
   * Select — 클릭하면 열리고 목록에서 고른다). `true` 면 검색형 콤보박스로
   * 동작한다(= 기존 SearchSelect). 검색은 이 한 prop 으로만 켜지므로 두 모드가
   * 시각적으로 동일하게 유지된다.
   */
  searchable?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  size: 'm',
  disabled: false,
  searchable: false,
  class: undefined,
})

// 선택된 value(string)를 부모로 양방향 바인딩한다. ComboboxRoot 의
// v-model 과 그대로 연결되어 선택값이 부모로 반영된다.
const model = defineModel<string>()

// 메뉴 열림 상태를 제어한다. reka-ui 기본은 트리거(화살표)로만 열리므로,
// 입력 필드를 클릭해도 열리도록 직접 연다.
const open = ref(false)

// ComboboxInput 의 표시 텍스트. value -> label 로 변환해 보여준다.
// (searchable 일 때는 입력 중 reka-ui 가 자체 검색어로 필터링하고, 닫히면
//  다시 선택값 label 로 복귀한다. 비검색형은 항상 선택값 label 만 보여준다.)
const displayValue = computed(
  () => (value: unknown) =>
    props.options.find((o) => o.value === value)?.label ?? '',
)

// 사이즈별 치수(Figma M=5354-2624, S=5357-2733).
// - M: 필드 32px / 폰트 B3(14) / chevron 16
// - S: 필드 24px / 폰트 C1(12) / chevron 14
const sizeClasses = computed(() =>
  props.size === 's'
    ? { field: 'h-6', font: 'text-c1', chevron: 'size-3.5' }
    : { field: 'h-8', font: 'text-b3', chevron: 'size-4' },
)
</script>

<template>
  <ComboboxRoot
    v-model="model"
    v-model:open="open"
    :disabled="disabled"
    :ignore-filter="!searchable"
    data-slot="select"
    :data-size="size"
    :data-searchable="searchable ? '' : undefined"
  >
    <ComboboxAnchor as-child>
      <div
        :class="
          cn(
            // 필드(트리거): radius 4px, 보더 gray-light, 열림/포커스 시 orange-main.
            // 너비는 w-full(부모가 폭 제어), 높이는 size별.
            'group relative flex w-full items-center rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main pr-8 pl-2 transition-colors',
            sizeClasses.field,
            'focus-within:border-hw-orange-main data-[state=open]:border-hw-orange-main',
            'data-[disabled]:cursor-not-allowed data-[disabled]:bg-hw-white-lighter',
            // 비검색형은 필드 전체가 클릭 대상이므로 포인터 커서.
            !searchable && 'cursor-pointer',
            props.class,
          )
        "
        @click="!disabled && !searchable && (open = true)"
      >
        <ComboboxInput
          :display-value="displayValue"
          :placeholder="placeholder"
          :readonly="!searchable"
          v-bind="$attrs"
          :class="
            cn(
              'flex-1 bg-transparent text-hw-gray-dark outline-none placeholder:text-hw-gray-light disabled:cursor-not-allowed disabled:text-hw-gray-main',
              sizeClasses.font,
              // 비검색형: 타이핑 불가 — 캐럿/텍스트선택 숨기고 포인터 유지.
              !searchable && 'cursor-pointer caret-transparent select-none',
            )
          "
          @click="!disabled && searchable && (open = true)"
        />
        <ComboboxTrigger
          class="absolute right-2 flex items-center justify-center text-hw-gray-dark"
          tabindex="-1"
        >
          <ChevronDownIcon
            :class="
              cn(
                'shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-180',
                sizeClasses.chevron,
              )
            "
          />
        </ComboboxTrigger>
      </div>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="4"
        data-slot="select-content"
        class="z-50 max-h-72 w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main shadow-sm"
      >
        <ComboboxViewport class="max-h-72 overflow-y-auto p-2">
          <ComboboxEmpty
            v-if="searchable"
            class="py-2 text-center text-b3 text-hw-gray-main"
          >
            검색 결과가 없습니다
          </ComboboxEmpty>
          <ComboboxItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            data-slot="select-item"
            :class="
              cn(
                // 항목 텍스트: hw-gray-dark, 폰트는 size별. 선택 시 흰색.
                'relative flex w-full cursor-pointer items-center rounded-[4px] px-2 py-1 text-hw-gray-dark outline-none select-none',
                sizeClasses.font,
                // hover/키보드 활성(reka-ui data-highlighted) = orange-lighter/10, 글자색 유지.
                'data-highlighted:bg-hw-orange-lighter/10',
                // 선택된 값(data-state=checked) = orange-main + white. 둘 다일 때 선택이 우선.
                'data-[state=checked]:bg-hw-orange-main data-[state=checked]:text-hw-white-main',
                'data-disabled:pointer-events-none data-disabled:opacity-50',
              )
            "
          >
            {{ option.label }}
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
