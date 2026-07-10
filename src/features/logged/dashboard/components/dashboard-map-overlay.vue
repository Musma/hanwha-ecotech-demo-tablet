<script setup lang="ts">
import { computed, ref } from 'vue'

import { Select } from '@/shared/components/ui/select'

import {
  DASHBOARD_DISPLAY_ITEMS,
  DASHBOARD_MAP_TYPE_OPTIONS,
  DASHBOARD_MAP_OPTIONS,
  type DashboardOverlayToggleState,
  DEFAULT_DASHBOARD_DISPLAY_ITEM_STATE,
  DEFAULT_DASHBOARD_MAP_OPTION_STATE,
} from '../constants/dashboard-map-overlay'

interface Props {
  fixedOverlayVisible: boolean
  mapStyle: string
}

const props = defineProps<Props>()
const mapOptions = defineModel<DashboardOverlayToggleState>('mapOptions', {
  default: () => ({ ...DEFAULT_DASHBOARD_MAP_OPTION_STATE }),
})
const displayItems = defineModel<DashboardOverlayToggleState>('displayItems', {
  default: () => ({ ...DEFAULT_DASHBOARD_DISPLAY_ITEM_STATE }),
})
const emit = defineEmits<{
  'update:fixedOverlayVisible': [value: boolean]
  'update:mapStyle': [value: string]
}>()

const search = ref('')
const mapStyleModel = computed({
  get: () => props.mapStyle,
  set: (value) => emit('update:mapStyle', value),
})

function toggleMapOption(key: string) {
  if (key === 'cad') {
    emit('update:fixedOverlayVisible', !props.fixedOverlayVisible)
    return
  }
  mapOptions.value = {
    ...mapOptions.value,
    [key]: !mapOptions.value[key],
  }
}

function toggleDisplayItem(key: string) {
  displayItems.value = {
    ...displayItems.value,
    [key]: !displayItems.value[key],
  }
}

function isMapOptionActive(key: string) {
  if (key === 'cad') return props.fixedOverlayVisible
  return mapOptions.value[key]
}
</script>

<template>
  <div
    class="absolute top-4 left-4 z-20 flex flex-col gap-3 w-[248px] pointer-events-none [&>*]:pointer-events-auto"
  >
    <div
      class="flex items-center gap-2 px-3 h-11 rounded-lg bg-[rgba(255,255,255,0.96)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-[6px]"
    >
      <i class="ti ti-search text-hw-gray-main text-lg" aria-hidden="true" />
      <input
        v-model="search"
        type="search"
        placeholder="검색할 대상 코드를 입력해주세요."
        class="flex-1 min-w-0 border-0 bg-transparent text-hw-gray-darker text-[13px] outline-none placeholder:text-hw-gray-main"
      />
    </div>

    <aside
      class="flex flex-col gap-[18px] p-4 rounded-[12px] bg-[rgba(255,255,255,0.96)] shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur-[6px]"
      aria-label="지도 제어"
    >
      <section>
        <h3 class="m-0 mb-2.5 text-hw-gray-darker text-sm font-bold">
          지도유형
        </h3>
        <Select
          v-model="mapStyleModel"
          :options="DASHBOARD_MAP_TYPE_OPTIONS"
          aria-label="지도유형"
          placeholder="지도 유형 선택"
        />
      </section>

      <section>
        <h3 class="m-0 mb-2.5 text-hw-gray-darker text-sm font-bold">
          지도옵션
        </h3>
        <ul class="flex flex-col gap-1 m-0 p-0 list-none">
          <li v-for="item in DASHBOARD_MAP_OPTIONS" :key="item.key">
            <button
              type="button"
              class="flex items-center gap-2.5 w-full py-[7px] px-2 border-0 rounded-md bg-transparent text-[13px] cursor-pointer transition-[background-color] duration-[160ms] hover:bg-hw-white-darker"
              :class="
                isMapOptionActive(item.key)
                  ? 'text-hw-gray-darker'
                  : 'text-hw-gray-dark'
              "
              :aria-pressed="isMapOptionActive(item.key)"
              @click="toggleMapOption(item.key)"
            >
              <span
                class="inline-flex items-center justify-center w-[18px] h-[18px] border-[1.5px] rounded-[5px] text-[13px] transition-[background-color,border-color,color] duration-[160ms]"
                :class="
                  isMapOptionActive(item.key)
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
                  isMapOptionActive(item.key)
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
        <h3 class="m-0 mb-2.5 text-hw-gray-darker text-sm font-bold">
          표시항목
        </h3>
        <ul class="flex flex-col gap-1 m-0 p-0 list-none">
          <li v-for="item in DASHBOARD_DISPLAY_ITEMS" :key="item.key">
            <button
              type="button"
              class="flex items-center gap-2.5 w-full py-[7px] px-2 border-0 rounded-md bg-transparent text-[13px] cursor-pointer transition-[background-color] duration-[160ms] hover:bg-hw-white-darker"
              :class="
                displayItems[item.key]
                  ? 'text-hw-gray-darker'
                  : 'text-hw-gray-dark'
              "
              :aria-pressed="displayItems[item.key]"
              @click="toggleDisplayItem(item.key)"
            >
              <span
                class="inline-flex items-center justify-center w-[18px] h-[18px] border-[1.5px] rounded-[5px] text-[13px] transition-[background-color,border-color,color] duration-[160ms]"
                :class="
                  displayItems[item.key]
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
                  displayItems[item.key]
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
