// 도메인 무관한 지도 공용 상수.
// 특정 부지(야드) 좌표/회전/색상 같은 도메인 값은 여기 두지 않는다.

export const DEFAULT_GRID_SIZE_METERS = 10
export const DRAWING_SNAP_METERS = 1
export const MAX_GRID_RENDER_LINES = 1000

export const KOREAN_LABEL_FIELD: unknown = [
  'coalesce',
  ['get', 'name_ko'],
  ['get', 'name'],
]

export const GRID_SOURCE_ID = 'echotech-grid-source'
export const GRID_LAYER_ID = 'echotech-grid-layer'
export const MEASURE_SOURCE_ID = 'echotech-measure-source'
export const MEASURE_LINE_LAYER_ID = 'echotech-measure-line-layer'
export const MEASURE_FILL_LAYER_ID = 'echotech-measure-fill-layer'
export const MEASURE_POINT_LAYER_ID = 'echotech-measure-point-layer'
export const MEASURE_LABEL_LAYER_ID = 'echotech-measure-label-layer'

export const MEASURE_MODES = {
  none: 'none',
  rectangle: 'rectangle',
  imageBlock: 'imageBlock',
  polygon: 'polygon',
  circle: 'circle',
} as const

export type MeasureMode = (typeof MEASURE_MODES)[keyof typeof MEASURE_MODES]

export const BLOCK_COLOR_PALETTE = [
  '#e11d48',
  '#ff7a18',
  '#f4b400',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#94a3b8',
]
export const DEFAULT_BLOCK_COLOR = BLOCK_COLOR_PALETTE[0]
