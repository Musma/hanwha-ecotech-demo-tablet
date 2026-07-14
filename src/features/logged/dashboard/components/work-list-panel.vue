<script setup lang="ts">
import { computed } from 'vue'

import { WORK_LIST_TABS } from '@/features/logged/dashboard/constants/work-list'
import type {
  WorkItem,
  WorkListTab,
} from '@/features/logged/dashboard/types/work-list'

interface Props {
  tasks: WorkItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectTask: [task: WorkItem]
}>()
const activeTab = defineModel<WorkListTab>('activeTab', {
  default: 'pending',
})

const visibleTasks = computed(() => {
  if (activeTab.value === 'all') return props.tasks
  return props.tasks.filter((task) => task.status === activeTab.value)
})

function statusLabel(status: WorkItem['status']) {
  return status === 'pending' ? '작업대기' : '작업완료'
}
</script>

<template>
  <section class="flex min-h-0 flex-col" aria-label="작업 목록">
    <div class="grid h-10 flex-shrink-0 grid-cols-3" role="tablist">
      <button
        v-for="tab in WORK_LIST_TABS"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        class="text-s2 transition-colors"
        :class="
          activeTab === tab.key
            ? 'bg-hw-white-main font-bold text-hw-orange-main'
            : 'bg-hw-white-dark text-hw-gray-main hover:text-hw-gray-dark'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <div class="mt-7 min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
      <ul class="m-0 flex list-none flex-col gap-3.5 p-0">
        <li v-for="task in visibleTasks" :key="task.id">
          <button
            type="button"
            class="w-full rounded-sm border border-hw-gray-lighter bg-hw-white-main px-5 py-4 text-left transition-colors"
            :class="
              task.status === 'pending'
                ? 'cursor-pointer hover:border-hw-orange-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hw-orange-main'
                : 'cursor-default'
            "
            :disabled="task.status !== 'pending'"
            @click="emit('selectTask', task)"
          >
            <div class="grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-2">
              <div class="flex flex-col items-start gap-2">
                <span
                  class="inline-flex h-6 items-center rounded-sm px-3 text-c2 font-bold"
                  :class="
                    task.status === 'pending'
                      ? 'bg-hw-green-lighter text-hw-green-dark'
                      : 'bg-hw-white-darker text-hw-gray-dark'
                  "
                >
                  {{ statusLabel(task.status) }}
                </span>
                <span class="text-c1 whitespace-nowrap text-hw-gray-dark">
                  호선 : <strong class="font-bold">{{ task.hullNo }}</strong>
                </span>
              </div>

              <div class="min-w-0">
                <p class="m-0 text-s2 text-hw-gray-darker">
                  실행계획 Activity
                  <strong class="font-bold">{{ task.activityCode }}</strong>
                  <span class="font-bold text-hw-gray-darker">
                    ({{ task.stage }})
                  </span>
                </p>

                <div
                  class="mt-2 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-x-4 gap-y-1 text-c1 text-hw-gray-dark"
                >
                  <span>블록No. : {{ task.blockNo }}</span>
                  <span>
                    출발지 :
                    <strong class="font-bold">{{ task.departureCode }}</strong
                    ><span class="font-bold text-hw-gray-darker"
                      >({{ task.departureName }})</span
                    >
                  </span>
                  <span>PCG : {{ task.pcg }}</span>
                  <span>
                    도착지 :
                    <strong class="font-bold">{{ task.arrivalCode }}</strong
                    ><span class="font-bold text-hw-gray-darker"
                      >({{ task.arrivalName }})</span
                    >
                  </span>
                </div>
              </div>
            </div>
          </button>
        </li>
      </ul>

      <p
        v-if="visibleTasks.length === 0"
        class="m-0 py-12 text-center text-s2 text-hw-gray-main"
      >
        표시할 작업이 없습니다.
      </p>
    </div>
  </section>
</template>
