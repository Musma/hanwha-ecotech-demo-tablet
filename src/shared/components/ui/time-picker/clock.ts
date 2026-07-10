/**
 * TimePicker 아날로그 시계 좌표·각도 계산 순수 함수
 * (Vue 반응성 없음, 컴포넌트 로컬 helper).
 *
 * 시계는 0~100 정규화 좌표계(SVG viewBox="0 0 100 100")로 그린다.
 * 중심은 (50,50). 12(시) 또는 0(분)이 최상단(12시 방향, -90도)이고
 * 시계방향으로 증가한다.
 */

/** 시계 중심 좌표(viewBox 0~100 기준). */
export const CENTER = 50

/**
 * 숫자 라벨이 놓이는 반지름.
 * Figma: 라벨 중심이 다이얼 중심에서 56px / dial 144px → 56/144*100 ≈ 38.9.
 */
export const LABEL_RADIUS = 38.9

/**
 * 다이얼 바깥 원(배경)의 반지름.
 * Figma: 다이얼 144px 이 clock 영역(144px)을 가득 채움 → 72/144*100 = 50.
 */
export const DIAL_RADIUS = 50

/**
 * 선택 마커(채워진 원)의 반지름.
 * Figma: 선택 마커 원 16px 지름 → 8/144*100 ≈ 5.6.
 */
export const MARKER_RADIUS = 5.6

/**
 * 시계 중심 점의 반지름.
 * Figma: 중심 점 8px 지름 → 4/144*100 ≈ 2.8.
 */
export const PIN_RADIUS = 2.8

/** 2D 좌표. */
export interface Point {
  x: number
  y: number
}

/**
 * 한 바퀴를 steps 등분했을 때 index 번째 위치의 좌표.
 * index 0 이 최상단(-90도), 시계방향으로 증가한다.
 *
 * @param index   0-based 위치(예: 시 1~12 는 12=0,1=1,…, 분 0,5,… 는 0=0,5=1,…)
 * @param steps   총 등분 수(시계·분 모두 12)
 * @param radius  중심에서의 거리
 */
export function pointOnDial(
  index: number,
  steps: number,
  radius: number,
): Point {
  // -90도(12시 방향)에서 시작해 시계방향으로 회전.
  const angle = (index / steps) * 2 * Math.PI - Math.PI / 2
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

/**
 * 포인터의 viewBox 좌표(0~100)를 다이얼 step 으로 변환한다(드래그/클릭 공통).
 * 최상단(12시 방향)이 step 0 이고 시계방향으로 증가한다.
 *
 * @param x      포인터의 viewBox x(0~100)
 * @param y      포인터의 viewBox y(0~100)
 * @param steps  총 등분 수(시=12, 분=60 → 분은 1분 단위)
 * @returns      0 ~ steps-1 범위의 step
 */
export function valueFromPoint(x: number, y: number, steps: number): number {
  const dx = x - CENTER
  const dy = y - CENTER
  // 12시 방향이 0, 시계방향으로 +. atan2(dx, -dy) 로 그 기준을 만든다.
  let angle = Math.atan2(dx, -dy)
  if (angle < 0) angle += 2 * Math.PI
  return Math.round((angle / (2 * Math.PI)) * steps) % steps
}
