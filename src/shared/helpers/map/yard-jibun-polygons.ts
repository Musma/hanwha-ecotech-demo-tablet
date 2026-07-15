import {
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
} from '@/shared/constants/map-yard'
import type { LatLng, LocalPoint } from '@/shared/helpers/map/grid-utils'
import {
  convertLocalPolyPointToLngLat,
  normalizeGridBoundaryCoordinates,
  parseLocalPolyString,
} from '@/shared/helpers/map/map-geo-helpers'
import type { PolygonShape } from '@/shared/helpers/map/measurement-utils'

export interface YardJibunPolygonSource {
  id: number
  abbr?: string
  name?: string
  level: number
  parent?: number | null
  poly?: string | null
}

interface YardJibunLayoutItem {
  id: number
  parent?: number | null
  displayPrefix: string
  displayKind: string
  suffixNumber: number
  suffixWidth: number
  minX: number
  maxX: number
  minY: number
  maxY: number
}

const JIBUN_SUFFIX_PATTERN = /^(.*-)([A-Za-z]+)(\d+)$/
const SAME_ROW_OVERLAP_RATIO = 0.35
const ORIGINAL_ORDER_PARENT_ABBRS = new Set(['E1'])
const REVERSED_ORDER_PARENT_ABBRS = new Set(['NI'])
const REVERSED_MIXED_SUFFIX_PREFIXES = new Set(['02-'])
const REVERSED_MIXED_SUFFIX_PARENT_ABBRS = new Set(['02'])
const ORIGINAL_ORDER_YARD_ABBRS = new Set(['2Y'])

export function cloneYardGridBoundaryCoordinates(): number[][] {
  if (
    !Array.isArray(YARD_GRID_BOUNDARY_COORDINATES) ||
    YARD_GRID_BOUNDARY_COORDINATES.length < 4
  ) {
    return []
  }
  return YARD_GRID_BOUNDARY_COORDINATES.map((coord) => [...coord])
}

export function normalizeYardGridBoundaryCoordinates(
  coordinates: number[][],
  origin: LatLng,
): number[][] {
  return normalizeGridBoundaryCoordinates(
    coordinates,
    origin,
    YARD_GRID_BOUNDARY_ROTATION_DEG,
  )
}

export function getYardJibunKindByLevel(
  level: number,
): 'dae' | 'jung' | 'so' | null {
  if (level === 2) return 'dae'
  if (level === 3) return 'jung'
  if (level === 4) return 'so'
  return null
}

function createLayoutItem(
  jibun: YardJibunPolygonSource,
  localPoints: LocalPoint[],
): YardJibunLayoutItem | null {
  const match = JIBUN_SUFFIX_PATTERN.exec(jibun.abbr ?? '')
  if (!match || localPoints.length < 3) return null

  const [, displayPrefix, displayKind, suffix] = match
  const xs = localPoints.map((point) => point.x)
  const ys = localPoints.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    id: jibun.id,
    parent: jibun.parent,
    displayPrefix,
    displayKind,
    suffixNumber: Number(suffix),
    suffixWidth: suffix.length,
    minX,
    maxX,
    minY,
    maxY,
  }
}

function localPointRowsOverlap(
  row: YardJibunLayoutItem[],
  item: YardJibunLayoutItem,
): boolean {
  const rowMinY = Math.min(...row.map((rowItem) => rowItem.minY))
  const rowMaxY = Math.max(...row.map((rowItem) => rowItem.maxY))
  const overlap = Math.min(rowMaxY, item.maxY) - Math.max(rowMinY, item.minY)
  if (overlap <= 0) return false

  const rowHeight = rowMaxY - rowMinY
  const itemHeight = item.maxY - item.minY
  return overlap >= Math.min(rowHeight, itemHeight) * SAME_ROW_OVERLAP_RATIO
}

function createJibunLayoutRows(
  items: YardJibunLayoutItem[],
): YardJibunLayoutItem[][] {
  const rows: YardJibunLayoutItem[][] = []

  for (const item of [...items].sort((a, b) => a.minY - b.minY)) {
    const row = rows.find((candidate) => localPointRowsOverlap(candidate, item))
    if (row) {
      row.push(item)
    } else {
      rows.push([item])
    }
  }

  return rows
}

function getRowMinY(row: YardJibunLayoutItem[]): number {
  return Math.min(...row.map((item) => item.minY))
}

function isMixedJibunLayout(rows: YardJibunLayoutItem[][]): boolean {
  return rows.length > 1 && rows.some((row) => row.length > 1)
}

