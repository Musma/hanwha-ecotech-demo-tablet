<script setup lang="ts">
import { computed } from 'vue'

import { Card } from '@/shared/components/ui/card'

import {
  DASHBOARD_BLOCK_COUNT,
  DASHBOARD_EQUIPMENT,
  DASHBOARD_INOUT,
  DASHBOARD_OCCUPANCY,
  OCCUPANCY_SEGMENT_COUNT,
} from '../constants/dashboard-stats'

const occupancySegments = computed(() => {
  const filled = Math.round(
    (DASHBOARD_OCCUPANCY.percent / 100) * OCCUPANCY_SEGMENT_COUNT,
  )
  return Array.from({ length: OCCUPANCY_SEGMENT_COUNT }, (_, i) => i < filled)
})

const deltaIcon = (tone: 'up' | 'down') =>
  tone === 'up' ? 'ti-arrow-up' : 'ti-arrow-down'

const deltaToneClass = (tone: 'up' | 'down') =>
  tone === 'up'
    ? 'bg-hw-red-lighter text-hw-red-light'
    : 'bg-hw-blue-lighter text-hw-blue-dark'
</script>

<template>
  <section
    class="grid grid-cols-4 gap-4 mb-4 max-[1080px]:grid-cols-2"
    aria-label="대시보드 요약"
  >
    <!-- 야드 점유율 -->
    <Card
      class="gap-3.5 rounded-xl bg-hw-white-main px-[22px] py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-0"
    >
      <header class="flex items-center gap-2.5">
        <i
          class="ti text-hw-orange-main text-[22px]"
          :class="DASHBOARD_OCCUPANCY.icon"
        />
        <h3 class="m-0 text-hw-gray-dark text-[15px] font-semibold">
          {{ DASHBOARD_OCCUPANCY.title }}
        </h3>
      </header>
      <div class="flex items-center gap-3.5">
        <strong
          class="text-hw-gray-darker text-[32px] font-extrabold leading-[1.1]"
          >{{ DASHBOARD_OCCUPANCY.percent }}%</strong
        >
        <span
          class="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap"
          :class="deltaToneClass(DASHBOARD_OCCUPANCY.delta.tone)"
        >
          {{ DASHBOARD_OCCUPANCY.delta.label }}
          <i
            class="ti text-sm"
            :class="deltaIcon(DASHBOARD_OCCUPANCY.delta.tone)"
          />
          {{ DASHBOARD_OCCUPANCY.delta.value }}
        </span>
      </div>
      <div class="flex gap-[3px]" aria-hidden="true">
        <span
          v-for="(filled, i) in occupancySegments"
          :key="i"
          class="flex-1 h-4 rounded-[3px]"
          :class="filled ? 'bg-hw-orange-main' : 'bg-hw-white-darker'"
        />
      </div>
    </Card>

    <!-- 블록 개소 -->
    <Card
      class="gap-3.5 rounded-xl bg-hw-white-main px-[22px] py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-0"
    >
      <header class="flex items-center gap-2.5">
        <i
          class="ti text-hw-orange-main text-[22px]"
          :class="DASHBOARD_BLOCK_COUNT.icon"
        />
        <h3 class="m-0 text-hw-gray-dark text-[15px] font-semibold">
          {{ DASHBOARD_BLOCK_COUNT.title }}
        </h3>
      </header>
      <div class="flex flex-col items-start gap-2.5">
        <strong
          class="text-hw-gray-darker text-[32px] font-extrabold leading-[1.1]"
          >{{ DASHBOARD_BLOCK_COUNT.value }}</strong
        >
        <span
          class="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap"
          :class="deltaToneClass(DASHBOARD_BLOCK_COUNT.delta.tone)"
        >
          {{ DASHBOARD_BLOCK_COUNT.delta.label }}
          <i
            class="ti text-sm"
            :class="deltaIcon(DASHBOARD_BLOCK_COUNT.delta.tone)"
          />
          {{ DASHBOARD_BLOCK_COUNT.delta.value }}
        </span>
      </div>
    </Card>

    <!-- 입출고 현황 -->
    <Card
      class="gap-3.5 rounded-xl bg-hw-white-main px-[22px] py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-0"
    >
      <header class="flex items-center gap-2.5">
        <i
          class="ti text-hw-orange-main text-[22px]"
          :class="DASHBOARD_INOUT.icon"
        />
        <h3 class="m-0 text-hw-gray-dark text-[15px] font-semibold">
          {{ DASHBOARD_INOUT.title }}
        </h3>
      </header>
      <div class="flex items-stretch">
        <div
          v-for="(col, i) in DASHBOARD_INOUT.columns"
          :key="i"
          class="flex flex-1 flex-col gap-2 [&+&]:pl-[22px] [&+&]:border-l [&+&]:border-hw-white-darker"
        >
          <strong
            class="text-hw-gray-darker text-[32px] font-extrabold leading-[1.1]"
            >{{ col.value }}</strong
          >
          <span class="text-hw-gray-main text-[13px]">{{ col.label }}</span>
        </div>
      </div>
    </Card>

    <!-- 운행중 장비 -->
    <Card
      class="gap-3.5 rounded-xl bg-hw-white-main px-[22px] py-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-0"
    >
      <header class="flex items-center gap-2.5">
        <i
          class="ti text-hw-orange-main text-[22px]"
          :class="DASHBOARD_EQUIPMENT.icon"
        />
        <h3 class="m-0 text-hw-gray-dark text-[15px] font-semibold">
          {{ DASHBOARD_EQUIPMENT.title }}
        </h3>
      </header>
      <div class="flex flex-col items-start gap-2.5">
        <strong
          class="text-hw-gray-darker text-[32px] font-extrabold leading-[1.1]"
          >{{ DASHBOARD_EQUIPMENT.value }}</strong
        >
        <ul class="flex flex-wrap gap-y-1.5 gap-x-3.5 m-0 p-0 list-none">
          <li
            v-for="item in DASHBOARD_EQUIPMENT.items"
            :key="item.label"
            class="inline-flex items-center gap-1.5 text-hw-gray-dark text-[13px]"
          >
            <span
              class="inline-block w-[7px] h-[7px] rounded-full"
              :style="{ background: item.tone }"
            />
            {{ item.label }} {{ item.value }}
          </li>
        </ul>
      </div>
    </Card>
  </section>
</template>
