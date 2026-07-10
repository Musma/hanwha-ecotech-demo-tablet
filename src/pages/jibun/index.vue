<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import JibunDetail from '@/features/logged/jibun/components/jibun-detail.vue'
import JibunMapOverlay from '@/features/logged/jibun/components/jibun-map-overlay.vue'
import JibunTree from '@/features/logged/jibun/components/jibun-tree.vue'
import JibunYardMap from '@/features/logged/jibun/components/jibun-yard-map.vue'
import { useJibunStore } from '@/features/logged/jibun/composables/use-jibun-store'
import LoggedPageHead from '@/shared/components/logged-page-head.vue'
import LoggedPageShell from '@/shared/components/logged-page-shell.vue'
import { DEFAULT_MAP_STYLE } from '@/shared/constants/map'

// 지번 관리 상세 화면이다.
// 트리, 지도, 상세 패널을 같은 store 상태로 묶어 선택/수정/삭제 흐름을 연결한다.

const store = useJibunStore()
const {
  blockFocusRequest,
  jibuns,
  mapFocusRequest,
  ops,
  routeFocusRequest,
  selectedId,
  selectedJibun,
} = storeToRefs(store)

const mapStyle = ref(DEFAULT_MAP_STYLE)
const fixedOverlayVisible = ref(false)
const gridVisible = ref(false)
const parcelVisible = ref(true)
const roadJibunVisible = ref(false)
const materialVisible = ref(false)
const blockVisible = ref(false)
const obstacleVisible = ref(false)
const transportVisible = ref(false)
</script>

<template>
  <LoggedPageShell>
    <LoggedPageHead title="지번 관리" />
    <div
      class="grid h-[calc(100vh-174px)] min-h-[480px] grid-cols-[320px_minmax(0,1fr)] gap-3 [&>*]:min-h-0"
    >
      <JibunTree
        :jibuns="jibuns"
        :selected-id="selectedId"
        @select="store.selectJibun"
      />
      <JibunYardMap
        :jibuns="jibuns"
        :selected-jibun-id="selectedId"
        :selected-jibun-focus-request="mapFocusRequest"
        :entity-focus-request="blockFocusRequest"
        :route-focus-request="routeFocusRequest"
        :map-style="mapStyle"
        :fixed-overlay-visible="fixedOverlayVisible"
        :grid-visible="gridVisible"
        :parcel-visible="parcelVisible"
        :block-visible="blockVisible"
        @select-jibun="store.selectJibun"
      >
        <JibunMapOverlay
          v-model:map-style="mapStyle"
          v-model:fixed-overlay-visible="fixedOverlayVisible"
          v-model:grid-visible="gridVisible"
          v-model:parcel-visible="parcelVisible"
          v-model:road-jibun-visible="roadJibunVisible"
          v-model:material-visible="materialVisible"
          v-model:block-visible="blockVisible"
          v-model:obstacle-visible="obstacleVisible"
          v-model:transport-visible="transportVisible"
        />

        <div
          v-if="selectedJibun"
          class="absolute top-3 right-3 z-[20] flex max-h-[calc(100%-24px)] w-[360px] flex-col overflow-hidden rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
        >
          <button
            class="absolute top-[9px] right-2 z-[2] inline-flex h-[26px] w-[26px] items-center justify-center rounded-sm border-0 bg-hw-white-light text-base text-hw-gray-dark transition-colors duration-[160ms] hover:bg-hw-white-darker hover:text-hw-orange-main"
            title="닫기"
            @click="store.selectJibun(null)"
          >
            <i class="ti ti-x" />
          </button>
          <JibunDetail
            class="min-h-0 flex-1"
            :jibun="selectedJibun"
            :jibuns="jibuns"
            :ops="ops"
            @select="store.selectJibun"
            @delete="store.deleteJibun"
          />
        </div>
      </JibunYardMap>
    </div>
  </LoggedPageShell>
</template>
