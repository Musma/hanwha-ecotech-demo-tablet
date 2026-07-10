<script setup lang="ts">
import { ref } from 'vue'

import DashboardMapOverlay from '@/features/logged/dashboard/components/dashboard-map-overlay.vue'
import DashboardStats from '@/features/logged/dashboard/components/dashboard-stats.vue'
import DashboardYardMap from '@/features/logged/dashboard/components/dashboard-yard-map.vue'
import { useDashboardMapState } from '@/features/logged/dashboard/composables/use-dashboard-map-state'
import { DASHBOARD_DEFAULT_MAP_STYLE } from '@/features/logged/dashboard/constants/dashboard-map-overlay'
import LoggedPageShell from '@/shared/components/logged-page-shell.vue'

// 대시보드 진입 화면이다.
// 보기 전용 지도 상태와 오버레이 제어만 dashboard 도메인에서 조립한다.

const { displayItems, jibunPolygons, mapMarkers, mapOptions } =
  useDashboardMapState()

const mapStyle = ref(DASHBOARD_DEFAULT_MAP_STYLE)
const fixedOverlayVisible = ref(false)
</script>

<template>
  <LoggedPageShell>
    <DashboardStats />
    <div class="flex h-[calc(100vh-264px)] min-h-[420px]">
      <DashboardYardMap
        class="flex-1 min-w-0"
        :map-style="mapStyle"
        :fixed-overlay-visible="fixedOverlayVisible"
        :grid-visible="mapOptions.stacked"
        :polygons="mapOptions.jibunLabel ? jibunPolygons : []"
        :map-markers="mapMarkers"
      >
        <DashboardMapOverlay
          v-model:map-style="mapStyle"
          v-model:fixed-overlay-visible="fixedOverlayVisible"
          v-model:map-options="mapOptions"
          v-model:display-items="displayItems"
        />
      </DashboardYardMap>
    </div>
  </LoggedPageShell>
</template>
