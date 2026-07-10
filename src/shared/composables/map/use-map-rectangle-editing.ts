import type { Ref } from 'vue'

import {
  latLngToLocalMeters,
  localMetersToLatLng,
  type LatLng,
  type LocalPoint,
} from '@/shared/helpers/map/grid-utils'
import type { RectangleShape } from '@/shared/helpers/map/measurement-utils'

export type RectangleDimensionAxis = 'width' | 'height'

interface UseMapRectangleEditingOptions {
  rectangleMeasures: Ref<RectangleShape[]>
  rectanglesRef: Ref<RectangleShape[]>
}

function getAveragePoint(points: LatLng[]): LatLng | null {
  if (!points || points.length === 0) return null
  const sums = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  )
  return { lat: sums.lat / points.length, lng: sums.lng / points.length }
}

function scaleVector(vector: LocalPoint, target: number): LocalPoint {
  const cur = Math.hypot(vector.x, vector.y)
  if (cur < 0.000001) return { x: 0, y: 0 }
  const s = target / cur
  return { x: vector.x * s, y: vector.y * s }
}

export function rotatePointAroundOrigin(
  localPoint: LocalPoint,
  radians: number,
): LocalPoint {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return {
    x: localPoint.x * cos - localPoint.y * sin,
    y: localPoint.x * sin + localPoint.y * cos,
  }
}

export function rotateRectanglePoints(
  points: LatLng[],
  centerPoint: LatLng,
  radians: number,
): LatLng[] {
  return points.map((point) => {
    const local = latLngToLocalMeters(point.lat, point.lng, centerPoint)
    const rotated = rotatePointAroundOrigin(local, radians)
    return localMetersToLatLng(rotated.x, rotated.y, centerPoint)
  })
}

export function resizeRectangleDimension(
  rectangle: RectangleShape,
  axis: RectangleDimensionAxis,
  nextValue: number,
): RectangleShape {
  if (rectangle.points.length < 4) return rectangle
  const origin = rectangle.points[0]
  const widthPoint = rectangle.points[1]
  const heightPoint = rectangle.points[3]
  const localWidthPoint = latLngToLocalMeters(
    widthPoint.lat,
    widthPoint.lng,
    origin,
  )
  const localHeightPoint = latLngToLocalMeters(
    heightPoint.lat,
    heightPoint.lng,
    origin,
  )
  const widthVector = { x: localWidthPoint.x, y: localWidthPoint.y }
  const heightVector = { x: localHeightPoint.x, y: localHeightPoint.y }
  const nextWidthVector = scaleVector(
    widthVector,
    axis === 'width' ? nextValue : Math.hypot(widthVector.x, widthVector.y),
  )
  const nextHeightVector = scaleVector(
    heightVector,
    axis === 'height' ? nextValue : Math.hypot(heightVector.x, heightVector.y),
  )

  return {
    ...rectangle,
    points: [
      origin,
      localMetersToLatLng(nextWidthVector.x, nextWidthVector.y, origin),
      localMetersToLatLng(
        nextWidthVector.x + nextHeightVector.x,
        nextWidthVector.y + nextHeightVector.y,
        origin,
      ),
      localMetersToLatLng(nextHeightVector.x, nextHeightVector.y, origin),
    ],
  }
}

export function useMapRectangleEditing({
  rectangleMeasures,
  rectanglesRef,
}: UseMapRectangleEditingOptions) {
  function setRectangles(next: RectangleShape[]) {
    rectanglesRef.value = next
    rectangleMeasures.value = next
  }

  function updateRectangleDimension(
    id: string,
    axis: RectangleDimensionAxis,
    nextValue: number,
  ) {
    const parsed = Math.round(nextValue)
    if (!Number.isFinite(parsed) || parsed <= 0) return
    setRectangles(
      rectangleMeasures.value.map((rectangle) =>
        rectangle.id === id
          ? resizeRectangleDimension(rectangle, axis, parsed)
          : rectangle,
      ),
    )
  }

  function rotateRectangle(id: string, deltaDeg: number) {
    const radians = (deltaDeg * Math.PI) / 180
    if (!Number.isFinite(radians) || Math.abs(radians) < 0.000001) return
    setRectangles(
      rectangleMeasures.value.map((rectangle) => {
        if (rectangle.id !== id || rectangle.points.length < 4) return rectangle
        const centerPoint = getAveragePoint(rectangle.points)
        if (!centerPoint) return rectangle
        return {
          ...rectangle,
          points: rotateRectanglePoints(rectangle.points, centerPoint, radians),
        }
      }),
    )
  }

  return {
    rotateRectangle,
    updateRectangleDimension,
  }
}