function shouldKeepOriginalOrder(
  items: YardJibunLayoutItem[],
  jibunById: Map<number, YardJibunPolygonSource>,
): boolean {
  const parentId = items[0]?.parent
  if (parentId == null) return false

  const parent = jibunById.get(parentId)
  if (ORIGINAL_ORDER_PARENT_ABBRS.has(parent?.abbr ?? '')) return true
  if (REVERSED_ORDER_PARENT_ABBRS.has(parent?.abbr ?? '')) return false

  const yard = parent?.parent == null ? null : jibunById.get(parent.parent)
  return ORIGINAL_ORDER_YARD_ABBRS.has(yard?.abbr ?? '')
}

function sortJibunLayoutItems(
  rows: YardJibunLayoutItem[][],
  direction: 'ascending' | 'descending',
): YardJibunLayoutItem[] {
  const sortedRows = [...rows].sort((a, b) =>
    direction === 'ascending'
      ? getRowMinY(b) - getRowMinY(a)
      : getRowMinY(a) - getRowMinY(b),
  )

  return sortedRows.flatMap((row) => row.sort((a, b) => a.minX - b.minX))
}

function shouldReverseMixedSuffixOrder(
  items: YardJibunLayoutItem[],
  jibunById: Map<number, YardJibunPolygonSource>,
): boolean {
  if (REVERSED_MIXED_SUFFIX_PREFIXES.has(items[0]?.displayPrefix ?? '')) {
    return true
  }

  const parentId = items[0]?.parent
  if (parentId == null) return false

  const parent = jibunById.get(parentId)
  return REVERSED_MIXED_SUFFIX_PARENT_ABBRS.has(parent?.abbr ?? '')
}

function createDisplayNameById(
  jibuns: YardJibunPolygonSource[],
): Map<number, string> {
  const jibunById = new Map(jibuns.map((jibun) => [jibun.id, jibun]))
  const groups = new Map<string, YardJibunLayoutItem[]>()

  for (const jibun of jibuns) {
    const localPoints = parseLocalPolyString(jibun.poly)
    const item = createLayoutItem(jibun, localPoints)
    if (!item) continue

    const key = [
      jibun.parent ?? 'root',
      item.displayPrefix,
      item.displayKind,
    ].join(':')
    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  const displayNameById = new Map<number, string>()

  for (const items of groups.values()) {
    if (items.length < 2) continue
    if (shouldKeepOriginalOrder(items, jibunById)) continue

    const rows = createJibunLayoutRows(items)
    const mixedLayout = isMixedJibunLayout(rows)
    const suffixNumbers = [...items].map((item) => item.suffixNumber)
    if (mixedLayout && shouldReverseMixedSuffixOrder(items, jibunById)) {
      suffixNumbers.sort((a, b) => a - b)
      suffixNumbers.splice(
        1,
        suffixNumbers.length - 1,
        ...suffixNumbers.slice(1).reverse(),
      )
    } else {
      suffixNumbers.sort((a, b) => (mixedLayout ? a - b : b - a))
    }
    const sortedItems = sortJibunLayoutItems(
      rows,
      mixedLayout ? 'ascending' : 'descending',
    )

    for (const [index, item] of sortedItems.entries()) {
      const suffixNumber = suffixNumbers[index]
      if (!Number.isFinite(suffixNumber)) continue
      displayNameById.set(
        item.id,
        `${item.displayPrefix}${item.displayKind}${String(
          suffixNumber,
        ).padStart(item.suffixWidth, '0')}`,
      )
    }
  }

  return displayNameById
}

export function createYardJibunPolygons(
  jibuns: YardJibunPolygonSource[],
  origin: LatLng,
): PolygonShape[] {
  const boundaryCoordinates = normalizeYardGridBoundaryCoordinates(
    cloneYardGridBoundaryCoordinates(),
    origin,
  )
  const normalizedJibuns = Array.isArray(jibuns) ? jibuns : []
  const displayNameById = createDisplayNameById(normalizedJibuns)
  return normalizedJibuns
    .map((jibun) => {
      const jibunKind: string | null =
        getYardJibunKindByLevel(jibun.level) ??
        (jibun.level === 1 ? 'yard' : null)
      const localPoints = parseLocalPolyString(jibun.poly)
      if (!jibunKind || localPoints.length < 3) return null
      const points = localPoints
        .map((point) =>
          convertLocalPolyPointToLngLat(point, boundaryCoordinates, origin),
        )
        .filter((point): point is LatLng => Boolean(point))
      if (points.length < 3) return null
      return {
        id: `jibun-${jibun.id}`,
        name:
          displayNameById.get(jibun.id) ||
          jibun.abbr ||
          jibun.name ||
          String(jibun.id),
        points,
        colorKey: jibunKind,
      } as PolygonShape
    })
    .filter((polygon): polygon is PolygonShape => Boolean(polygon))
}
