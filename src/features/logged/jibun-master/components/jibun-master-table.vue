<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  INDOOR_LABEL,
  LEVEL_ICONS,
  LEVEL_LABEL,
  PAVE_LABEL,
  USE_LABEL,
} from '@/features/logged/jibun/constants/jibun-data'
import type { Jibun, JibunLevel } from '@/features/logged/jibun/types/jibun'
import {
  formatStartPhysicalJibun,
  getAncestors,
  getChildren,
  getDisplayAreaSquareMeters,
  getStartPhysicalJibun,
} from '@/features/logged/jibun/utils/jibun-utils'
import ComboSelect from '@/shared/components/combo-select.vue'
import LoggedPageHead from '@/shared/components/logged-page-head.vue'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

import {
  exportJibunsCsv,
  parseJibunsCsv,
  type ParseJibunsResult,
} from '../utils/jibun-master-csv'

// 지번 마스터 관리 화면의 테이블/트리 보기와 CSV 입출력을 담당한다.
// 데이터 변경은 직접 저장하지 않고 상위 store로 이벤트를 올린다.

interface Props {
  jibuns: Jibun[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: number]
  import: [result: ParseJibunsResult]
}>()

const view = ref<'tree' | 'flat'>('tree')
const query = ref('')
const levelFilter = ref<string>('')
const orgFilter = ref<string>('')
const collapsed = ref<Set<number>>(new Set())
const fileInputRef = ref<HTMLInputElement | null>(null)

const orgs = computed(() => [
  ...new Set(props.jibuns.map((j) => j.org).filter((o): o is string => !!o)),
])

function matches(j: Jibun): boolean {
  const q = query.value.trim().toLowerCase()
  if (q) {
    const hit =
      (j.name && j.name.toLowerCase().includes(q)) ||
      (j.abbr && j.abbr.toLowerCase().includes(q)) ||
      (j.sabbr && j.sabbr.toLowerCase().includes(q)) ||
      String(j.id).includes(q)
    if (!hit) return false
  }
  if (levelFilter.value !== '' && j.level !== parseInt(levelFilter.value))
    return false
  if (orgFilter.value && j.org !== orgFilter.value) return false
  return true
}

const treeVisible = computed<Set<number> | null>(() => {
  const q = query.value.trim()
  if (!q && levelFilter.value === '' && !orgFilter.value) return null
  const show = new Set<number>()
  props.jibuns.filter(matches).forEach((j) => {
    show.add(j.id)
    getAncestors(props.jibuns, j.id).forEach((a) => show.add(a.id))
  })
  return show
})

const treeEmpty = computed(
  () => treeVisible.value && treeVisible.value.size === 0,
)

const flatRows = computed(() => props.jibuns.filter(matches))
const roots = computed(() => props.jibuns.filter((j) => j.parent === null))

interface FlatTreeRow {
  jibun: Jibun
  depth: number
  hasKids: boolean
  isCollapsed: boolean
}

const flatTreeRows = computed<FlatTreeRow[]>(() => {
  const out: FlatTreeRow[] = []
  const visible = treeVisible.value
  const walk = (j: Jibun, depth: number) => {
    if (visible && !visible.has(j.id)) return
    const kids = getChildren(props.jibuns, j.id)
    const isCollapsed = collapsed.value.has(j.id)
    out.push({ jibun: j, depth, hasKids: kids.length > 0, isCollapsed })
    if (kids.length && !isCollapsed) {
      kids.forEach((k) => walk(k, depth + 1))
    }
  }
  roots.value.forEach((r) => walk(r, 0))
  return out
})

function expandAll() {
  collapsed.value = new Set()
}

function collapseAll() {
  const all = new Set<number>()
  props.jibuns.forEach((j) => {
    if (getChildren(props.jibuns, j.id).length) all.add(j.id)
  })
  collapsed.value = all
}

function toggle(id: number) {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}

function levelIcon(level: JibunLevel) {
  return LEVEL_ICONS[level] || 'ti ti-point'
}

function handleCsvUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files && input.files[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => emit('import', parseJibunsCsv(String(reader.result)))
  reader.onerror = () => emit('import', { error: '파일을 읽지 못했습니다.' })
  reader.readAsText(file, 'utf-8')
}

function handleCsvExport() {
  const headers = [
    'ID',
    '상위ID',
    '약어',
    '단축',
    '명칭',
    'Level',
    '시작물리X',
    '시작물리Y',
    '이격X',
    '이격Y',
    '옥내',
    '용도',
    '포장',
    '최대L',
    '최대W',
    '최대H',
    'MaxT',
    '면적',
    '관리조직',
    '물류원가',
    '형상',
  ]
  const rows = props.jibuns.map((j) => {
    const start = getStartPhysicalJibun(j)
    return [
      j.id,
      j.parent ?? '',
      j.abbr,
      j.sabbr,
      j.name,
      j.level,
      start ? start.col : '',
      start ? start.row : '',
      j.gap[0],
      j.gap[1],
      j.indoor || '',
      j.use || '',
      j.pave || '',
      j.maxL ?? '',
      j.maxW ?? '',
      j.maxH ?? '',
      j.maxT ?? '',
      getDisplayAreaSquareMeters(j, props.jibuns) ?? '',
      j.org || '',
      j.cost ?? '',
      j.poly || '',
    ]
  })
  exportJibunsCsv('지번관리마스터_v0.1.csv', headers, rows)
}

const levelOptions = [0, 1, 2, 3, 4].map((lv) => ({
  value: String(lv),
  label: `L${lv} · ${LEVEL_LABEL[lv as JibunLevel]}`,
}))

const orgOptions = computed(() =>
  orgs.value.map((o) => ({ value: o, label: o })),
)

function indoorShort(code: string | null): string | null {
  if (!code) return null
  const v = INDOOR_LABEL[code]
  if (!v) return code
  return v.replace(/\s*\(.*\)$/, '')
}

function useLabel(code: string | null): string | null {
  if (!code) return null
  return USE_LABEL[code] || code
}

function paveLabel(code: string | null): string | null {
  if (!code) return null
  return PAVE_LABEL[code] || code
}

const LV_PILL_BASE =
  'inline-block min-w-[22px] px-1.5 py-[1px] rounded-[3px] text-center  font-semibold text-[11px] leading-[1.4]'

const LV_PILL_VARIANTS: Record<number, string> = {
  0: 'bg-hw-white-lighter text-hw-gray-dark border border-hw-white-darker',
  1: 'bg-hw-white-dark text-hw-orange-darker border border-hw-orange-lighter',
  2: 'bg-hw-blue-lighter text-hw-blue-dark border border-hw-blue-lighter',
  3: 'bg-hw-green-lighter text-hw-green-dark border border-hw-green-lighter',
  4: 'bg-hw-white-dark text-hw-blue-darker border border-hw-gray-lighter',
}

function lvPillClass(level: number): string {
  return `${LV_PILL_BASE} ${LV_PILL_VARIANTS[level] ?? 'bg-hw-white-light text-hw-gray-dark border border-hw-white-darker'}`
}
</script>

