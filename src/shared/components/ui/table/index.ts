import { cva } from 'class-variance-authority'

export { default as Table } from './Table.vue'
export { default as TableHeader } from './TableHeader.vue'
export { default as TableBody } from './TableBody.vue'
export { default as TableRow } from './TableRow.vue'
export { default as TableHead } from './TableHead.vue'
export { default as TableCell } from './TableCell.vue'

/**
 * Table (시맨틱 표).
 *
 * Figma 노드 5435-15713 ("Container"). 헤더 행 1개(`Frame6357220`
 * Variant5, node 5250:9753) + 바디 행 1개(Variant6, node 5250:9784)로 구성된
 * 단순 표다. 정렬/필터/페이지네이션 같은 data-table 기능은 디자인에 없으며,
 * 사이즈 variant·zebra(홀짝 배경)·hover/selected 행 상태도 디자인에 없다 —
 * 따라서 만들지 않는다. 행/셀 개수는 디자인상 6열이지만 컴포넌트는
 * 열 수를 강제하지 않는다(슬롯 조립).
 *
 * 컴포지션(shadcn-vue 구조 참고, 스타일은 Figma·hw-* 토큰 직접 매핑):
 * - Table       -> `<table>` (바깥 테두리 + overflow 래퍼)
 * - TableHeader  -> `<thead>` (헤더 배경 + 헤더 행 구분선 색)
 * - TableBody    -> `<tbody>`
 * - TableRow     -> `<tr>`    (행 하단 구분선)
 * - TableHead    -> `<th>`    (헤더 셀: 가운데 정렬)
 * - TableCell    -> `<td>`    (바디 셀: 왼쪽 정렬)
 * 데이터 배열 prop 을 강제하지 않는다. 컬럼/내용은 소비자가 자유 조립하고
 * 스타일만 일관되게 입는다.
 *
 * Metrics (Figma):
 * - 텍스트: 헤더·바디 모두 B3.Body 14/20/250 -> `text-b3`
 * - 헤더 셀 패딩: 좌우 14px(`px-3.5`) · 상하 10px(`py-2.5`), 가운데 정렬
 * - 바디 셀 패딩: 좌우 14px(`px-3.5`) · 상하 12px(`py-3`), 왼쪽 정렬
 * - 바깥 모서리 radius 없음, 셀은 `align-middle`
 *
 * Colour mapping (Figma -> hw-* 토큰, 모두 EXACT):
 * - 바깥 테두리       White/darker #eaeaea -> `border-hw-white-darker`
 * - 헤더 배경         White/dark   #eeeeee -> `bg-hw-white-dark`
 * - 헤더 행 하단 구분선 White/darker #eaeaea -> `border-hw-white-darker`
 * - 헤더 셀 세로 구분선 White/darker #eaeaea -> `border-hw-white-darker`
 * - 헤더 텍스트       Gray/darker  #1d1f21 -> `text-hw-gray-darker`
 * - 바디 배경         White/main   #ffffff -> `bg-hw-white-main`
 * - 바디 행 하단 구분선 White/dark   #eeeeee -> `border-hw-white-dark`
 * - 바디 셀 세로 구분선 White/lighter #f4f6f9 -> `border-hw-white-lighter`
 * - 바디 텍스트       Gray/dark    #444648 -> `text-hw-gray-dark`
 *
 * Width: 고정 px 금지. `<table>` 는 `w-full` 이며 부모/컬럼이 폭을 제어한다.
 */
export const tableVariants = cva(
  'w-full caption-bottom border-collapse border border-hw-white-darker text-b3',
)

/** 헤더 영역(`<thead>`). 헤더 배경과 헤더 행 구분선 색을 부여한다. */
export const tableHeaderVariants = cva(
  'bg-hw-white-dark [&_tr]:border-hw-white-darker',
)

/** 바디 영역(`<tbody>`). 바디 배경. */
export const tableBodyVariants = cva('bg-hw-white-main')

/** 행(`<tr>`). 기본(바디) 하단 구분선은 White/dark, 헤더 행은 thead 가 덮어쓴다. */
export const tableRowVariants = cva('border-b border-hw-white-dark')

/** 헤더 셀(`<th>`). 가운데 정렬, 세로 구분선 White/darker. */
export const tableHeadVariants = cva(
  'border-r border-hw-white-darker px-3.5 py-2.5 text-center align-middle text-b3 text-hw-gray-darker',
)

/** 바디 셀(`<td>`). 왼쪽 정렬, 세로 구분선 White/lighter. */
export const tableCellVariants = cva(
  'border-r border-hw-white-lighter px-3.5 py-3 text-left align-middle text-b3 text-hw-gray-dark',
)
