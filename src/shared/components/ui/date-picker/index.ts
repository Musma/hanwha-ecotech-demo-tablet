export { default as DatePicker } from './DatePicker.vue'

/**
 * 날짜 선택 DatePicker (Figma 05.Date — M 5357-2804 / Active 5357-2883,
 * S 5357-3477).
 *
 * 입력 필드를 클릭하면 달력 팝오버가 열리고, 날짜를 고르면 그 값이
 * 'YYYY-MM-DD' 문자열로 v-model 에 반영된다. 라벨(Date)은 이 컴포넌트에
 * 포함하지 않는다 — 외부에서 FieldLabel / FormField 로 조립한다(text-input·
 * search-select 와 동일 사고). 컴포넌트는 필드(트리거) + 달력만 담당한다.
 *
 * 구조 (reka-ui 프리미티브 조합):
 * - PopoverRoot / PopoverTrigger / PopoverPortal / PopoverContent : 팝오버
 * - CalendarRoot / CalendarHeader / CalendarHeading / CalendarPrev /
 *   CalendarNext / CalendarGrid / CalendarGridHead / CalendarHeadCell /
 *   CalendarGridBody / CalendarGridRow / CalendarCell / CalendarCellTrigger
 *   : 달력 본문. weekStartsOn=1(월요일 시작).
 * - 년 이동(« »)은 CalendarRoot 가 제공하지 않으므로 prevPage/nextPage 의
 *   step 을 'year' 로 넘기는 커스텀 버튼으로 구현한다.
 *
 * v-model 동작 (문자열 ↔ CalendarDate):
 * - 외부 인터페이스는 'YYYY-MM-DD' 문자열(`modelValue`).
 * - 내부에서 `@internationalized/date` 의 CalendarDate 로 변환해 CalendarRoot
 *   의 v-model 에 연결한다. 셀을 고르면 CalendarDate → 'YYYY-MM-DD'(toString)
 *   로 다시 직렬화해 부모로 emit 한다(빈 값이면 undefined).
 *
 * Field metrics (Figma M / S):
 * - 트리거 높이 M 32px(`h-8`) / S 24px(`h-6`), radius 4px(`rounded-[4px]`)
 * - 표시 텍스트 M B3(14)→`text-b3` / S C1(12)→`text-c1`, colour `text-hw-gray-dark`
 * - 캘린더 아이콘 M `size-4` / S `size-3.5`
 * - placeholder #ccc → `text-hw-gray-light`, surface `bg-hw-white-main`
 *
 * Colour 매핑 (Figma → hw-* tokens, hex 직접 사용 금지):
 * - 트리거 보더 default #cccccc → `border-hw-gray-light` (EXACT)
 * - 트리거 보더 active(open)/focus #f37321 → `border-hw-orange-main` (EXACT).
 *   open 은 runtime 상태(`data-[state=open]`)이지 디자인 variant 가 아니다.
 * - 달력 surface white → `bg-hw-white-main`, 보더 #ccc → `border-hw-gray-light`
 * - 헤더 제목/요일/이번 달 날짜: `text-hw-gray-dark`
 *   (노드 raw fill 은 #242e40 이나, 디자인 시스템 일관성상 gray-dark 로 통일)
 * - 헤더 nav 화살표 #ccc → `text-hw-gray-light`
 * - 다른 달(out-of-month) #ccc → `text-hw-gray-light`
 * - 선택일 #f37321 + white → `bg-hw-orange-main text-hw-white-main` + rounded
 * - hover/highlight: orange-lighter 10% → `bg-hw-orange-lighter/10`
 *
 * Typography (Pretendard 표기지만 전역은 HanwhaGothic 이므로 사이즈 토큰만 매핑):
 * - 헤더 제목 M S3(12)→`text-s3` / S C2(10)→`text-c2`
 * - 요일 헤더 M 12→`text-s3` / S 10→`text-c2`
 * - 날짜 셀 M C1(12)→`text-c1` / S C2(10)→`text-c2`, 셀 높이 M `h-6` / S `h-5`
 *
 * S 색 스냅(Figma raw → hw-* token, 노드 5357-3477):
 * - 다른 달 날짜 #d0d5dd → `text-hw-gray-light`(#ccc, 최근접; M outside-view 와 동일)
 * - Active 메뉴 보더 #bac7d5 → `border-hw-gray-light`(팔레트 외, 달력 보더 통일)
 * - 그 외 색·상태(선택일 orange-main+white, hover white-lighter+orange)는 M 과 동일.
 *
 * Width: 고정 px 금지. 트리거는 `w-full`(부모가 폭 제어), 팝오버는 트리거
 * 너비(`--reka-popper-anchor-width`)에 맞춘다.
 *
 * Size: M(5357-2804), S(5357-3477) 제공. 구조·동작은 공통이고 필드 높이/텍스트,
 * 아이콘, 달력 타이포, 셀 높이만 분기한다.
 */
export type DatePickerSize = 'm' | 's'
