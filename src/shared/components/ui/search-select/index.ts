export { default as SearchSelect } from './SearchSelect.vue'

/**
 * 입력형 검색 Dropdown(combobox). `Select` 를 `searchable` 로 켠 얇은 래퍼다 —
 * 시각/색/사이즈/메뉴 동작은 모두 `Select`(`shared/components/ui/select`)와
 * 동일하며, 검색 필터만 항상 켜져 있다. 새 코드는 `Select`(searchable prop)
 * 사용을 권장하되, 기존 호출처 호환을 위해 이 래퍼를 유지한다.
 *
 * 타입은 `Select` 의 것을 그대로 재사용(별칭)해 단일 소스를 유지한다.
 */
export type {
  SelectOption as SearchSelectOption,
  SelectSize as SearchSelectSize,
} from '@/shared/components/ui/select'
