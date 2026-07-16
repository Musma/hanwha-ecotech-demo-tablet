import { ROAD_JIBUN_SEED } from '@/features/logged/dashboard/constants/road-jibun-data'
import { DEFAULT_GRID_SIZE_METERS } from '@/shared/constants/map-common'
import {
  YARD_DEFAULT_CENTER,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
} from '@/shared/constants/map-yard'
import { normalizeGridBoundaryCoordinates } from '@/shared/helpers/map/map-geo-helpers'
import { getPhysicalGridCellCenter } from '@/shared/helpers/map/physical-address'

type Coordinate = [number, number]
type PhysCell = [number, number]

interface RoadRouteRequest {
  destinationLngLat: Coordinate
  destinationPhys: PhysCell
  startLngLat: Coordinate
  startPhys: PhysCell
}

const YARD_GRID_ORIGIN = {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
}
const YARD_GRID_BOUNDARY = normalizeGridBoundaryCoordinates(
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_ORIGIN,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
)
const STRAIGHT_CELL_DIRECTIONS: PhysCell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const DIAGONAL_CELL_DIRECTIONS: PhysCell[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function createCellKey(cell: PhysCell) {
  return `${cell[0]}:${cell[1]}`
}

function parseCellKey(key: string): PhysCell {
  const [column, row] = key.split(':').map(Number)
  return [column, row]
}

function createRoadCellSet() {
  const cells = new Set<string>()

  for (const road of ROAD_JIBUN_SEED) {
    for (const range of road.cellRanges) {
      if (range.axis === 'row') {
        for (let column = range.from; column <= range.to; column += 1) {
          cells.add(createCellKey([column, range.row]))
        }
        continue
      }

      for (let row = range.from; row <= range.to; row += 1) {
        cells.add(createCellKey([range.column, row]))
      }
    }
  }

  return cells
}

const ROAD_CELL_KEYS = createRoadCellSet()
const ROAD_CELLS = Array.from(ROAD_CELL_KEYS, parseCellKey)

function getNearestRoadCell(phys: PhysCell): PhysCell | null {
  if (ROAD_CELL_KEYS.size === 0) return null
  if (ROAD_CELL_KEYS.has(createCellKey(phys))) return phys

  let nearestCell: PhysCell | null = null
  let nearestManhattanDistance = Number.POSITIVE_INFINITY
  let nearestSquaredDistance = Number.POSITIVE_INFINITY

  for (const cell of ROAD_CELLS) {
    const columnDistance = Math.abs(cell[0] - phys[0])
    const rowDistance = Math.abs(cell[1] - phys[1])
    const manhattanDistance = columnDistance + rowDistance
    const squaredDistance = columnDistance ** 2 + rowDistance ** 2

    if (
      manhattanDistance < nearestManhattanDistance ||
      (manhattanDistance === nearestManhattanDistance &&
        squaredDistance < nearestSquaredDistance)
    ) {
      nearestCell = cell
      nearestManhattanDistance = manhattanDistance
      nearestSquaredDistance = squaredDistance
    }
  }

  return nearestCell
}

function findRoadCellPath(
  startCell: PhysCell,
  destinationCell: PhysCell,
  directions: PhysCell[],
) {
  const startKey = createCellKey(startCell)
  const destinationKey = createCellKey(destinationCell)
  const queue = [startKey]
  const previousByKey = new Map<string, string | null>([[startKey, null]])

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const currentKey = queue[cursor]
    if (currentKey === destinationKey) break

    const [column, row] = parseCellKey(currentKey)
    for (const [columnOffset, rowOffset] of directions) {
      const nextCell: PhysCell = [column + columnOffset, row + rowOffset]
      const nextKey = createCellKey(nextCell)
      if (!ROAD_CELL_KEYS.has(nextKey) || previousByKey.has(nextKey)) continue

      previousByKey.set(nextKey, currentKey)
      queue.push(nextKey)
    }
  }

  if (!previousByKey.has(destinationKey)) return null

  const path: PhysCell[] = []
  let currentKey: string | null = destinationKey
  while (currentKey) {
    path.push(parseCellKey(currentKey))
    currentKey = previousByKey.get(currentKey) ?? null
  }

  return path.reverse()
}

function compressStraightCells(path: PhysCell[]) {
  if (path.length <= 2) return path

  const compressed: PhysCell[] = [path[0]]
  for (let index = 1; index < path.length - 1; index += 1) {
    const previous = path[index - 1]
    const current = path[index]
    const next = path[index + 1]
    const previousDirection: PhysCell = [
      current[0] - previous[0],
      current[1] - previous[1],
    ]
    const nextDirection: PhysCell = [next[0] - current[0], next[1] - current[1]]
    if (
      previousDirection[0] === nextDirection[0] &&
      previousDirection[1] === nextDirection[1]
    ) {
      continue
    }

    compressed.push(current)
  }
  compressed.push(path[path.length - 1])

  return compressed
}

function getCellCenterCoordinate(cell: PhysCell): Coordinate | null {
  const center = getPhysicalGridCellCenter(
    cell,
    YARD_GRID_ORIGIN,
    DEFAULT_GRID_SIZE_METERS,
    DEFAULT_GRID_SIZE_METERS,
    YARD_GRID_BOUNDARY,
  )

  return center ? [center.lng, center.lat] : null
}

function appendCoordinate(coordinates: Coordinate[], coordinate: Coordinate) {
  const previous = coordinates[coordinates.length - 1]
  if (previous?.[0] === coordinate[0] && previous?.[1] === coordinate[1]) return

  coordinates.push(coordinate)
}

export function createOptimalRoadJibunRoute({
  destinationLngLat,
  destinationPhys,
  startLngLat,
  startPhys,
}: RoadRouteRequest): Coordinate[] | null {
  const startRoadCell = getNearestRoadCell(startPhys)
  const destinationRoadCell = getNearestRoadCell(destinationPhys)
  if (!startRoadCell || !destinationRoadCell) return null

  const roadCellPath =
    findRoadCellPath(
      startRoadCell,
      destinationRoadCell,
      STRAIGHT_CELL_DIRECTIONS,
    ) ??
    findRoadCellPath(startRoadCell, destinationRoadCell, [
      ...STRAIGHT_CELL_DIRECTIONS,
      ...DIAGONAL_CELL_DIRECTIONS,
    ])
  if (!roadCellPath) return null

  const coordinates: Coordinate[] = []
  appendCoordinate(coordinates, startLngLat)
  for (const cell of compressStraightCells(roadCellPath)) {
    const centerCoordinate = getCellCenterCoordinate(cell)
    if (centerCoordinate) appendCoordinate(coordinates, centerCoordinate)
  }
  appendCoordinate(coordinates, destinationLngLat)

  return coordinates.length >= 2 ? coordinates : null
}
