export { default as DateTimePicker } from './DateTimePicker.vue'

/**
 * 날짜 + 시간 선택 DateTimePicker. 기존 DatePicker 의 달력과 TimePicker 의
 * 시계를 한 팝업 안에서 Date / Time 탭으로 합친 컴포넌트다.
 *
 * 구현은 새로 만들지 않고 두 패널을 재사용한다(중복 방지):
 * - 달력 본문 → `date-picker/CalendarPanel.vue` (DatePicker 도 동일 패널 사용)
 * - 시계 본문 → `time-picker/ClockPanel.vue` (TimePicker 도 동일 패널 사용)
 * - 팝업/탭 → reka-ui PopoverRoot + TabsRoot/TabsList/TabsTrigger/TabsContent
 *
 * 라벨(Date & Time)은 이 컴포넌트에 포함하지 않는다 — 외부에서 FieldLabel /
 * FormField 로 조립한다(DatePicker·TimePicker 와 동일 사고).
 *
 * v-model 동작 (결합 문자열 ↔ 날짜/시간):
 * - 외부 인터페이스는 'YYYY-MM-DD HH:mm' 결합 문자열(예 '2021-12-14 19:35').
 *   한쪽만 선택되면 그 부분만('2021-12-14' 또는 '19:35'), 둘 다 비면 undefined.
 * - 내부에서 토큰의 '-'(날짜) / ':'(시간)으로 분해해 CalendarPanel(YYYY-MM-DD)·
 *   ClockPanel(HH:mm) 각각에 연결하고, 변경되면 다시 결합해 emit 한다.
 *
 * 탭(Date / Time): reka TabsContent 는 비활성 시 unmount 되므로 탭을 오갈 때
 * 패널이 remount 된다(시계는 mount 시 시 모드로 초기화 — ClockPanel 참고).
 * 활성 탭은 orange-main 채움 + white 텍스트, 비활성은 orange-main 텍스트.
 *
 * Field metrics (M / S — DatePicker·TimePicker 와 동일):
 * - 트리거 높이 M 32px(`h-8`) / S 24px(`h-6`), radius 4px
 * - 표시 텍스트 M B3(14)→`text-b3` / S C1(12)→`text-c1`
 * - 탭 텍스트 M `text-b3` / S `text-c1`, 캘린더 아이콘 M `size-4` / S `size-3.5`
 * - placeholder 'YYYY-MM-DD 00:00'
 *
 * 색·radius·동작·패널 내부 사이즈는 모두 두 패널/픽커와 공통(신규 색 없음).
 *
 * Width: 고정 px 금지. 트리거 `w-full`, 팝오버는 트리거 너비에 맞춘다.
 *
 * Size: M / S 제공(DatePicker·TimePicker 와 동일).
 */
export type DateTimePickerSize = 'm' | 's'
