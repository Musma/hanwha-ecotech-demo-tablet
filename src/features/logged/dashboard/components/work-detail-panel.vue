<script setup lang="ts">
import { computed } from 'vue'

import type {
  WorkExecutionPhase,
  WorkItem,
} from '@/features/logged/dashboard/types/work-list'

interface Props {
  completedAt: string
  destinationCode: string
  elapsedTime: string
  phase: WorkExecutionPhase
  startedAt: string
  task: WorkItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  endWork: []
  startWork: []
}>()

const detail = computed(() => ({
  dimensions: props.task.detail?.dimensions ?? '10*20*10',
  weightTons: props.task.detail?.weightTons ?? 10,
}))
const isWaiting = computed(() => props.phase === 'waiting')
const isInProgress = computed(() => props.phase === 'inProgress')
const isCompleted = computed(() => props.phase === 'completed')
const statusLabel = computed(() => {
  if (isInProgress.value) return '진행중'
  if (isCompleted.value) return '작업 완료'
  return '작업 대기'
})
const statusClass = computed(() => {
  if (isInProgress.value) {
    return 'border-hw-orange-lighter bg-hw-orange-lighter/25 text-hw-orange-darker'
  }
  if (isCompleted.value) {
    return 'border-hw-blue-lighter bg-hw-blue-lighter/40 text-hw-blue-dark'
  }
  return 'border-hw-green-lighter bg-hw-green-lighter/55 text-hw-green-dark'
})
const tableHeightClass = computed(() => {
  if (isInProgress.value) return 'h-60'
  if (isCompleted.value) return 'h-[280px]'
  return 'h-80'
})
const rowHeightClass = computed(() => {
  if (isInProgress.value) return 'h-[25%]'
  if (isCompleted.value) return 'h-[20%]'
  return 'h-[16.67%]'
})
</script>

<template>
  <section
    class="flex h-full min-h-0 flex-col px-2 pt-2"
    aria-label="작업 상세"
  >
    <div
      class="flex h-12 flex-shrink-0 items-center justify-center rounded-md border text-h5 font-bold"
      :class="statusClass"
    >
      {{ statusLabel }}
    </div>

    <div class="mt-4 min-h-0 shrink overflow-hidden" :class="tableHeightClass">
      <table
        class="h-full w-full table-fixed border-collapse text-b2 text-hw-gray-dark"
      >
        <colgroup>
          <col class="w-[28%]" />
          <col class="w-[22%]" />
          <col class="w-[28%]" />
          <col class="w-[22%]" />
        </colgroup>
        <tbody>
          <tr :class="rowHeightClass">
            <th
              scope="row"
              class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
            >
              작업번호
            </th>
            <td class="border border-hw-gray-lighter px-4 font-bold">
              {{ task.id }}
            </td>
            <th
              scope="row"
              class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
            >
              작업대상
            </th>
            <td class="border border-hw-gray-lighter px-4 font-bold">
              {{ task.objectCode }}
            </td>
          </tr>
          <tr :class="rowHeightClass">
            <th
              scope="row"
              class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
            >
              명칭
            </th>
            <td class="border border-hw-gray-lighter px-4 font-bold">
              {{ task.objectName }}
            </td>
            <th
              scope="row"
              class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
            >
              중량(ton)
            </th>
            <td class="border border-hw-gray-lighter px-4 font-bold">
              {{ detail.weightTons }}
            </td>
          </tr>
          <tr :class="rowHeightClass">
            <th
              scope="row"
              class="border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left leading-tight font-normal"
            >
              <span class="block whitespace-nowrap">길이*폭*높이</span>
              <span class="block">(m)</span>
            </th>
            <td
              class="border border-hw-gray-lighter px-4 font-bold"
              :colspan="isWaiting ? 1 : 3"
            >
              {{ detail.dimensions }}
            </td>
            <template v-if="isWaiting">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                작업유형
              </th>
              <td class="border border-hw-gray-lighter px-4 font-bold">
                {{ task.category.replace(' ', '') }}
              </td>
            </template>
          </tr>

          <template v-if="isWaiting">
            <tr :class="rowHeightClass">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                작업 착수일
              </th>
              <td
                colspan="3"
                class="border border-hw-gray-lighter px-4 font-bold"
              >
                {{ task.detail?.startedAt ?? '2026/05/20' }}
              </td>
            </tr>
            <tr :class="rowHeightClass">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                작업 완료일
              </th>
              <td
                colspan="3"
                class="border border-hw-gray-lighter px-4 font-bold"
              >
                {{ task.detail?.completedAt ?? '2026/05/20' }}
              </td>
            </tr>
            <tr :class="rowHeightClass">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                상세내용
              </th>
              <td
                colspan="3"
                class="whitespace-pre-line border border-hw-gray-lighter px-4 font-bold"
              >
                {{ task.detail?.description ?? `${task.objectName} 이동 작업` }}
              </td>
            </tr>
          </template>

          <template v-else>
            <tr :class="rowHeightClass">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                출발지
              </th>
              <td
                class="border border-hw-gray-lighter px-4 font-bold text-hw-green-light"
              >
                {{ task.departureCode }}
              </td>
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                도착지
              </th>
              <td
                class="border border-hw-gray-lighter px-4 font-bold text-hw-blue-main"
              >
                {{ isCompleted ? destinationCode : '' }}
              </td>
            </tr>
            <tr v-if="isCompleted" :class="rowHeightClass">
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                작업시작 시간
              </th>
              <td class="border border-hw-gray-lighter px-4 font-bold">
                {{ startedAt }}
              </td>
              <th
                scope="row"
                class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
              >
                작업종료 시간
              </th>
              <td class="border border-hw-gray-lighter px-4 font-bold">
                {{ completedAt }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="!isWaiting"
      class="flex min-h-0 flex-1 items-center justify-center"
    >
      <p
        class="m-0 text-h5 font-normal"
        :class="isCompleted ? 'text-hw-red-main' : 'text-hw-gray-dark'"
      >
        경과시간 : {{ elapsedTime }}
      </p>
    </div>

    <div class="mt-auto grid flex-shrink-0 grid-cols-2 gap-6 pt-4">
      <button
        type="button"
        class="h-16 rounded-md text-h5 font-bold transition-colors"
        :class="
          isWaiting
            ? 'bg-hw-orange-main text-hw-white-main hover:bg-hw-orange-dark'
            : 'cursor-not-allowed bg-hw-white-lighter text-hw-gray-lighter'
        "
        :disabled="!isWaiting"
        @click="emit('startWork')"
      >
        작업 시작
      </button>
      <button
        type="button"
        class="h-16 rounded-md text-h5 font-bold transition-colors"
        :class="
          isInProgress
            ? 'bg-hw-blue-main text-hw-white-main hover:bg-hw-blue-dark'
            : 'cursor-not-allowed bg-hw-white-dark text-hw-gray-light'
        "
        :disabled="!isInProgress"
        @click="emit('endWork')"
      >
        작업 종료
      </button>
    </div>
  </section>
</template>
