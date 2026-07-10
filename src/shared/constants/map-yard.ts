import yard1ImageUrl from '@/shared/assets/map/yard1.png'
import yard2ImageUrl from '@/shared/assets/map/yard2.png'
import type { FixedImageOverlay } from '@/shared/helpers/map/map-geo-helpers'

export const YARD_DEFAULT_CENTER: [number, number] = [127.592328, 34.900905]
export const YARD_DEFAULT_BEARING = -38
export const YARD_DEFAULT_GRID_ROTATION = -52
export const YARD_DEFAULT_GRID_OFFSET_Y = 0
export const YARD_GRID_BOUNDARY_ROTATION_DEG = -52

export const YARD_GRID_BOUNDARY_COORDINATES: number[][] = [
  [127.60088252946095, 34.90833617854184],
  [127.60540046043981, 34.903593293520395],
  [127.59219450803971, 34.89513182550771],
  [127.58767657706085, 34.899874710529154],
]

export const YARD_JIBUN_KIND_COLORS: Record<string, string> = {
  yard: '#94A3B8',
  dae: '#F37321',
  jung: '#21A3E6',
  so: '#4A9D67',
}

export const YARD_IMAGE_OVERLAYS: FixedImageOverlay[] = [
  {
    sourceId: 'yard-overlay-source-1',
    layerId: 'yard-overlay-layer-1',
    name: 'yard1',
    label: '2YARD',
    imageSrc: yard2ImageUrl,
    coordinates: [
      [127.587585, 34.899842],
      [127.590244, 34.901574],
      [127.594853, 34.896818],
      [127.592158, 34.895121],
    ],
  },
  {
    sourceId: 'yard-overlay-source-2',
    layerId: 'yard-overlay-layer-2',
    name: 'yard2',
    label: '1YARD',
    imageSrc: yard1ImageUrl,
    coordinates: [
      [127.590772, 34.901531],
      [127.601043, 34.90818],
      [127.603523, 34.905675],
      [127.593202, 34.899038],
    ],
  },
]
