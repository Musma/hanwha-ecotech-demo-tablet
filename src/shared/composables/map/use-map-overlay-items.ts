import { computed, type Ref } from 'vue'

import { DEFAULT_BLOCK_COLOR } from '@/shared/constants/map-common'
import { latLngToLocalMeters } from '@/shared/helpers/map/grid-utils'
import {
  getCircleAreaSquareMeters,
  getCircleDimensions,
  haversineDistanceMeters,
  polygonAreaSquareMeters,
  type CircleShape,
  type PolygonShape,
  type RectangleShape,
  type SelectedShape,
} from '@/shared/helpers/map/measurement-utils'
import type { OverlayItem, RectangleSize } from '@/shared/types/map/yard-map'

interface UseMapOverlayItemsOptions {
  circleMeasures: Ref<CircleShape[]>
  polygonMeasures: Ref<PolygonShape[]>
  rectangleMeasures: Ref<RectangleShape[]>
  selectedShape: Ref<SelectedShape | null>
}

export function getRectangleSize(rectangle: RectangleShape): RectangleSize {
  if (!rectangle || rectangle.points.length < 4) return { width: 0, height: 0 }
  return {
    width: haversineDistanceMeters(rectangle.points[0], rectangle.points[1]),
    height: haversineDistanceMeters(rectangle.points[1], rectangle.points[2]),
  }
}

export function getPolygonSize(points: Array<{ lat: number; lng: number }>) {
  if (!points || points.length < 3) return { width: 0, height: 0 }
  const o = points[0]
  const local = points.map((p) => latLngToLocalMeters(p.lat, p.lng, o))
  const xs = local.map((p) => p.x)
  const ys = local.map((p) => p.y)
  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

export function useMapOverlayItems({
  circleMeasures,
  polygonMeasures,
  rectangleMeasures,
  selectedShape,
}: UseMapOverlayItemsOptions) {
  const overlayItems = computed<OverlayItem[]>(() => {
    const circleItems = circleMeasures.value.map((c) => ({
      id: c.id,
      type: 'circle' as const,
      title: c.name ?? c.id,
      color: c.color ?? DEFAULT_BLOCK_COLOR,
      diameter: Math.round(getCircleDimensions(c).widthMeters),
      area: Math.round(getCircleAreaSquareMeters(c)),
    }))
    const rectangleItems = rectangleMeasures.value.map((r) => {
      const size = getRectangleSize(r)
      return {
        id: r.id,
        type: 'rectangle' as const,
        title: r.name ?? r.id,
        color: r.color ?? DEFAULT_BLOCK_COLOR,
        imageSrc: r.imageSrc ?? '',
        width: Math.round(size.width),
        height: Math.round(size.height),
        area: Math.round(polygonAreaSquareMeters(r.points)),
      }
    })
    const polygonItems = polygonMeasures.value.map((p) => {
      const size = getPolygonSize(p.points)
      return {
        id: p.id,
        type: 'polygon' as const,
        title: p.name ?? p.id,
        width: Math.round(size.width),
        height: Math.round(size.height),
        area: Math.round(polygonAreaSquareMeters(p.points)),
      }
    })
    return [...rectangleItems, ...circleItems, ...polygonItems]
  })

  const parcelItems = computed(() =>
    overlayItems.value.filter((i) => i.type === 'polygon'),
  )
  const shapeItems = computed(() =>
    overlayItems.value.filter(
      (i) => i.type === 'rectangle' || i.type === 'circle',
    ),
  )

  const selectedOverlayLabel = computed(() => {
    const shape = selectedShape.value
    if (!shape) return ''
    if (shape.type === 'polygon') {
      return polygonMeasures.value.find((p) => p.id === shape.id)?.name ?? ''
    }
    if (shape.type === 'rectangle') {
      return rectangleMeasures.value.find((p) => p.id === shape.id)?.name ?? ''
    }
    if (shape.type === 'circle') {
      return circleMeasures.value.find((p) => p.id === shape.id)?.name ?? ''
    }
    return ''
  })

  const selectedRectangle = computed(() => {
    if (selectedShape.value?.type !== 'rectangle') return null
    return (
      rectangleMeasures.value.find((r) => r.id === selectedShape.value!.id) ??
      null
    )
  })

  const selectedRectangleSize = computed(() => {
    const rectangle = selectedRectangle.value
    return rectangle ? getRectangleSize(rectangle) : null
  })

  return {
    parcelItems,
    selectedOverlayLabel,
    selectedRectangle,
    selectedRectangleSize,
    shapeItems,
  }
}
