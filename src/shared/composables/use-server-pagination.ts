import { computed, ref, watch } from 'vue'

/**
 * 서버 사이드 페이지네이션 composable (데이터 패칭 비포함).
 *
 * 페이지 상태(page / itemsPerPage)와 서버 요청 파라미터(`queryParams`)·전체
 * 개수(`total`)만 관리한다. 실제 fetch/캐시는 TanStack Query(`useQuery`) 등
 * 호출 측이 담당한다 — `queryParams` 를 query key/fn 에 넘기고, 응답의 전체
 * 개수를 `setTotal()`(또는 `total` 직접 설정)로 반영하면 된다.
 *
 * @example
 * ```ts
 * const { page, itemsPerPage, total, queryParams, setTotal } =
 *   useServerPagination({ itemsPerPage: 10 })
 *
 * // TanStack Query 와 조립(설치 후):
 * // const { data } = useQuery({
 * //   queryKey: ['users', queryParams],            // queryParams 변하면 자동 재요청
 * //   queryFn: () => fetchUsers(queryParams.value), // { page, itemsPerPage, offset, limit }
 * // })
 * // watch(() => data.value?.total, (t) => t != null && setTotal(t))
 * ```
 * ```vue
 * <Pagination
 *   v-model:page="page"
 *   v-model:items-per-page="itemsPerPage"
 *   :total="total"
 * />
 * ```
 *
 * @param options.itemsPerPage  페이지당 항목 수 초기값(기본 10).
 * @param options.initialPage   시작 페이지(1-base, 기본 1).
 */
export interface UseServerPaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

/** 서버에 그대로 전달하는 페이지네이션 파라미터. */
export interface ServerPaginationParams {
  /** 현재 페이지(1-base). */
  page: number
  /** 페이지당 항목 수. */
  itemsPerPage: number
  /** 건너뛸 항목 수 `(page - 1) * itemsPerPage`. offset 기반 API 용. */
  offset: number
  /** 가져올 항목 수 `= itemsPerPage`. limit 기반 API 용. */
  limit: number
}

export function useServerPagination(options: UseServerPaginationOptions = {}) {
  /** 현재 페이지(1-base). `Pagination` 의 `v-model:page` 에 바인딩한다. */
  const page = ref(options.initialPage ?? 1)
  /** 페이지당 항목 수. `v-model:items-per-page` 에 바인딩한다. */
  const itemsPerPage = ref(options.itemsPerPage ?? 10)
  /** 전체 항목 수(서버 응답으로 채운다). `Pagination` 의 `:total` 에 넘긴다. */
  const total = ref(0)

  /** 전체 페이지 수(최소 1). */
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / itemsPerPage.value)),
  )

  /** 서버 요청 파라미터(반응형). query key/fn 에 펼쳐 쓴다. */
  const queryParams = computed<ServerPaginationParams>(() => ({
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
    limit: itemsPerPage.value,
  }))

  /** 서버 응답의 전체 개수를 반영한다. */
  function setTotal(value: number) {
    total.value = value
  }

  // 페이지당 항목 수가 바뀌면 첫 페이지로 리셋한다(다음 요청은 page=1 로 나간다).
  watch(itemsPerPage, () => {
    page.value = 1
  })

  return { page, itemsPerPage, total, pageCount, queryParams, setTotal }
}
