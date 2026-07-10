<script setup lang="ts">
import { ChevronDownIcon } from '@lucide/vue'
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

interface Props {
  /** 선택 가능한 페이지당 행 수 옵션. */
  options: number[]
}

defineProps<Props>()

/** 현재 페이지당 행 수. `v-model` 로 바인딩한다. */
const model = defineModel<number>({ required: true })
</script>

<template>
  <SelectRoot v-model="model" data-slot="rows-per-page-select">
    <!--
      트리거 박스: Figma node 5267-26254 메트릭에 충실.
      w-[67px]·h-8·rounded-[4px]·border gray-light·bg white-main·pl-2 pr-1 py-1.
      열림/포커스 시 보더 orange-main(프로젝트 SearchSelect 컨벤션).
    -->
    <SelectTrigger
      class="group flex h-8 w-[67px] cursor-pointer items-center justify-between rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main py-1 pr-1 pl-2 text-b3 text-hw-gray-darker outline-none transition-colors focus-visible:border-hw-orange-main data-[state=open]:border-hw-orange-main"
    >
      <SelectValue />
      <SelectIcon as-child>
        <ChevronDownIcon
          class="size-4 shrink-0 text-hw-gray-dark transition-transform duration-150 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        data-slot="rows-per-page-select-content"
        class="z-50 max-h-72 w-[var(--reka-select-trigger-width)] overflow-hidden rounded-[4px] border border-solid border-hw-gray-light bg-hw-white-main shadow-sm"
      >
        <SelectViewport class="max-h-72 overflow-y-auto p-2">
          <SelectItem
            v-for="option in options"
            :key="option"
            :value="option"
            data-slot="rows-per-page-select-item"
            class="relative flex w-full cursor-pointer items-center rounded-[4px] px-2 py-1 text-b3 text-hw-gray-dark outline-none select-none data-highlighted:bg-hw-orange-lighter/10 data-[state=checked]:bg-hw-orange-main data-[state=checked]:text-hw-white-main"
          >
            <SelectItemText>{{ option }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
