import { DEFAULT_GRID_SIZE_METERS, TODAY } from '../constants/jibun-data'

import type { Jibun, OpStatus, OperationStrategy } from '../types/jibun'

export function findById(
  list: Jibun[],
  id: number | null | undefined,
): Jibun | null {
  if (id == null) return null
  return list.find((j) => j.id === id) ?? null
}

export function getChildren(list: Jibun[], id: number): Jibun[] {
  return list.filter((j) => j.parent === id)
}

export function getAncestors(list: Jibun[], id: number): Jibun[] {
  const out: Jibun[] = []
  let cur = findById(list, id)
  while (cur && cur.parent != null) {
    cur = findById(list, cur.parent)
    if (cur) out.push(cur)
  }
  return out
}

export function getDescendants(list: Jibun[], id: number): Jibun[] {
  const out: Jibun[] = []
  const walk = (pid: number) => {
    getChildren(list, pid).forEach((c) => {
      out.push(c)
      walk(c.id)
    })
  }
  walk(id)
  return out
}

export interface ResolvedInherited {
  value: unknown
  source: Jibun | null
}

export function resolveInheritedProp(
  list: Jibun[],
  jibun: Jibun | null,
  prop: keyof Jibun,
): ResolvedInherited {
  if (!jibun) return { value: null, source: null }
  const own = jibun[prop]
  if (own != null && own !== '') return { value: own, source: jibun }
  const ancs = getAncestors(list, jibun.id)
  for (const a of ancs) {
    const v = a[prop]
    if (v != null && v !== '') return { value: v, source: a }
  }
  return { value: null, source: null }
}

export function cellCode(yardN: number, x: number, y: number): string {
  return 'Y' + yardN + String(x).padStart(2, '0') + String(y).padStart(2, '0')
}

export function opStatus(op: OperationStrategy, today?: string): OpStatus {
  const t = today || TODAY
  if (op.to < t) return 'ended'
  if (op.from > t) return 'planned'
  return 'ongoing'
}

export const OP_STATUS_LABEL: Record<OpStatus, string> = {
  ongoing: '운영중',
  planned: '예정',
  ended: '종료',
}

export function findActiveOp(
  ops: OperationStrategy[],
  jibunId: number,
  today?: string,
): OperationStrategy | null {
  const t = today || TODAY
  return (
    ops
      .filter((o) => o.id === jibunId && opStatus(o, t) === 'ongoing')
      .sort((a, b) => (a.from < b.from ? 1 : -1))[0] ?? null
  )
}

export function makeJibunId(existing: Jibun[]): number {
  for (let i = 0; i < 30; i++) {
    const candidate = Math.floor(Math.random() * 89_000_000) + 10_000_000
    if (!existing.some((j) => j.id === candidate)) return candidate
  }
  return (Date.now() % 90_000_000) + 10_000_000
}

export function breadcrumb(list: Jibun[], jibun: Jibun | null): string {
  if (!jibun) return ''
  const chain = [...getAncestors(list, jibun.id).reverse(), jibun]
  return chain.map((c) => c.abbr).join(' / ')
}

function parsePolyPoints(
  poly: string | null | undefined,
): Array<{ x: number; y: number }> {
  if (!poly) return []
  return [
    ...String(poly).matchAll(/\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g),
  ]
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
}

export interface StartPhysical {
  col: number
  row: number
}

export function getStartPhysicalJibun(
  jibun: Pick<Jibun, 'poly'> | null | undefined,
): StartPhysical | null {
  const points = parsePolyPoints(jibun?.poly ?? null)
  if (points.length === 0) return null
  const cell = DEFAULT_GRID_SIZE_METERS || 10
  const minX = Math.min(...points.map((p) => p.x))
  const minY = Math.min(...points.map((p) => p.y))
  return {
    col: Math.max(0, Math.floor(minX / cell)),
    row: Math.max(0, Math.floor(minY / cell)),
  }
}

export function formatStartPhysicalJibun(
  jibun: Pick<Jibun, 'poly'> | null | undefined,
): string | null {
  const addr = getStartPhysicalJibun(jibun)
  if (!addr) return null
  const pad = (n: number) => String(n).padStart(3, '0')
  return `(${pad(addr.col)}, ${pad(addr.row)})`
}

export function getPolygonAreaSquareMeters(
  jibun: Pick<Jibun, 'poly'> | null | undefined,
): number | null {
  const points = parsePolyPoints(jibun?.poly ?? null)
  if (points.length < 3) return null
  let area = 0
  for (let i = 0; i < points.length; i += 1) {
    const cur = points[i]
    const nxt = points[(i + 1) % points.length]
    area += cur.x * nxt.y - nxt.x * cur.y
  }
  return Math.round(Math.abs(area) / 2)
}

export function getDisplayAreaSquareMeters(
  jibun: Jibun | null | undefined,
  list?: Jibun[],
): number | null {
  if (!jibun) return null
  if (jibun.level === 0 && Array.isArray(list)) {
    const children = getChildren(list, jibun.id)
    if (children.length > 0) {
      let sum = 0
      let counted = false
      children.forEach((child) => {
        const childArea = getPolygonAreaSquareMeters(child)
        if (childArea != null) {
          sum += childArea
          counted = true
        }
      })
      if (counted) return sum
    }
  }
  return getPolygonAreaSquareMeters(jibun)
}
