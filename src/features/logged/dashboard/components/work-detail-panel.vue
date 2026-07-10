<script setup lang="ts">
import { computed } from 'vue'

import type { WorkItem } from '@/features/logged/dashboard/types/work-list'

interface Props {
  task: WorkItem
}

const props = defineProps<Props>()

const detail = computed(() => ({
  completedAt: props.task.detail?.completedAt ?? '2026/05/20',
  description:
    props.task.detail?.description ?? `${props.task.objectName} 이동 작업`,
  dimensions: props.task.detail?.dimensions ?? '10*20*10',
  startedAt: props.task.detail?.startedAt ?? '2026/05/20',
  weightTons: props.task.detail?.weightTons ?? 10,
}))
</script>

<template>
  <section class="flex min-h-0 flex-col px-2 pt-4" aria-label="작업 상세">
    <div
      class="flex h-16 flex-shrink-0 items-center justify-center rounded-md border border-hw-green-lighter bg-hw-green-lighter/55 text-h3 font-bold text-hw-green-dark"
    >
      작업 대기
    </div>

    <table
      class="mt-8 w-full table-fixed border-collapse text-h4 text-hw-gray-dark"
    >
      <colgroup>
        <col class="w-[28%]" />
        <col class="w-[22%]" />
        <col class="w-[28%]" />
        <col class="w-[22%]" />
      </colgroup>
      <tbody>
        <tr class="h-[68px]">
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
        <tr class="h-[68px]">
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
        <tr class="h-[68px]">
          <th
            scope="row"
            class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
          >
            길이*폭*높이(m)
          </th>
          <td class="border border-hw-gray-lighter px-4 font-bold">
            {{ detail.dimensions }}
          </td>
          <th
            scope="row"
            class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
          >
            작업유형
          </th>
          <td class="border border-hw-gray-lighter px-4 font-bold">
            {{ task.category.replace(' ', '') }}
          </td>
        </tr>
        <tr class="h-[70px]">
          <th
            scope="row"
            class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
          >
            작업 착수일
          </th>
          <td colspan="3" class="border border-hw-gray-lighter px-4 font-bold">
            {{ detail.startedAt }}
          </td>
        </tr>
        <tr class="h-[70px]">
          <th
            scope="row"
            class="whitespace-nowrap border border-hw-gray-lighter bg-hw-white-lighter px-3 text-left font-normal"
          >
            작업 완료일
          </th>
          <td colspan="3" class="border border-hw-gray-lighter px-4 font-bold">
            {{ detail.completedAt }}
          </td>
        </tr>
        <tr class="h-[76px]">
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
            {{ detail.description }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="-mr-2 ml-2 mt-auto grid grid-cols-2 gap-8 pt-6">
      <button
        type="button"
        class="h-20 rounded-lg bg-hw-orange-main text-h3 font-bold text-hw-white-main transition-colors hover:bg-hw-orange-dark"
      >
        작업 시작
      </button>
      <button
        type="button"
        disabled
        class="h-20 cursor-not-allowed rounded-lg bg-hw-white-dark text-h3 font-bold text-hw-gray-light"
      >
        작업 종료
      </button>
    </div>
  </section>
</template>
