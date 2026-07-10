import type { Ref, ShallowRef } from 'vue'

import { DEFAULT_BLOCK_COLOR } from '@/shared/constants/map-common'
import type { LatLng } from '@/shared/helpers/map/grid-utils'
import { convertLocalPolyPointToLngLat } from '@/shared/helpers/map/map-geo-helpers'
import type { RectangleShape } from '@/shared/helpers/map/measurement-utils'
import type { RectanglePlacementSpec } from '@/shared/types/map/yard-map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any

const RECTANGLE_PLACEMENT_CELLS_SOURCE_ID =
  'echotech-rectangle-placement-cells-source'
const RECTANGLE_PLACEMENT_CELLS_LAYER_ID =
  'echotech-rectangle-placement-cells-fill-layer'

interface UseMapRectanglePlacementsOptions {
  defaultRectangleImageSrc: Ref<string>
  getNormalizedBoundary: () => number[][]
  gridCellMeters: () => number
  mapRef: ShallowRef<MapInstance | null>
  origin: Ref<LatLng>
  rectangleMeasures: Ref<RectangleShape[]>
  rectanglePlacements: Ref<RectanglePlacementSpec[]>
  rectanglesRef: Ref<RectangleShape[]>
}

function isPlacementReady(spec: RectanglePlacementSpec) {
  return spec && Array.isArray(spec.phys) && spec.phys.length === 2
}

