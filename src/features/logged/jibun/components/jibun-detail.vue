<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@/shared/components/ui/button'

import {
  CLASS_LABEL,
  INDOOR_LABEL,
  LEVEL_ICONS,
  PAVE_LABEL,
  STAGE_LABEL,
  TODAY,
  USE_LABEL,
} from '../constants/jibun-data'
import {
  breadcrumb,
  findActiveOp,
  formatStartPhysicalJibun,
  getChildren,
  getDisplayAreaSquareMeters,
  OP_STATUS_LABEL,
  opStatus,
  resolveInheritedProp,
} from '../utils/jibun-utils'

import type { Jibun, OperationStrategy } from '../types/jibun'

// 선택된 지번의 상세 속성, 상속 속성, 진행 중 운영 전략을 한 화면에 요약한다.
// 표시값 대부분은 props에서 파생되므로 수정 흐름은 emit으로 상위 store에 위임한다.

interface Props {
  jibun: Jibun | null
  jibuns: Jibun[]
  ops: OperationStrategy[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [id: number]
  delete: [id: number]
}>()

const crumb = computed(() => breadcrumb(props.jibuns, props.jibun))
const children = computed(() =>
  props.jibun ? getChildren(props.jibuns, props.jibun.id) : [],
)
const linkedOps = computed(() =>
  props.jibun ? props.ops.filter((o) => o.id === props.jibun!.id) : [],
)
const activeOp = computed(() =>
  props.jibun ? findActiveOp(props.ops, props.jibun.id, TODAY) : null,
)
const startPhysical = computed(() => formatStartPhysicalJibun(props.jibun))
const areaM2 = computed(() =>
  getDisplayAreaSquareMeters(props.jibun, props.jibuns),
)

const useLbl = computed(() => {
  const j = props.jibun
  return j?.use ? `${USE_LABEL[j.use as string] || j.use} (${j.use})` : '—'
})
const indoorLbl = computed(() => {
  const j = props.jibun
  return j?.indoor ? `${INDOOR_LABEL[j.indoor as string] || j.indoor}` : '—'
})
const paveLbl = computed(() => {
  const j = props.jibun
  return j?.pave ? `${PAVE_LABEL[j.pave as string] || j.pave} (${j.pave})` : '—'
})

interface ProdPropDef {
  key: keyof Jibun
  label: string
  labelMap: Record<string, string> | null
  opKey?: string
}

const PROD_PROPS: ProdPropDef[] = [
  { key: 'use', label: '용도', labelMap: USE_LABEL },
  { key: 'pcg', label: '생산품 PCG', labelMap: null },
  { key: 'pcls', label: '공종', labelMap: CLASS_LABEL, opKey: 'cls' },
  { key: 'pstage', label: '생산단계', labelMap: STAGE_LABEL, opKey: 'stage' },
  { key: 'stackType', label: '적치종류', labelMap: null, opKey: 'stack' },
  { key: 'mgr', label: '담당자', labelMap: null },
  { key: 'org', label: '관리조직', labelMap: null },
]

interface RenderedProdValue {
  display: string
  hint: 'op' | 'self' | 'inherit' | null
  hintLabel: string
  empty: boolean
}

function renderProdValue(def: ProdPropDef): RenderedProdValue {
  const j = props.jibun
  if (!j) return { display: '—', hint: null, hintLabel: '', empty: true }
  const op = activeOp.value
  if (op) {
    const opKey = (def.opKey || def.key) as keyof OperationStrategy
    const v = op[opKey]
    if (v != null && v !== '') {
      const display = def.labelMap
        ? `${def.labelMap[String(v)] || v} (${v})`
        : String(v)
      return { display, hint: 'op', hintLabel: '활성 운영전략', empty: false }
    }
  }
  const res = resolveInheritedProp(props.jibuns, j, def.key)
  if (res.value == null || res.value === '') {
    return { display: '—', hint: null, hintLabel: '', empty: true }
  }
  const display = def.labelMap
    ? `${def.labelMap[String(res.value)] || res.value} (${res.value})`
    : String(res.value)
  if (res.source && res.source.id === j.id) {
    return { display, hint: 'self', hintLabel: '자체', empty: false }
  }
  return {
    display,
    hint: 'inherit',
    hintLabel: `↑ ${res.source?.abbr ?? ''}`,
    empty: false,
  }
}

function levelIcon(level: Jibun['level']) {
  return LEVEL_ICONS[level] || 'ti ti-point'
}

function statusOf(op: OperationStrategy) {
  return opStatus(op, TODAY)
}

const STAT_CLASS: Record<string, string> = {
  ongoing: 'bg-hw-green-lighter text-hw-green-dark',
  planned: 'bg-hw-blue-lighter text-hw-blue-dark',
  ended: 'bg-hw-white-lighter text-hw-gray-main',
}
</script>

<template>
  <div
    class="h-full bg-white border border-hw-white-darker rounded-sm overflow-hidden flex flex-col"
  >
    <template v-if="!jibun">
      <div
        class="flex items-center justify-between px-3.5 py-[11px] border-b border-hw-white-dark bg-hw-white-light shrink-0"
      >
        <h6
          class="font-semibold text-[13px] leading-none text-hw-gray-darker m-0 tracking-[-0.3px]"
        >
          지번 상세
        </h6>
      </div>
      <div
        class="px-5 py-[60px] text-center text-hw-gray-main font-light text-[13px] leading-[1.6]"
      >
        <i class="ti ti-arrow-left text-2xl mb-2 block" />
        좌측 트리 또는 도면에서<br />지번을 선택해 주십시오.
      </div>
    </template>
    <template v-else>
      <div
        class="flex items-center justify-between px-3.5 py-[11px] border-b border-hw-white-dark bg-hw-white-light shrink-0"
      >
        <h6
          class="font-semibold text-[13px] leading-none text-hw-gray-darker m-0 tracking-[-0.3px]"
        >
          지번 상세
        </h6>
        <div class="flex gap-1.5">
          <Button
            variant="brand-danger"
            size="brand-sm"
            @click="emit('delete', jibun.id)"
          >
            <i class="ti ti-trash" /> 삭제
          </Button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-auto px-3 py-2">
        <div
          class="flex items-start justify-between mb-2 pb-2 border-b border-hw-white-dark"
        >
          <div class="flex-1 min-w-0">
            <div
              class="font-normal text-[11px] leading-[1.3] text-hw-gray-main mb-[3px]"
            >
              {{ crumb }}
            </div>
            <div class="flex items-center gap-2 mb-0.5">
              <span
                class="font-bold text-[19px] leading-[1.2] text-hw-gray-darker tracking-[-0.4px]"
                >{{ jibun.name }}</span
              >
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] bg-hw-orange-main text-white"
                >L{{ jibun.level }}</span
              >
              <span
                v-if="activeOp"
                class="inline-flex items-center gap-[5px] px-2 py-[3px] rounded-[3px] font-semibold text-[11px] leading-none tracking-[-0.2px] bg-hw-white-dark text-hw-orange-darker before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0"
                >활성 운영중</span
              >
            </div>
            <div class="font-normal text-xs leading-[1.3] text-hw-gray-dark">
              약어 {{ jibun.abbr }} · 단축 {{ jibun.sabbr }}
            </div>
            <div
              class="font-normal text-[11px] leading-[1.3] text-hw-gray-main mt-[3px]"
            >
              ID {{ jibun.id
              }}<template v-if="jibun.parent != null">
                · 상위 {{ jibun.parent }}</template
              >
            </div>
          </div>
        </div>

        <h6
          class="font-semibold text-[11px] leading-none tracking-[0.06em] uppercase text-hw-gray-main mt-[7px] mb-[3px] flex items-center gap-1.5 after:content-[''] after:flex-1 after:h-px after:bg-hw-white-dark"
        >
          마스터 속성
        </h6>
        <dl
          class="grid grid-cols-[64px_minmax(0,1fr)_64px_minmax(0,1fr)] gap-x-3.5 gap-y-0 [&>dt]: [&>dt]:font-normal [&>dt]:text-xs [&>dt]:leading-[1.3] [&>dt]:text-hw-gray-main [&>dt]:py-0.5 [&>dt]:border-b [&>dt]:border-hw-white-lighter [&>dd]: [&>dd]:font-normal [&>dd]:text-xs [&>dd]:leading-[1.3] [&>dd]:text-hw-gray-darker [&>dd]:py-0.5 [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-hw-white-lighter [&>dd]:break-words [&>dd.mono]: [&>dd.mono]:text-[11px]"
        >
          <dt>옥내/외</dt>
          <dd>{{ indoorLbl }}</dd>
          <dt>용도</dt>
          <dd>{{ useLbl }}</dd>
          <dt>포장</dt>
          <dd>{{ paveLbl }}</dd>
          <dt>시작 물리지번</dt>
          <dd class="mono">
            <template v-if="startPhysical">{{ startPhysical }}</template>
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt>이격거리</dt>
          <dd class="mono">({{ jibun.gap[0] }}, {{ jibun.gap[1] }})</dd>
          <dt>최대 중량</dt>
          <dd class="mono">
            <template v-if="jibun.maxT != null">{{ jibun.maxT }} ton</template>
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt>면적</dt>
          <dd class="mono">
            <template v-if="areaM2 != null"
              >{{ areaM2.toLocaleString() }} m²</template
            >
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt>관리조직</dt>
          <dd>
            <template v-if="jibun.org">{{ jibun.org }}</template>
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt>물류원가</dt>
          <dd class="mono">
            <template v-if="jibun.cost != null"
              >₩{{ jibun.cost.toLocaleString() }}</template
            >
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt>담당자</dt>
          <dd class="mono">
            <template v-if="jibun.mgr">{{ jibun.mgr }}</template>
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt class="col-[1/2]">최대 L×W×H</dt>
          <dd class="mono col-[2/-1]">
            <template v-if="jibun.maxL != null">
              {{ jibun.maxL }} × {{ jibun.maxW }} × {{ jibun.maxH }} m
            </template>
            <span v-else class="text-hw-gray-main">—</span>
          </dd>
          <dt class="col-[1/2]">형상</dt>
          <dd class="mono col-[2/-1] text-[10px] !text-hw-gray-main">
            {{ jibun.poly || '—' }}
          </dd>
        </dl>

        <h6
          class="font-semibold text-[11px] leading-none tracking-[0.06em] uppercase text-hw-gray-main mt-[7px] mb-[3px] flex items-center gap-1.5 after:content-[''] after:flex-1 after:h-px after:bg-hw-white-dark"
        >
          생산 운영 속성
          <span
            class="text-hw-gray-main normal-case font-normal tracking-normal ml-auto"
            >활성 ▸ 자체 ▸ 상속</span
          >
        </h6>
        <dl
          class="grid grid-cols-[100px_1fr] gap-x-3 gap-y-0 [&>dt]: [&>dt]:font-normal [&>dt]:text-xs [&>dt]:leading-[1.3] [&>dt]:text-hw-gray-main [&>dt]:py-0.5 [&>dt]:border-b [&>dt]:border-hw-white-lighter [&>dd]: [&>dd]:font-normal [&>dd]:text-xs [&>dd]:leading-[1.3] [&>dd]:text-hw-gray-darker [&>dd]:py-0.5 [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-hw-white-lighter [&>dd]:break-words"
        >
          <template v-for="def in PROD_PROPS" :key="String(def.key)">
            <dt>{{ def.label }}</dt>
            <dd>
              <template v-if="renderProdValue(def).empty">
                <span class="text-hw-gray-main">—</span>
              </template>
              <template v-else>
                <span>{{ renderProdValue(def).display }}</span>
                <span
                  class="font-normal text-[10px] leading-none px-[5px] py-0.5 rounded-xs ml-[5px]"
                  :class="
                    renderProdValue(def).hint === 'op'
                      ? 'text-hw-blue-dark bg-hw-blue-lighter'
                      : renderProdValue(def).hint === 'self'
                        ? 'text-hw-green-dark bg-hw-green-lighter'
                        : 'text-hw-orange-darker bg-hw-white-dark'
                  "
                >
                  {{ renderProdValue(def).hintLabel }}
                </span>
              </template>
            </dd>
          </template>
        </dl>

        <h6
          class="font-semibold text-[11px] leading-none tracking-[0.06em] uppercase text-hw-gray-main mt-[7px] mb-[3px] flex items-center gap-1.5 after:content-[''] after:flex-1 after:h-px after:bg-hw-white-dark"
        >
          하위 지번
          <span
            class="text-hw-gray-main normal-case font-normal tracking-normal ml-auto"
            >{{ children.length }}건</span
          >
        </h6>
        <div
          v-if="children.length === 0"
          class="text-center text-hw-gray-main font-light text-xs leading-[1.5] p-2"
        >
          하위 지번이 없습니다.
        </div>
        <div v-else class="flex flex-col gap-0.5 max-h-[112px] overflow-y-auto">
          <div
            v-for="c in children"
            :key="c.id"
            class="flex items-center justify-between px-[9px] py-1 rounded-[4px] bg-hw-white-light font-normal text-xs leading-[1.3] cursor-pointer border border-transparent transition-all duration-[160ms] hover:bg-hw-white-light hover:border-hw-orange-lighter"
            @click="emit('select', c.id)"
          >
            <span class="flex items-center gap-1.5">
              <i :class="levelIcon(c.level)" class="text-hw-gray-dark" />
              <b class="font-semibold text-hw-gray-darker">{{ c.abbr }}</b> ·
              {{ c.name }}
            </span>
            <span class="font-normal text-[10px] leading-none text-hw-gray-main"
              >L{{ c.level }} · {{ c.id }}</span
            >
          </div>
        </div>

        <h6
          class="font-semibold text-[11px] leading-none tracking-[0.06em] uppercase text-hw-gray-main mt-[7px] mb-[3px] flex items-center gap-1.5 after:content-[''] after:flex-1 after:h-px after:bg-hw-white-dark"
        >
          연결 운영 전략
          <span
            class="text-hw-gray-main normal-case font-normal tracking-normal ml-auto"
            >{{ linkedOps.length }}건</span
          >
        </h6>
        <div
          v-if="linkedOps.length === 0"
          class="text-center text-hw-gray-main font-light text-xs leading-[1.5] p-2"
        >
          연결된 운영 전략이 없습니다.
        </div>
        <div v-else class="flex flex-col gap-0.5 max-h-[112px] overflow-y-auto">
          <div
            v-for="(o, i) in linkedOps"
            :key="i"
            class="flex items-center justify-between px-[9px] py-1 rounded-[4px] bg-hw-white-light font-normal text-xs leading-[1.3] border border-transparent transition-all duration-[160ms] cursor-default"
          >
            <span class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center gap-[5px] px-2 py-[3px] rounded-[3px] font-semibold text-[11px] leading-none tracking-[-0.2px] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0"
                :class="STAT_CLASS[statusOf(o)]"
              >
                {{ OP_STATUS_LABEL[statusOf(o)] }}
              </span>
              <b class="font-semibold text-hw-gray-darker">{{ o.jcode }}</b>
              <span class="text-hw-gray-main">· {{ o.org }}</span>
            </span>
            <span class="font-normal text-[10px] leading-none text-hw-gray-main"
              >{{ o.from }} ~ {{ o.to }}</span
            >
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
