export { default as Select } from './Select.vue'

/**
 * Dropdown Select. 기본은 순수 Select(클릭하면 열리고 목록에서 고른다).
 * `searchable` prop 을 켜면 입력 필드 타이핑으로 항목을 필터링하는 검색형
 * 콤보박스로 동작한다(= `SearchSelect`). 두 모드는 reka-ui `Combobox` 하나
 * 위에서 동작하며 시각적으로 동일하다 — 차이는 `searchable` 한 prop 뿐이다.
 *
 * - `searchable: false`(기본): 필드 `readonly` + `ignore-filter`. 필드 전체가
 *   클릭 대상이라 열리고, 캐럿·텍스트선택을 숨긴다.
 * - `searchable: true`: 입력 타이핑 → reka-ui 기본 필터로 항목이 좁혀진다.
 *   필터 결과가 없으면 "검색 결과가 없습니다"를 표시한다.
 *
 * 선택값은 `v-model`(string value) 로 양방향 바인딩한다. 라벨(Title)은 이
 * 컴포넌트에 포함하지 않는다 — 외부에서 FieldLabel / FormField 로 조립한다
 * (text-input·DatePicker 와 동일 사고). 컴포넌트는 필드(트리거) + 메뉴만.
 *
 * Figma 노드 5354-2624(03.Dropdown, size M), S=5357-2733.
 *
 * Field metrics (Figma M):
 * - height 32px(`h-8`), radius 4px(`rounded-[4px]`, off-scale -> arbitrary)
 * - 입력 텍스트 B3.Body 14/250 -> `text-b3`, colour `text-hw-gray-dark`
 * - placeholder(Body) #ccc -> `text-hw-gray-light`
 * - surface `bg-hw-white-main`
 *
 * Border colours (Figma -> hw-* tokens):
 * - default / normal: #cccccc -> `border-hw-gray-light`(EXACT)
 * - active(open) / focus: #f37321 -> `border-hw-orange-main`(EXACT). open 은
 *   runtime 상태(`data-[state=open]`)이지 디자인 variant prop 이 아니다.
 *
 * Menu / item colours (Figma -> hw-* tokens):
 * - menu surface white -> `bg-hw-white-main`, border #ccc -> `border-hw-gray-light`
 * - item text -> `hw-gray-dark`(#444648, M·S 공통)
 * - highlighted/selected: #f37321 + white -> `bg-hw-orange-main text-hw-white-main`
 * - hover: rgba(251,181,132,0.1) = orange-lighter 10% -> `bg-hw-orange-lighter/10`
 *
 * Width: 고정 px 금지. 필드는 `w-full`, 메뉴는 트리거 너비
 * (`--reka-combobox-trigger-width`)에 맞춘다.
 *
 * Size (Figma M=5354-2624, S=5357-2733):
 * - M: 필드 32px(h-8) / 입력·항목 B3(14) / chevron 16
 * - S: 필드 24px(h-6) / 입력·항목 C1(12) / chevron 14
 * 라벨(Title) 폰트(M=S2, S=S3)는 외부 FieldLabel size 가 담당한다.
 */
export interface SelectOption {
  label: string
  value: string
}

export type SelectSize = 'm' | 's'
