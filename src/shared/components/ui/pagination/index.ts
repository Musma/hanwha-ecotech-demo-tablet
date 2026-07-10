import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as Pagination } from './Pagination.vue'

/**
 * Pagination 의 개별 컨트롤(첫/이전/페이지번호/다음/끝) 공통 스타일.
 *
 * Figma node: `5267-26254` ("Type=Pagenation"), disabled 상태 `5267-26256`.
 * 메트릭: 컨트롤 박스 24×24(size-6), 컨트롤 간 간격 16px(gap-4),
 * 번호 타이포 B3.Body(text-b3 = 14/20/250), 화살표 아이콘 20px(size-5).
 *
 * 색 매핑(Figma → hw-* 토큰):
 * - 기본 텍스트/아이콘 `Gray/darker #1d1f21` → `text-hw-gray-darker`
 * - 현재(active) 원형 배경 `Orange/main #f37321` → `bg-hw-orange-main`
 * - 현재(active) 텍스트 `White/main #ffffff` → `text-hw-white-main`
 * - disabled 화살표 `Gray/light #cccccc` → `text-hw-gray-light`
 *   (node 5267-26256 에서 추출한 실제 색, 정확히 일치 — 스냅 없음)
 *
 * 파생 상태(PrimaryButton hover 준용):
 * - 활성(현재 페이지, fill 톤): `hover:opacity-90` (PrimaryButton fill/warning 과 동일).
 * - 비활성 번호·화살표(outline 톤): `hover:bg-hw-orange-lighter/40` 배경 틴트
 *   (PrimaryButton outline 과 동일). hover affordance 가 자연스럽게 보이도록
 *   활성 원형과 톤을 맞춰 `rounded-full` 적용.
 * - disabled(첫/이전 페이지=1, 끝/다음 마지막 페이지): `text-hw-gray-light`,
 *   `cursor-not-allowed`. reka 가 `<button disabled>` 로 렌더해 클릭은 막히고,
 *   hover 는 `enabled:hover:` 로 비활성 시 적용되지 않는다.
 * - cursor: 활성 컨트롤 `cursor-pointer`, disabled `cursor-not-allowed`.
 * - 전환: `transition-colors`(색만) + 항상 `rounded-full` 이라 active 가 다른
 *   번호로 옮겨갈 때 형태가 사각↔원형으로 깜빡이지 않는다.
 */
export const paginationItemVariants = cva(
  'inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-b3 text-hw-gray-darker outline-none transition-colors select-none disabled:cursor-not-allowed disabled:text-hw-gray-light [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      active: {
        true: 'bg-hw-orange-main text-hw-white-main enabled:hover:opacity-90',
        false: 'enabled:hover:bg-hw-orange-lighter/40',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export type PaginationItemVariants = VariantProps<typeof paginationItemVariants>

/**
 * Rows per page(페이지당 행 수) 셀렉트 — `Pagination` 에 통합.
 *
 * Figma node: `5267-26254` ("Type=Pagenation").
 * 레이아웃: `Rows per page` 라벨(좌) … 페이지 네비(우)가 한 줄에.
 * 라벨↔셀렉트 간격 8px(gap-2), 라벨 그룹↔네비는 `justify-between`.
 *
 * 메트릭/색(Figma → hw-* 토큰):
 * - 라벨 "Rows per page": B3.Body(text-b3) · `Gray/darker` → `text-hw-gray-darker`
 * - 셀렉트 박스: 67px(w-[67px]) · h-8 · rounded-[4px] · pl-2 pr-1 py-1 ·
 *   보더 `Gray/light #cccccc` → `border-hw-gray-light` · 배경 `White/main` → `bg-hw-white-main`
 * - 셀렉트 값 "10": text-b3 · `text-hw-gray-darker`, chevron `ChevronDownIcon` size-4
 * - 드롭다운 항목(SearchSelect 컨벤션): 텍스트 `text-hw-gray-dark`,
 *   hover `bg-hw-orange-lighter/10`, 선택 `bg-hw-orange-main text-hw-white-main`
 *
 * API(`Pagination.vue`):
 * - `v-model:items-per-page` (number, 양방향) — 변경 시 현재 페이지를 1 로 리셋
 * - `itemsPerPageOptions?: number[]` (기본값 `[5, 10, 20, 50, 100]`, 기본 선택 10)
 * - `showRowsPerPage?: boolean` (기본값 `true`)
 */
export { default as RowsPerPageSelect } from './RowsPerPageSelect.vue'
