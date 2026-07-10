<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { LEVEL_ICONS } from '../constants/jibun-data'
import { getAncestors, getChildren } from '../utils/jibun-utils'

import type { Jibun } from '../types/jibun'

// 지번 계층을 평탄화해 렌더링하는 트리 컴포넌트다.
// 선택된 항목의 조상은 자동으로 펼쳐 사용자가 현재 위치를 잃지 않게 한다.

interface Props {
  jibuns: Jibun[]
  selectedId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ select: [id: number] }>()

const collapsed = ref<Set<number>>(new Set())

let initialized = false
watch(
  () => props.jibuns,
  (list) => {
    if (initialized) return
    initialized = true
    const init = new Set<number>()
    list.forEach((j) => {
      if (
        getChildren(list, j.id).length &&
        getAncestors(list, j.id).length >= 1
      ) {
        init.add(j.id)
      }
    })
    collapsed.value = init
  },
  { immediate: true },
)

watch(
  () => props.selectedId,
  (id) => {
    if (id == null) return
    const next = new Set(collapsed.value)
    getAncestors(props.jibuns, id).forEach((a) => next.delete(a.id))
    collapsed.value = next
  },
)

const roots = computed(() => props.jibuns.filter((j) => j.parent === null))

function toggle(id: number) {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}

function levelIcon(level: Jibun['level']) {
  return LEVEL_ICONS[level] || 'ti ti-point'
}

interface FlatNode {
  jibun: Jibun
  depth: number
  hasKids: boolean
  isCollapsed: boolean
}

const flatNodes = computed<FlatNode[]>(() => {
  const out: FlatNode[] = []
  const walk = (node: Jibun, depth: number) => {
    if (depth > 30) return
    const kids = getChildren(props.jibuns, node.id)
    const isCollapsed = collapsed.value.has(node.id)
    out.push({ jibun: node, depth, hasKids: kids.length > 0, isCollapsed })
    if (kids.length && !isCollapsed) {
      kids.forEach((k) => walk(k, depth + 1))
    }
  }
  roots.value.forEach((r) => walk(r, 0))
  return out
})
</script>

<template>
  <div
    class="h-full flex flex-col bg-white border border-hw-white-darker rounded-sm overflow-hidden"
  >
    <div
      class="flex items-center justify-between px-3.5 py-[11px] border-b border-hw-white-dark bg-hw-white-light shrink-0"
    >
      <div class="flex items-center gap-2">
        <h6
          class="font-semibold text-[13px] leading-none text-hw-gray-darker m-0 tracking-[-0.3px]"
        >
          구역 목록
        </h6>
        <span
          class="font-normal text-[11px] leading-none text-hw-gray-main ml-2"
          >{{ jibuns.length }}건</span
        >
      </div>
    </div>

    <div class="py-1.5 overflow-auto flex-1">
      <div
        v-if="roots.length === 0"
        class="px-5 py-[30px] text-center text-hw-gray-main font-light text-[13px] leading-[1.5]"
      >
        표시할 지번이 없습니다.
      </div>
      <template v-else>
        <div
          v-for="n in flatNodes"
          :key="n.jibun.id"
          class="flex items-center gap-1 px-2.5 py-1.5 text-[13px] leading-none tracking-[-0.2px] cursor-pointer border-l-[3px] transition-[background] duration-[160ms] whitespace-nowrap hover:bg-hw-white-light"
          :class="
            n.jibun.id === selectedId
              ? 'bg-hw-white-dark text-hw-orange-darker font-semibold border-l-hw-orange-main'
              : 'text-hw-gray-darker border-l-transparent font-normal'
          "
          :style="{ paddingLeft: 10 + n.depth * 14 + 'px' }"
          @click="emit('select', n.jibun.id)"
        >
          <span
            v-if="n.hasKids"
            class="w-4 h-4 inline-flex items-center justify-center text-[11px] text-hw-gray-main shrink-0"
            @click.stop="toggle(n.jibun.id)"
          >
            <i
              :class="[
                'ti',
                n.isCollapsed ? 'ti-chevron-right' : 'ti-chevron-down',
              ]"
            />
          </span>
          <span
            v-else
            class="w-4 h-4 inline-flex items-center justify-center text-[11px] text-hw-gray-main shrink-0 invisible"
            >·</span
          >
          <span
            class="w-[18px] h-[18px] inline-flex items-center justify-center text-sm shrink-0"
            :class="
              n.jibun.id === selectedId
                ? 'text-hw-orange-main'
                : 'text-hw-gray-main'
            "
            ><i :class="levelIcon(n.jibun.level)"
          /></span>
          <span class="font-[inherit]">{{ n.jibun.name }}</span>
          <span
            class="text-[11px] ml-1.5"
            :class="
              n.jibun.id === selectedId
                ? 'text-hw-orange-darker'
                : 'text-hw-gray-main'
            "
            >{{ n.jibun.abbr }}</span
          >
          <span
            class="text-[9px] font-bold px-1 py-0.5 rounded-xs ml-auto shrink-0"
            :class="
              n.jibun.id === selectedId
                ? 'bg-hw-orange-main text-white'
                : 'bg-hw-white-dark text-hw-gray-dark'
            "
            >L{{ n.jibun.level }}</span
          >
        </div>
      </template>
    </div>
  </div>
</template>
