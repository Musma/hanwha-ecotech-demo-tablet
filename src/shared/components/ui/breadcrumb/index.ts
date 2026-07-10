import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as Breadcrumb } from './Breadcrumb.vue'

/**
 * Breadcrumb (경로 네비게이션).
 *
 * Figma 노드 5391-3381 ("Bread crumb", 242x24). 단일 컴포넌트로
 * size/state variant 는 디자인에 없다(hover 상태도 없음). 구성은
 * [홈 아이콘] > [Menu Name] > [Menu Name(현재 페이지)] 의 반복 구조다.
 *
 * API: `items` 배열(`BreadcrumbItem[] = { label, href? }`)을 받고 마지막
 * 항목을 현재 페이지로 처리한다(search-select 의 options 배열 사고). 라우팅은
 * 강제하지 않는다 — `href` 가 있으면 `<a>` 로, 없으면 텍스트로 렌더한다.
 * 선두 홈 아이콘은 Figma 에 있으므로 기본 노출하되 `home` prop 으로 끌 수 있다.
 *
 * 접근성: reka-ui 에 Breadcrumb primitive 가 없어 시맨틱
 * `<nav aria-label="Breadcrumb"><ol><li>` + 현재 항목 `aria-current="page"`,
 * separator 는 `aria-hidden` 으로 구현한다.
 *
 * Metrics (Figma):
 * - 높이 24px, 항목/구분자 정렬은 `items-center`
 * - 홈 아이콘 24px(`size-6`), 구분자 chevron 24px box(`size-6`)
 * - 텍스트 B2.Body 16/22/-0.2 -> `text-b2`
 *
 * Colour mapping (Figma -> hw-* 토큰, 모두 EXACT):
 * - 홈 아이콘 Orange/main #f37321 -> `text-hw-orange-main`
 * - 구분자 + 일반 항목 Gray/light #cccccc -> `text-hw-gray-light`
 * - 현재 페이지(마지막) Gray/darker #1d1f21 -> `text-hw-gray-darker`
 *
 * Width: 고정 px 금지. 루트 `<nav>` 는 콘텐츠 폭(`inline-flex`)이며 부모가
 * 폭/배치를 제어한다.
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

export const breadcrumbItemVariants = cva('text-b2 whitespace-nowrap', {
  variants: {
    current: {
      true: 'text-hw-gray-darker',
      false: 'text-hw-gray-light',
    },
  },
  defaultVariants: {
    current: false,
  },
})

export type BreadcrumbItemVariants = VariantProps<typeof breadcrumbItemVariants>