<template>
  <div>
    <LoggedPageHead title="지번관리 마스터">
      <template #actions>
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,text/csv"
          class="hidden"
          @change="handleCsvUpload"
        />
        <Button
          variant="brand-outline"
          size="brand"
          @click="fileInputRef?.click()"
        >
          <i class="ti ti-upload" /> CSV 업로드
        </Button>
        <Button variant="brand-outline" size="brand" @click="handleCsvExport">
          <i class="ti ti-download" /> CSV 다운로드
        </Button>
      </template>
    </LoggedPageHead>

    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2 flex-wrap">
        <div
          class="flex p-0.5 rounded-[4px] border border-hw-gray-lighter bg-white"
        >
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-0 cursor-pointer font-medium text-xs leading-none tracking-[-0.2px] transition-all duration-[160ms] ease-smooth"
            :class="
              view === 'tree'
                ? 'bg-hw-gray-darker text-white'
                : 'bg-white text-hw-gray-darker hover:text-hw-orange-main'
            "
            @click="view = 'tree'"
          >
            <i class="ti ti-binary-tree-2" /> 트리 보기
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-0 cursor-pointer font-medium text-xs leading-none tracking-[-0.2px] transition-all duration-[160ms] ease-smooth"
            :class="
              view === 'flat'
                ? 'bg-hw-gray-darker text-white'
                : 'bg-white text-hw-gray-darker hover:text-hw-orange-main'
            "
            @click="view = 'flat'"
          >
            <i class="ti ti-list" /> 평면 보기
          </button>
        </div>
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-hw-gray-lighter focus-within:border-hw-orange-main"
        >
          <i class="ti ti-search text-[15px] text-hw-gray-main" />
          <Input
            v-model="query"
            class="h-auto w-[180px] rounded-none border-0 bg-transparent p-0 focus:shadow-none"
            placeholder="ID · 약어 · 명칭 검색"
          />
        </div>
        <div class="min-w-[160px]">
          <ComboSelect
            v-model="levelFilter"
            :options="levelOptions"
            placeholder="전체 Level"
          />
        </div>
        <div class="min-w-[160px]">
          <ComboSelect
            v-model="orgFilter"
            :options="orgOptions"
            placeholder="전체 조직"
          />
        </div>
      </div>
      <div v-if="view === 'tree'" class="flex gap-1.5">
        <Button variant="brand-outline" size="brand-sm" @click="expandAll">
          <i class="ti ti-fold-down" /> 모두 펼치기
        </Button>
        <Button variant="brand-outline" size="brand-sm" @click="collapseAll">
          <i class="ti ti-fold-up" /> 모두 접기
        </Button>
      </div>
    </div>

    <div
      class="flex flex-col overflow-hidden rounded-sm border border-hw-white-darker bg-white"
    >
      <div class="flex-1 overflow-auto max-h-[calc(100vh-280px)]">
        <table
          class="w-full border-collapse bg-white font-normal text-[13px] leading-[1.4]"
        >
          <thead
            v-if="view === 'tree'"
            class="sticky top-0 z-[1] bg-hw-white-light"
          >
            <tr>
              <th
                class="min-w-[240px] text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                계층 / 약어 / 명칭
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                ID
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                상위 ID
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                단축
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                Level
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                시작 물리지번
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                이격
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                옥내
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                용도
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                포장
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 L
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 W
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 H
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                Max ton
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                면적 (㎡)
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                관리조직
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                물류원가
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                형상
              </th>
            </tr>
          </thead>
          <thead v-else class="sticky top-0 z-[1] bg-hw-white-light">
            <tr>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                ID
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                상위 ID
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                약어
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                단축
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                명칭
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                Level
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                시작 물리지번
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                이격
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                옥내
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                용도
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                포장
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 L
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 W
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                최대 H
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                Max ton
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                면적 (㎡)
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                관리조직
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                물류원가
              </th>
              <th
                class="text-left px-2.5 py-[9px] font-semibold text-[11px] leading-none tracking-[0.02em] uppercase text-hw-gray-dark border-b border-hw-white-dark whitespace-nowrap"
              >
                형상
              </th>
            </tr>
          </thead>

          <tbody v-if="view === 'tree'">
            <tr
              v-for="row in flatTreeRows"
              :key="row.jibun.id"
              class="group cursor-pointer transition-[background] duration-[120ms]"
              @click="emit('select', row.jibun.id)"
            >
              <td
                class="whitespace-nowrap px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
                :style="{ paddingLeft: 10 + row.depth * 16 + 'px' }"
              >
                <span
                  v-if="row.hasKids"
                  class="inline-flex w-4 mr-1 cursor-pointer text-hw-gray-main"
                  @click.stop="toggle(row.jibun.id)"
                >
                  <i
                    :class="[
                      'ti',
                      row.isCollapsed ? 'ti-chevron-right' : 'ti-chevron-down',
                    ]"
                  />
                </span>
                <span v-else class="inline-block w-5" />
                <i
                  :class="levelIcon(row.jibun.level)"
                  class="text-hw-gray-main mr-1.5"
                />
                <b class="font-semibold text-hw-gray-darker">{{
                  row.jibun.abbr
                }}</b>
                <span class="ml-1.5 text-hw-gray-main">{{
                  row.jibun.name
                }}</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.id }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="row.jibun.parent != null">{{
                  row.jibun.parent
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.sabbr }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <span :class="lvPillClass(row.jibun.level)"
                  >L{{ row.jibun.level }}</span
                >
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="formatStartPhysicalJibun(row.jibun)">{{
                  formatStartPhysicalJibun(row.jibun)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                ({{ row.jibun.gap[0] }},{{ row.jibun.gap[1] }})
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template
                  v-if="indoorShort(row.jibun.indoor as string | null)"
                  >{{
                    indoorShort(row.jibun.indoor as string | null)
                  }}</template
                >
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="useLabel(row.jibun.use as string | null)">{{
                  useLabel(row.jibun.use as string | null)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="paveLabel(row.jibun.pave as string | null)">{{
                  paveLabel(row.jibun.pave as string | null)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.maxL ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.maxW ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.maxH ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ row.jibun.maxT ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template
                  v-if="getDisplayAreaSquareMeters(row.jibun, jibuns) != null"
                >
                  {{
                    getDisplayAreaSquareMeters(
                      row.jibun,
                      jibuns,
                    )!.toLocaleString()
                  }}
                </template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="row.jibun.org">{{ row.jibun.org }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="row.jibun.cost != null"
                  >₩{{ row.jibun.cost.toLocaleString() }}</template
                >
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-[10px] text-hw-gray-dark max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap group-hover:bg-hw-white-light"
              >
                {{ row.jibun.poly || '—' }}
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr
              v-for="j in flatRows"
              :key="j.id"
              class="group cursor-pointer transition-[background] duration-[120ms]"
              @click="emit('select', j.id)"
            >
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.id }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="j.parent != null">{{ j.parent }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <b class="font-semibold text-hw-gray-darker">{{ j.abbr }}</b>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.sabbr }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                {{ j.name }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <span :class="lvPillClass(j.level)">L{{ j.level }}</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="formatStartPhysicalJibun(j)">{{
                  formatStartPhysicalJibun(j)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                ({{ j.gap[0] }},{{ j.gap[1] }})
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="indoorShort(j.indoor as string | null)">{{
                  indoorShort(j.indoor as string | null)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="useLabel(j.use as string | null)">{{
                  useLabel(j.use as string | null)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="paveLabel(j.pave as string | null)">{{
                  paveLabel(j.pave as string | null)
                }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.maxL ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.maxW ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.maxH ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                {{ j.maxT ?? '—' }}
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="getDisplayAreaSquareMeters(j, jibuns) != null">
                  {{ getDisplayAreaSquareMeters(j, jibuns)!.toLocaleString() }}
                </template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-hw-gray-darker tracking-[-0.2px] font-light group-hover:bg-hw-white-light"
              >
                <template v-if="j.org">{{ j.org }}</template>
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-xs text-hw-gray-dark group-hover:bg-hw-white-light"
              >
                <template v-if="j.cost != null"
                  >₩{{ j.cost.toLocaleString() }}</template
                >
                <span v-else class="text-hw-gray-main">—</span>
              </td>
              <td
                class="px-2.5 py-[9px] border-b border-hw-white-lighter text-[10px] text-hw-gray-dark max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap group-hover:bg-hw-white-light"
              >
                {{ j.poly || '—' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="view === 'flat' && flatRows.length === 0"
          class="px-5 py-[60px] text-center text-hw-gray-main font-light text-[13px] leading-[1.5]"
        >
          검색 조건에 일치하는 지번이 없습니다.
        </div>
        <div
          v-if="view === 'tree' && treeEmpty"
          class="px-5 py-[60px] text-center text-hw-gray-main font-light text-[13px] leading-[1.5]"
        >
          검색 조건에 일치하는 지번이 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>
