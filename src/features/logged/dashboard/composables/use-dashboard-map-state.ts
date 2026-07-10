import { computed, ref } from 'vue'

import {
  DEFAULT_DASHBOARD_DISPLAY_ITEM_STATE,
  DEFAULT_DASHBOARD_MAP_OPTION_STATE,
} from '@/features/logged/dashboard/constants/dashboard-map-overlay'
import { JIBUN_SEED } from '@/features/logged/jibun/constants/jibun-data'
import { YARD_DEFAULT_CENTER } from '@/shared/constants/map-yard'
import { createYardJibunPolygons } from '@/shared/helpers/map/yard-jibun-polygons'
import type {
  MapEntityMarkerItem,
  YardMapProps,
} from '@/shared/types/map/yard-map'

type DashboardDisplayKey = 'material' | 'block' | 'obstacle' | 'transport'

const DASHBOARD_MAP_MARKERS: Array<
  MapEntityMarkerItem & { displayKey: DashboardDisplayKey }
> = []

export function useDashboardMapState() {
  const mapOptions = ref({ ...DEFAULT_DASHBOARD_MAP_OPTION_STATE })
  const displayItems = ref({ ...DEFAULT_DASHBOARD_DISPLAY_ITEM_STATE })

  const yardOrigin = computed(() => ({
    lat: YARD_DEFAULT_CENTER[1],
    lng: YARD_DEFAULT_CENTER[0],
  }))

  const jibunPolygons = computed<YardMapProps['polygons']>(() => {
    if (!mapOptions.value.jibunLabel) return []
    return createYardJibunPolygons(JIBUN_SEED, yardOrigin.value)
  })

  const mapMarkers = computed<MapEntityMarkerItem[]>(() =>
    DASHBOARD_MAP_MARKERS.filter(
      (marker) => displayItems.value[marker.displayKey],
    ),
  )

  return {
    displayItems,
    jibunPolygons,
    mapMarkers,
    mapOptions,
  }
}
