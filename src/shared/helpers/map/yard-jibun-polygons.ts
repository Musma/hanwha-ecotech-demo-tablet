import {
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
} from '@/shared/constants/map-yard'
import type { LatLng } from '@/shared/helpers/map/grid-utils'
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

export function createYardJibunPolygons(
  jibuns: YardJibunPolygonSource[],
  origin: LatLng,
): PolygonShape[] {
  const boundaryCoordinates = normalizeYardGridBoundaryCoordinates(
    cloneYardGridBoundaryCoordinates(),
    origin,
  )
  return (Array.isArray(jibuns) ? jibuns : [])
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
        name: jibun.abbr || jibun.name || String(jibun.id),
        points,
        colorKey: jibunKind,
      } as PolygonShape
    })
    .filter((polygon): polygon is PolygonShape => Boolean(polygon))
}
