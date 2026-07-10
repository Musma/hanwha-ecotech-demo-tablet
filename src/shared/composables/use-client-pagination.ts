import type { MaybeRefOrGetter } from 'vue'

import { computed, ref, toValue, watch } from 'vue'

/**
 * 클라이언트 사이드 페이지네이션 composable.
 *
 * 메모리에 이미 있는 전체 배열을 받아 현재 페이지에 해당하는 슬라이스를
 * 돌려준다. 표시는 `Table`, 컨트롤은 `Pagination` 으로 조립한다(둘은
 * presentational 유지). 데이터 fetch 가 필요한 경우는 `useServerPagination`.
 *
 * @example
 * ```ts
 * const { page, itemsPerPage, total, pageItems } =
 *   useClientPagination(rows, { itemsPerPage: 10 })
 * ```
 * ```vue
 * <Table>
 *   <TableBody>
 *     <TableRow v-for="r in pageItems" :key="r.id"> ... </TableRow>
 *   </TableBody>
 * </Table>
 * <Pagination
 *   v-model:page="page"
 *   v-model:items-per-page="itemsPerPage"
 *   :total="total"
 * />
 * ```
 *
 * @param items  전체 항목. 값/ref/getter 모두 허용한다(필터링된 computed 가능).
 * @param options.itemsPerPage  페이지당 항목 수 초기값(기본 10).
 * @param options.initialPage   시작 페이지(1-base, 기본 1).
 */
export interface UseClientPaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

export function useClientPagination<T>(
  items: MaybeRefOrGetter<T[]>,
  options: UseClientPaginationOptions = {},
) {
  /** 현재 페이지(1-base). `Pagination` 의 `v-model:page` 에 바인딩한다. */
  const page = ref(options.initialPage ?? 1)
  /** 페이지당 항목 수. `v-model:items-per-page` 에 바인딩한다. */
  const itemsPerPage = ref(options.itemsPerPage ?? 10)

  /** 전체 항목 수. `Pagination` 의 `:total` 에 넘긴다. */
  const total = computed(() => toValue(items).length)
  /** 전체 페이지 수(최소 1). */
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / itemsPerPage.value)),
  )

  /** 현재 페이지에 해당하는 항목 슬라이스. */
  const pageItems = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value
    return toValue(items).slice(start, start + itemsPerPage.value)
  })

  // 페이지당 항목 수가 바뀌면 첫 페이지로 리셋한다(Pagination 동작과 일치).
  watch(itemsPerPage, () => {
    page.value = 1
  })

  // 데이터가 줄어(필터 등) 현재 페이지가 범위를 벗어나면 마지막 페이지로 보정.
  watch([total, itemsPerPage], () => {
    if (page.value > pageCount.value) page.value = pageCount.value
  })

  return { page, itemsPerPage, total, pageCount, pageItems }
}
