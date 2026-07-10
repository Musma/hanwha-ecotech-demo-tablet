<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import WorkDetailPanel from '@/features/logged/dashboard/components/work-detail-panel.vue'
import WorkListHeader from '@/features/logged/dashboard/components/work-list-header.vue'
import WorkListMap from '@/features/logged/dashboard/components/work-list-map.vue'
import WorkListPanel from '@/features/logged/dashboard/components/work-list-panel.vue'
import { useWorkExecution } from '@/features/logged/dashboard/composables/use-work-execution'
import {
  WORK_ITEMS,
  WORK_TEST_DESTINATION_CODE,
} from '@/features/logged/dashboard/constants/work-list'
import type {
  WorkItem,
  WorkListTab,
} from '@/features/logged/dashboard/types/work-list'

interface Props {
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
})
const emit = defineEmits<{
  logout: []
}>()

const router = useRouter()
const activeTab = shallowRef<WorkListTab>('pending')
const selectedTask = shallowRef<WorkItem | null>(null)
const {
  completedAt,
  completeWork,
  destinationCode,
  elapsedTime,
  phase,
  resetWork,
  startedAt,
  startWork,
} = useWorkExecution()

function logout() {
  if (props.embedded) {
    emit('logout')
    return
  }
  void router.push('/login')
}

function selectTask(task: WorkItem) {
  if (task.status !== 'pending') return
  resetWork()
  selectedTask.value = task
}

function endWork() {
  completeWork(WORK_TEST_DESTINATION_CODE)
}
</script>

<template>
  <div
    class="overflow-hidden"
    :class="
      props.embedded
        ? 'h-full bg-hw-white-main'
        : 'h-screen bg-hw-gray-dark p-4'
    "
  >
    <div
      class="flex h-full min-h-0 flex-col overflow-hidden bg-hw-white-main"
      :class="{ 'shadow-2xl': !props.embedded }"
    >
      <WorkListHeader
        employee-name="홍길동"
        vehicle-number="175바 1255"
        @logout="logout"
      />

      <main
        class="grid min-h-0 flex-1 grid-cols-1 gap-6 bg-hw-white-main p-6 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
      >
        <WorkDetailPanel
          v-if="selectedTask"
          :completed-at="completedAt"
          :destination-code="destinationCode"
          :elapsed-time="elapsedTime"
          :phase="phase"
          :started-at="startedAt"
          :task="selectedTask"
          @end-work="endWork"
          @start-work="startWork"
        />
        <WorkListPanel
          v-else
          v-model:active-tab="activeTab"
          :tasks="WORK_ITEMS"
          @select-task="selectTask"
        />
        <WorkListMap
          :departure-code="selectedTask?.departureCode"
          :destination-code="WORK_TEST_DESTINATION_CODE"
          :execution-phase="phase"
        />
      </main>
    </div>
  </div>
</template>
