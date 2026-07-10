/**
 * TimePicker 시간 파싱·변환 순수 함수 (Vue 반응성 없음, 컴포넌트 로컬 helper).
 *
 * 외부 인터페이스는 'HH:mm' 24시간제 zero-pad 문자열('07:00','19:35').
 * 내부 UI 는 12시간제 + AM/PM 토글이므로 여기서 양방향 변환을 담당한다.
 * 분은 1분 단위(0~59)로 다룬다. 다이얼 숫자 라벨만 5분 격자로 표시한다.
 */

/** 내부 시간 상태: 24시간제 hour(0~23)와 1분 단위 minute(0~59). */
export interface TimeParts {
  /** 0~23 24시간제 */
  hour24: number
  /** 0~59 (1분 단위) */
  minute: number
}

/** AM/PM 토글 값. */
export type Meridiem = 'AM' | 'PM'

/** 다이얼에 표시하는 5분 격자 라벨(0,5,…,55). 선택은 1분 단위로 가능하다. */
export const MINUTE_STEPS: readonly number[] = Array.from(
  { length: 12 },
  (_, index) => index * 5,
)

/** 다이얼에 표시하는 시(1~12). 12 가 최상단(0도)이고 시계방향으로 1~11. */
export const HOUR_LABELS: readonly number[] = [
  12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
]

/** 2자리 zero-pad. */
function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

/**
 * 'HH:mm' 문자열 → TimeParts. 비었거나 형식이 맞지 않으면 undefined.
 * 분은 1분 단위(0~59) 그대로 유지한다.
 */
export function parseTime(value: string | undefined): TimeParts | undefined {
  if (!value) return undefined
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(value.trim())
  if (!match) return undefined

  const hour24 = Number(match[1])
  const minute = Number(match[2])
  if (
    !Number.isInteger(hour24) ||
    !Number.isInteger(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined
  }

  return { hour24, minute }
}

/** TimeParts → 'HH:mm' 24시간제 zero-pad 문자열. */
export function formatTime(parts: TimeParts): string {
  return `${pad2(parts.hour24)}:${pad2(parts.minute)}`
}

/** 24시간제 hour → 화면용 12시간제 hour(1~12). */
export function to12Hour(hour24: number): number {
  const hour12 = hour24 % 12
  return hour12 === 0 ? 12 : hour12
}

/** 24시간제 hour → AM/PM. */
export function toMeridiem(hour24: number): Meridiem {
  return hour24 < 12 ? 'AM' : 'PM'
}

/** 12시간제 hour(1~12) + AM/PM → 24시간제 hour(0~23). */
export function to24Hour(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12 // 12 → 0
  return meridiem === 'AM' ? base : base + 12
}
