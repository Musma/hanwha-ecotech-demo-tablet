<script setup lang="ts">
import { computed, ref } from 'vue'

import { Select } from '@/shared/components/ui/select'
import { MAP_STYLE_OPTIONS } from '@/shared/constants/map'

interface Props {
  blockVisible: boolean
  fixedOverlayVisible: boolean
  gridVisible: boolean
  materialVisible: boolean
  mapStyle: string
  obstacleVisible: boolean
  parcelVisible: boolean
  roadJibunVisible: boolean
  transportVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:blockVisible': [value: boolean]
  'update:fixedOverlayVisible': [value: boolean]
  'update:gridVisible': [value: boolean]
  'update:materialVisible': [value: boolean]
  'update:mapStyle': [value: string]
  'update:obstacleVisible': [value: boolean]
  'update:parcelVisible': [value: boolean]
  'update:roadJibunVisible': [value: boolean]
  'update:transportVisible': [value: boolean]
}>()

const search = ref('')
const mapStyleModel = computed({
  get: () => props.mapStyle,
  set: (value) => emit('update:mapStyle', value),
})

const mapOptions = [
  {
    key: 'roadJibun',
    label: '차도지번',
    icon: 'ti-road',
    model: 'roadJibunVisible',
  },
  {
    key: 'cad',
    label: 'CAD 도면',
    icon: 'ti-vector',
    model: 'fixedOverlayVisible',
  },
  {
    key: 'jibunLabel',
    label: '지번 표시',
    icon: 'ti-tag',
    model: 'parcelVisible',
  },
  {
    key: 'stacked',
    label: '적치 여부',
    icon: 'ti-stack-2',
    model: 'gridVisible',
  },
] as const

const displayItems = [
  {
    key: 'material',
    label: '자재',
    icon: 'ti-box',
    model: 'materialVisible',
  },
  {
    key: 'block',
    label: '블록',
    icon: 'ti-square',
    model: 'blockVisible',
  },
  {
    key: 'obstacle',
    label: '방해요소',
    icon: 'ti-alert-triangle',
    model: 'obstacleVisible',
  },
  {
    key: 'transport',
    label: '운송자원',
    icon: 'ti-truck',
    model: 'transportVisible',
  },
] as const

function toggle(
  model:
    | 'blockVisible'
    | 'fixedOverlayVisible'
    | 'gridVisible'
    | 'materialVisible'
    | 'obstacleVisible'
    | 'parcelVisible'
    | 'roadJibunVisible'
    | 'transportVisible',
  value: boolean,
) {
  emit(`update:${model}`, !value)
}
</script>

<template>
  <div
    class="absolute top-4 left-4 z-20 flex w-[248px] flex-col gap-3 pointer-events-none [&>*]:pointer-events-auto"
  >
    <div
      class="flex h-11 items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.96)] px-3 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-[6px]"
    >
      <i class="ti ti-search text-lg text-hw-gray-main" aria-hidden="true" />
      <input
        v-model="search"
        type="search"
        placeholder="검색할 지번 코드를 입력해주세요."
        class="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-hw-gray-darker outline-none placeholder:text-hw-gray-main"
      />
    </div>

    <aside
      class="flex flex-col gap-[18px] rounded-[12px] bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur-[6px]"
      aria-label="지도 제어"
    >
      <section>
        <h3 class="m-0 mb-2.5 text-sm font-bold text-hw-gray-darker">
          지도유형
        </h3>
        <Select
          v-model="mapStyleModel"
          :options="MAP_STYLE_OPTIONS"
          aria-label="지도유형"
          placeholder="지도 유형 선택"
        />
      </section>

      <section>
        <h3 class="m-0 mb-2.5 text-sm font-bold text-hw-gray-darker">
          지도옵션
        </h3>
        <ul class="m-0 flex list-none flex-col gap-1 p-0">
          <li v-for="item in mapOptions" :key="item.key">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent px-2 py-[7px] text-[13px] transition-[background-color] duration-[160ms] hover:bg-hw-white-darker"
              :class="
                $props[item.model] ? 'text-hw-gray-darker' : 'text-hw-gray-dark'
              "
              :aria-pressed="$props[item.model]"
              @click="toggle(item.model, $props[item.model])"
            >
              <span
                class="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] text-[13px] transition-[background-color,border-color,color] duration-[160ms]"
                :class="
                  $props[item.model]
                    ? 'border-hw-orange-main bg-hw-orange-main text-hw-white-main'
                    : 'border-hw-gray-light bg-hw-white-main text-transparent'
                "
              >
                <i class="ti ti-check" aria-hidden="true" />
              </span>
              <i
                class="ti text-[17px]"
                :class="[
                  item.icon,
                  $props[item.model]
                    ? 'text-hw-orange-main'
                    : 'text-hw-gray-main',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1 text-left">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section>
        <h3 class="m-0 mb-2.5 text-sm font-bold text-hw-gray-darker">
          표시항목
        </h3>
        <ul class="m-0 flex list-none flex-col gap-1 p-0">
          <li v-for="item in displayItems" :key="item.key">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent px-2 py-[7px] text-[13px] transition-[background-color] duration-[160ms] hover:bg-hw-white-darker"
              :class="
                $props[item.model] ? 'text-hw-gray-darker' : 'text-hw-gray-dark'
              "
              :aria-pressed="$props[item.model]"
              @click="toggle(item.model, $props[item.model])"
            >
              <span
                class="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] text-[13px] transition-[background-color,border-color,color] duration-[160ms]"
                :class="
                  $props[item.model]
                    ? 'border-hw-orange-main bg-hw-orange-main text-hw-white-main'
                    : 'border-hw-gray-light bg-hw-white-main text-transparent'
                "
              >
                <i class="ti ti-check" aria-hidden="true" />
              </span>
              <i
                class="ti text-[17px]"
                :class="[
                  item.icon,
                  $props[item.model]
                    ? 'text-hw-orange-main'
                    : 'text-hw-gray-main',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1 text-left">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>
    </aside>
  </div>
</template>
