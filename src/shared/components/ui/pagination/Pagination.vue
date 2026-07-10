<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '@lucide/vue'
import {
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import { paginationItemVariants } from '.'
import RowsPerPageSelect from './RowsPerPageSelect.vue'

interface Props {
  /** 전체 항목 수. 페이지 수는 `total / itemsPerPage` 로 계산한다. */
  total: number
  /** 현재 페이지 좌우로 보일 번호 개수. */
  siblingCount?: number
  /** 첫/끝(« ») 버튼 노출 여부. Figma 기본은 노출(true). */
  showEdges?: boolean
  /** "Rows per page" 라벨+셀렉트 노출 여부. Figma 기본은 노출(true). */
  showRowsPerPage?: boolean
  /** 페이지당 행 수 선택 옵션. 기본 `[5, 10, 20, 50, 100]`(기본 선택값 10). */
  itemsPerPageOptions?: number[]
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
  showEdges: true,
  showRowsPerPage: true,
  itemsPerPageOptions: () => [5, 10, 20, 50, 100],
  class: undefined,
})

/** 현재 페이지(1-base). `v-model:page` 로 바인딩한다. */
const page = defineModel<number>('page', { default: 1 })

/** 페이지당 항목 수. `v-model:items-per-page` 로 바인딩한다. Figma 기본 10. */
const itemsPerPage = defineModel<number>('items-per-page', { default: 10 })

/** 페이지당 행 수를 바꾸면 현재 페이지를 1 로 리셋한다(표준 동작). */
function handleItemsPerPageChange(value: number) {
  itemsPerPage.value = value
  page.value = 1
}
</script>

<template>
  <PaginationRoot
    v-model:page="page"
    data-slot="pagination"
    :total="props.total"
    :items-per-page="itemsPerPage"
    :sibling-count="props.siblingCount"
    :show-edges="props.showEdges"
    :class="
      cn(
        props.showRowsPerPage
          ? 'flex w-full items-center justify-between gap-4'
          : 'inline-flex items-center',
        props.class,
      )
    "
  >
    <div
      v-if="props.showRowsPerPage"
      data-slot="pagination-rows-per-page"
      class="flex items-center gap-2"
    >
      <span class="text-b3 text-hw-gray-darker">Rows per page</span>
      <RowsPerPageSelect
        :model-value="itemsPerPage"
        :options="props.itemsPerPageOptions"
        @update:model-value="handleItemsPerPageChange"
      />
    </div>

    <div data-slot="pagination-nav" class="flex items-center gap-4">
      <PaginationFirst
        v-if="props.showEdges"
        data-slot="pagination-first"
        :class="cn(paginationItemVariants())"
      >
        <ChevronsLeftIcon :stroke-width="1.5" aria-hidden="true" />
      </PaginationFirst>

      <PaginationPrev
        data-slot="pagination-prev"
        :class="cn(paginationItemVariants())"
      >
        <ChevronLeftIcon :stroke-width="1.5" aria-hidden="true" />
      </PaginationPrev>

      <PaginationList
        v-slot="{ items }"
        data-slot="pagination-list"
        class="flex items-center gap-4"
      >
        <template v-for="(item, index) in items" :key="index">
          <PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            data-slot="pagination-item"
            :class="cn(paginationItemVariants({ active: item.value === page }))"
          >
            {{ item.value }}
          </PaginationListItem>
          <PaginationEllipsis
            v-else
            :index="index"
            data-slot="pagination-ellipsis"
            class="text-b3 text-hw-gray-darker inline-flex size-6 items-center justify-center select-none"
          >
            …
          </PaginationEllipsis>
        </template>
      </PaginationList>

      <PaginationNext
        data-slot="pagination-next"
        :class="cn(paginationItemVariants())"
      >
        <ChevronRightIcon :stroke-width="1.5" aria-hidden="true" />
      </PaginationNext>

      <PaginationLast
        v-if="props.showEdges"
        data-slot="pagination-last"
        :class="cn(paginationItemVariants())"
      >
        <ChevronsRightIcon :stroke-width="1.5" aria-hidden="true" />
      </PaginationLast>
    </div>
  </PaginationRoot>
</template>
