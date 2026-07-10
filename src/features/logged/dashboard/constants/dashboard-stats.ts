/**
 * 대시보드 상단 요약 카드에서 사용하는 표시 데이터.
 * 현재는 정적 표본 데이터이며, 추후 API 연동 시 wrapper에서 주입한다.
 */

export type DashboardDeltaTone = 'up' | 'down'

export interface DashboardDelta {
  label: string
  value: string
  tone: DashboardDeltaTone
}

export interface DashboardOccupancyStat {
  icon: string
  title: string
  percent: number
  delta: DashboardDelta
}

export interface DashboardCountStat {
  icon: string
  title: string
  value: string
  delta: DashboardDelta
}

export interface DashboardSplitStat {
  icon: string
  title: string
  columns: { value: string; label: string }[]
}

export interface DashboardBreakdownStat {
  icon: string
  title: string
  value: string
  items: { label: string; value: number; tone: string }[]
}

export const DASHBOARD_OCCUPANCY: DashboardOccupancyStat = {
  icon: 'ti-chart-pie',
  title: '야드 점유율',
  percent: 82,
  delta: { label: '전일 대비', value: '3%', tone: 'down' },
}

export const DASHBOARD_BLOCK_COUNT: DashboardCountStat = {
  icon: 'ti-box-multiple',
  title: '블록 개소',
  value: '14개',
  delta: { label: '전일 대비', value: '2개', tone: 'up' },
}

export const DASHBOARD_INOUT: DashboardSplitStat = {
  icon: 'ti-login-2',
  title: '입출고 현황',
  columns: [
    { value: '25건', label: '입고예정 자재' },
    { value: '8개', label: '출고예정 블록' },
  ],
}

export const DASHBOARD_EQUIPMENT: DashboardBreakdownStat = {
  icon: 'ti-truck',
  title: '운행중 장비',
  value: '20대',
  items: [
    { label: '지게차', value: 12, tone: '#f37321' },
    { label: '크레인', value: 6, tone: '#f89b6c' },
    { label: 'TP', value: 2, tone: '#cccccc' },
  ],
}

/** 점유율 막대 세그먼트 총 개수 */
export const OCCUPANCY_SEGMENT_COUNT = 22
