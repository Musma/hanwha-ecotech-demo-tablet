import type { TabletScreen } from '@/features/logged/dashboard/types/tablet'

let pendingTabletStartScreen: TabletScreen | null = null

export function requestTabletStartScreen(screen: TabletScreen) {
  pendingTabletStartScreen = screen
}

export function consumeTabletStartScreen(): TabletScreen {
  const screen = pendingTabletStartScreen ?? 'locked'
  pendingTabletStartScreen = null

  return screen
}
