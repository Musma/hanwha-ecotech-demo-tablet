import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import { GPS_SEED, JIBUN_SEED, OPS_SEED } from '../constants/jibun-data'
import { findById } from '../utils/jibun-utils'

import type {
  BlockFocusRequest,
  GpsCell,
  Jibun,
  MapFocusRequest,
  OperationStrategy,
  RouteFocusRequest,
} from '../types/jibun'

export const useJibunStore = defineStore('jibun', () => {
  const jibuns = ref<Jibun[]>([...JIBUN_SEED])
  const ops = ref<OperationStrategy[]>([...OPS_SEED])
  const gps = ref<GpsCell[]>([...GPS_SEED])

  const selectedId = ref<number | null>(null)
  const mapFocusRequest = ref<MapFocusRequest | null>(null)
  const blockFocusRequest = ref<BlockFocusRequest | null>(null)
  const routeFocusRequest = ref<RouteFocusRequest | null>(null)

  const selectedJibun = computed(() => findById(jibuns.value, selectedId.value))

  const counts = computed(() => ({
    tree: jibuns.value.length,
    master: jibuns.value.length,
    materialBlock: 20,
    transport: 42,
    driverTablet: 10,
    ops: ops.value.length,
    gps: gps.value.length,
  }))

  function selectJibun(id: number | null) {
    selectedId.value = id
    mapFocusRequest.value = null
  }

  function focusJibunOnMap(id: number) {
    selectedId.value = id
    mapFocusRequest.value = { id, requestedAt: Date.now() }
  }

  function showToast(message: string) {
    toast.success(message)
  }

  function deleteJibun(id: number) {
    const target = findById(jibuns.value, id)
    if (!target) return
    const toDelete = new Set<number>([id])
    let grew = true
    while (grew) {
      grew = false
      jibuns.value.forEach((j) => {
        if (j.parent != null && toDelete.has(j.parent) && !toDelete.has(j.id)) {
          toDelete.add(j.id)
          grew = true
        }
      })
    }
    const descCount = toDelete.size - 1
    const msg =
      descCount > 0
        ? `'${target.name}' 및 하위 지번 ${descCount}개를 함께 삭제하시겠습니까?`
        : `'${target.name}' 지번을 삭제하시겠습니까?`
    if (!window.confirm(msg)) return
    jibuns.value = jibuns.value.filter((j) => !toDelete.has(j.id))
    selectedId.value = null
    blockFocusRequest.value = null
    routeFocusRequest.value = null
    showToast(
      descCount > 0 ? `지번 ${toDelete.size}개 삭제 완료` : '지번 삭제 완료',
    )
  }

  function importJibuns(result: { jibuns?: Jibun[]; error?: string } | null) {
    if (!result || result.error) {
      showToast(result?.error || 'CSV를 불러오지 못했습니다')
      return
    }
    if (result.jibuns) {
      jibuns.value = result.jibuns
      selectedId.value = null
      blockFocusRequest.value = null
      routeFocusRequest.value = null
      showToast(`CSV ${result.jibuns.length}건 반영 완료`)
    }
  }

  return {
    jibuns,
    ops,
    gps,
    selectedId,
    selectedJibun,
    mapFocusRequest,
    blockFocusRequest,
    routeFocusRequest,
    counts,
    selectJibun,
    focusJibunOnMap,
    showToast,
    deleteJibun,
    importJibuns,
  }
})
