// jibun 관리 화면 전용 선택 규칙 helper.
// 야드 polygon 변환은 dashboard에서도 쓰므로 shared helper에 둔다.

import { parseLocalPolyString } from '@/shared/helpers/map/map-geo-helpers'
import {
  createYardJibunPolygons,
  getYardJibunKindByLevel,
} from '@/shared/helpers/map/yard-jibun-polygons'

import type { Jibun } from '../types/jibun'

export const createInitialJibunPolygons = createYardJibunPolygons

export function getSelectableJibunPolygonId(
  jibuns: Jibun[],
  selectedJibunId: number | null,
): string | null {
  if (selectedJibunId == null) return null
  const byId = new Map(
    (Array.isArray(jibuns) ? jibuns : []).map((jibun) => [jibun.id, jibun]),
  )
  let current = byId.get(selectedJibunId)
  while (current) {
    const renderable =
      getYardJibunKindByLevel(current.level) || current.level === 1
    if (renderable && parseLocalPolyString(current.poly).length >= 3) {
      return `jibun-${current.id}`
    }
    if (current.parent == null) break
    current = byId.get(current.parent)
  }
  return null
}

// 겹친 폴리곤 id 목록 중 가장 깊은 레벨의 지번 id를 고른다(레벨 우선 클릭 규칙).
export function getPriorityJibunId(
  ids: string[],
  jibuns: Jibun[],
): number | null {
  const byId = new Map(
    (Array.isArray(jibuns) ? jibuns : []).map((jibun) => [jibun.id, jibun]),
  )
  let best: { id: number; level: number } | null = null
  for (const measureId of Array.isArray(ids) ? ids : []) {
    if (typeof measureId !== 'string' || !measureId.startsWith('jibun-'))
      continue
    const jibun = byId.get(Number(measureId.slice('jibun-'.length)))
    if (!jibun) continue
    if (best === null || jibun.level > best.level)
      best = { id: jibun.id, level: jibun.level }
  }
  return best ? best.id : null
}
