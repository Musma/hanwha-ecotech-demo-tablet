import {
  DEFAULT_MAP_STYLE,
  MAP_STYLE_OPTIONS,
  type MapStyleOption,
} from '@/shared/constants/map'

/**
 * 대시보드 지도 오버레이에서 사용하는 옵션 정의.
 * 순수 데이터이므로 컴포넌트와 분리해 둔다.
 */

export interface DashboardToggleOption {
  key: string
  label: string
  icon: string
}

export type DashboardMapTypeOption = MapStyleOption

export const DASHBOARD_DEFAULT_MAP_STYLE = DEFAULT_MAP_STYLE

export const DASHBOARD_MAP_TYPE_OPTIONS: DashboardMapTypeOption[] =
  MAP_STYLE_OPTIONS

export const DASHBOARD_MAP_OPTIONS: DashboardToggleOption[] = [
  { key: 'roadJibun', label: '차도지번', icon: 'ti-road' },
  { key: 'cad', label: 'CAD 도면', icon: 'ti-vector' },
  { key: 'jibunLabel', label: '지번 표시', icon: 'ti-tag' },
  { key: 'stacked', label: '적치 여부', icon: 'ti-stack-2' },
]

export const DASHBOARD_DISPLAY_ITEMS: DashboardToggleOption[] = [
  { key: 'material', label: '자재', icon: 'ti-box' },
  { key: 'block', label: '블록', icon: 'ti-square' },
  { key: 'obstacle', label: '방해요소', icon: 'ti-alert-triangle' },
  { key: 'transport', label: '운송자원', icon: 'ti-truck' },
]

export type DashboardOverlayToggleState = Record<string, boolean>

export const DEFAULT_DASHBOARD_MAP_OPTION_STATE: DashboardOverlayToggleState = {
  roadJibun: false,
  cad: false,
  jibunLabel: true,
  stacked: false,
}

export const DEFAULT_DASHBOARD_DISPLAY_ITEM_STATE: DashboardOverlayToggleState =
  {
    material: false,
    block: false,
    obstacle: false,
    transport: false,
  }