export function useMapRectanglePlacements({
  defaultRectangleImageSrc,
  getNormalizedBoundary,
  gridCellMeters,
  mapRef,
  origin,
  rectangleMeasures,
  rectanglePlacements,
  rectanglesRef,
}: UseMapRectanglePlacementsOptions) {
  function createRectangleFromPlacement(
    spec: RectanglePlacementSpec,
  ): RectangleShape | null {
    if (!isPlacementReady(spec)) return null
    const cell = gridCellMeters()
    const [col, row] = spec.phys!
    const cx = col * cell + cell / 2
    const cy = row * cell + cell / 2
    const halfWidth = Math.max(cell, Number(spec.widthMeters) || cell) / 2
    const halfHeight = Math.max(cell, Number(spec.lengthMeters) || cell) / 2
    const boundary = getNormalizedBoundary()
    const toLngLat = (x: number, y: number) =>
      convertLocalPolyPointToLngLat({ x, y }, boundary, origin.value)
    const topLeft = toLngLat(cx - halfWidth, cy - halfHeight)
    const topRight = toLngLat(cx + halfWidth, cy - halfHeight)
    const bottomRight = toLngLat(cx + halfWidth, cy + halfHeight)
    const bottomLeft = toLngLat(cx - halfWidth, cy + halfHeight)
    if (!topLeft || !topRight || !bottomRight || !bottomLeft) return null
    return {
      id: spec.id,
      name: spec.name ?? spec.id,
      color: DEFAULT_BLOCK_COLOR,
      imageSrc: spec.imageSrc || defaultRectangleImageSrc.value,
      isBlockPlacement: true,
      points: [
        { lat: topLeft.lat, lng: topLeft.lng },
        { lat: topRight.lat, lng: topRight.lng },
        { lat: bottomRight.lat, lng: bottomRight.lng },
        { lat: bottomLeft.lat, lng: bottomLeft.lng },
      ],
    }
  }

  function buildPlacementCellsGeoJson() {
    const cell = gridCellMeters()
    const boundary = getNormalizedBoundary()
    const toLngLat = (x: number, y: number) =>
      convertLocalPolyPointToLngLat({ x, y }, boundary, origin.value)
    const seen = new Set<string>()
    const features: Array<{
      type: 'Feature'
      geometry: { type: 'Polygon'; coordinates: number[][][] }
      properties: Record<string, unknown>
    }> = []

    rectanglePlacements.value.forEach((spec) => {
      if (!isPlacementReady(spec)) return
      const [col, row] = spec.phys!
      const cx = col * cell + cell / 2
      const cy = row * cell + cell / 2
      const halfWidth = Math.max(cell, Number(spec.widthMeters) || cell) / 2
      const halfHeight = Math.max(cell, Number(spec.lengthMeters) || cell) / 2
      const minX = cx - halfWidth
      const maxX = cx + halfWidth
      const minY = cy - halfHeight
      const maxY = cy + halfHeight
      const colStart = Math.floor(minX / cell)
      const colEnd = Math.ceil(maxX / cell) - 1
      const rowStart = Math.floor(minY / cell)
      const rowEnd = Math.ceil(maxY / cell) - 1

      for (let c = colStart; c <= colEnd; c += 1) {
        for (let r = rowStart; r <= rowEnd; r += 1) {
          const overlapX =
            Math.min((c + 1) * cell, maxX) - Math.max(c * cell, minX)
          const overlapY =
            Math.min((r + 1) * cell, maxY) - Math.max(r * cell, minY)
          if (overlapX <= 0 || overlapY <= 0) continue
          if ((overlapX * overlapY) / (cell * cell) < 0.5) continue
          const key = `${c},${r}`
          if (seen.has(key)) continue
          const topLeft = toLngLat(c * cell, r * cell)
          const topRight = toLngLat((c + 1) * cell, r * cell)
          const bottomRight = toLngLat((c + 1) * cell, (r + 1) * cell)
          const bottomLeft = toLngLat(c * cell, (r + 1) * cell)
          if (!topLeft || !topRight || !bottomRight || !bottomLeft) continue
          seen.add(key)
          features.push({
            type: 'Feature',
            properties: { placement: spec.id },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [topLeft.lng, topLeft.lat],
                  [topRight.lng, topRight.lat],
                  [bottomRight.lng, bottomRight.lat],
                  [bottomLeft.lng, bottomLeft.lat],
                  [topLeft.lng, topLeft.lat],
                ],
              ],
            },
          })
        }
      }
    })

    return { type: 'FeatureCollection' as const, features }
  }

  function ensurePlacementCellsLayer(map: MapInstance) {
    if (!map.getSource(RECTANGLE_PLACEMENT_CELLS_SOURCE_ID)) {
      map.addSource(RECTANGLE_PLACEMENT_CELLS_SOURCE_ID, {
        type: 'geojson',
        data: buildPlacementCellsGeoJson() as never,
      })
    }
    if (!map.getLayer(RECTANGLE_PLACEMENT_CELLS_LAYER_ID)) {
      map.addLayer({
        id: RECTANGLE_PLACEMENT_CELLS_LAYER_ID,
        type: 'fill',
        source: RECTANGLE_PLACEMENT_CELLS_SOURCE_ID,
        paint: {
          'fill-color': '#F37321',
          'fill-opacity': 0.45,
          'fill-outline-color': '#A64E17',
        },
      })
    }
  }

  function syncPlacementCellsSource() {
    const source = mapRef.value?.getSource(RECTANGLE_PLACEMENT_CELLS_SOURCE_ID)
    if (source) source.setData(buildPlacementCellsGeoJson() as never)
  }

  function syncRectanglePlacements() {
    if (rectanglePlacements.value.length === 0) {
      syncPlacementCellsSource()
      return
    }
    const existing = new Set(rectangleMeasures.value.map((r) => r.id))
    const additions = rectanglePlacements.value
      .filter((placement) => placement && !existing.has(placement.id))
      .map((placement) => createRectangleFromPlacement(placement))
      .filter((rectangle): rectangle is RectangleShape => Boolean(rectangle))
    if (additions.length > 0) {
      rectangleMeasures.value = [...rectangleMeasures.value, ...additions]
      rectanglesRef.value = rectangleMeasures.value
    }
    syncPlacementCellsSource()
  }

  return {
    ensurePlacementCellsLayer,
    syncPlacementCellsSource,
    syncRectanglePlacements,
  }
}
