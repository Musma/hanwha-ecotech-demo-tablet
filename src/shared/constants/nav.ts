/* 앱 좌측 사이드바 네비게이션 항목 정의. */

export interface AppNavItem {
  /** 메뉴 라벨 */
  label: string
  /** Tabler 아이콘 클래스 */
  icon: string
  /** 라우트 경로. 마이그레이션된 메뉴만 지정한다. */
  to?: string
  /** 정확 일치(active) 매칭이 필요한 경우 */
  end?: boolean
  /** 라우트가 없는 미마이그레이션 메뉴는 placeholder로 비활성화한다. */
  disabled?: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: '대시보드',
    icon: 'ti ti-layout-dashboard',
    to: '/dashboard',
    end: true,
  },
  { label: '지번관리', icon: 'ti ti-flag', to: '/jibun' },
  { label: '자재관리', icon: 'ti ti-pencil', to: '/materials' },
  { label: '블록관리', icon: 'ti ti-grid-dots', disabled: true },
  { label: '배차관리', icon: 'ti ti-truck', disabled: true },
  { label: '시스템관리', icon: 'ti ti-settings', disabled: true },
]
