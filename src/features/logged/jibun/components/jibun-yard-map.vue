<script setup lang="ts">
import { computed } from 'vue'

import YardMap from '@/shared/components/map/yard-map.vue'
import {
  YARD_DEFAULT_BEARING,
  YARD_DEFAULT_CENTER,
  YARD_DEFAULT_GRID_OFFSET_Y,
  YARD_DEFAULT_GRID_ROTATION,
  YARD_GRID_BOUNDARY_COORDINATES,
  YARD_GRID_BOUNDARY_ROTATION_DEG,
  YARD_IMAGE_OVERLAYS,
  YARD_JIBUN_KIND_COLORS,
} from '@/shared/constants/map-yard'
import type { LatLng } from '@/shared/helpers/map/grid-utils'
import type { RectanglePlacementSpec } from '@/shared/types/map/yard-map'

import {
  createInitialJibunPolygons,
  getPriorityJibunId,
  getSelectableJibunPolygonId,
} from '../map/jibun-map-helpers'

import type {
  BlockFocusRequest,
  Jibun,
  MapFocusRequest,
  RouteFocusRequest,
} from '../types/jibun'

/**
 * 재사용 가능한 야드 지도 컴포넌트.
 * 조립형 야드 지도(yard-map)에 jibun(야드) 도메인 설정·데이터를 주입하는 얇은 래퍼다.
 * - jibun→polygon 매핑, 레벨 색상, 레벨 우선 선택, 부지 좌표/회전/오버레이를 여기서 소유한다.
 * - 추가 오버레이(검색 패널 등)는 기본 slot으로 각 페이지에서 주입한다.
 */
interface Props {
  jibuns: Jibun[]
  selectedJibunId: number | null
  selectedJibunFocusRequest: MapFocusRequest | null
  entityFocusRequest: BlockFocusRequest | null
  routeFocusRequest: RouteFocusRequest | null
  mapStyle?: string
  fixedOverlayVisible?: boolean
  gridVisible?: boolean
  parcelVisible?: boolean
  blockVisible?: boolean
  rectanglePlacements?: RectanglePlacementSpec[]
  showFixedOverlayLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mapStyle: undefined,
  fixedOverlayVisible: false,
  gridVisible: false,
  parcelVisible: true,
  blockVisible: false,
  rectanglePlacements: () => [],
  showFixedOverlayLabels: false,
})

const emit = defineEmits<{
  selectJibun: [id: number]
}>()

// 부지 기준 원점. base에 주입하는 polygon 좌표 계산과 동일 origin을 사용한다.
const YARD_ORIGIN: LatLng = {
  lat: YARD_DEFAULT_CENTER[1],
  lng: YARD_DEFAULT_CENTER[0],
}

// jibun 목록을 base가 그릴 수 있는 범용 폴리곤(colorKey 포함)으로 변환한다.
const polygons = computed(() =>
  createInitialJibunPolygons(props.jibuns, YARD_ORIGIN),
)

// 외부 선택(selectedJibunId)을 렌더 가능한 폴리곤 id로 환원한다(상위로 fallback).
const selectedShapeId = computed(() =>
  getSelectableJibunPolygonId(props.jibuns, props.selectedJibunId),
)

// 포커스 요청이 현재 선택된 지번을 대상으로 할 때만 base에 force-focus를 흘린다.
const focusRequest = computed(() =>
  props.selectedJibunFocusRequest &&
  props.selectedJibunFocusRequest.id === props.selectedJibunId
    ? { requestedAt: props.selectedJibunFocusRequest.requestedAt }
    : null,
)

// 레벨 우선 클릭: base가 올린 폴리곤 id 목록에서 가장 깊은 레벨의 지번을 선택한다.
function handlePolygonsAtPoint(payload: { ids: string[]; point: LatLng }) {
  const jibunId = getPriorityJibunId(payload.ids, props.jibuns)
  if (jibunId != null) emit('selectJibun', jibunId)
}
</script>

<template>
  <div
    class="relative flex flex-col min-w-0 min-h-0 overflow-hidden rounded-sm border border-hw-white-darker bg-hw-gray-darker"
  >
    <div class="relative w-full h-full min-h-0 overflow-hidden">
      <YardMap
        :center="YARD_DEFAULT_CENTER"
        :bearing="YARD_DEFAULT_BEARING"
        :grid-rotation-deg="YARD_DEFAULT_GRID_ROTATION"
        :grid-offset-y="YARD_DEFAULT_GRID_OFFSET_Y"
        :boundary-coordinates="YARD_GRID_BOUNDARY_COORDINATES"
        :boundary-rotation-deg="YARD_GRID_BOUNDARY_ROTATION_DEG"
        :image-overlays="YARD_IMAGE_OVERLAYS"
        :map-style="mapStyle"
        :fixed-overlay-visible="fixedOverlayVisible"
        :grid-visible="gridVisible"
        :parcel-visible="parcelVisible"
        :block-visible="blockVisible"
        :polygons="polygons"
        :rectangle-placements="rectanglePlacements"
        :color-by-key="YARD_JIBUN_KIND_COLORS"
        :selected-shape-id="selectedShapeId"
        :focus-request="focusRequest"
        :entity-focus-request="entityFocusRequest"
        :route-focus-request="routeFocusRequest"
        :show-fixed-overlay-labels="showFixedOverlayLabels"
        @polygons-at-point="handlePolygonsAtPoint"
      />

      <!-- 페이지별 오버레이 주입 지점 -->
      <slot />
    </div>
  </div>
</template>
