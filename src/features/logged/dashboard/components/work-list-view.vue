<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import WorkListHeader from '@/features/logged/dashboard/components/work-list-header.vue'
import WorkListMap from '@/features/logged/dashboard/components/work-list-map.vue'
import WorkListPanel from '@/features/logged/dashboard/components/work-list-panel.vue'
import { WORK_ITEMS } from '@/features/logged/dashboard/constants/work-list'
import type { WorkListTab } from '@/features/logged/dashboard/types/work-list'

const router = useRouter()
const activeTab = shallowRef<WorkListTab>('pending')

function logout() {
  void router.push('/login')
}
</script>

<template>
  <div class="h-screen overflow-hidden bg-hw-gray-dark p-4">
    <div
      class="flex h-full min-h-0 flex-col overflow-hidden bg-hw-white-main shadow-2xl"
    >
      <WorkListHeader
        employee-name="홍길동"
        vehicle-number="175바 1255"
        @logout="logout"
      />

      <main
        class="grid min-h-0 flex-1 grid-cols-1 gap-6 bg-hw-white-main p-6 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
      >
        <WorkListPanel v-model:active-tab="activeTab" :tasks="WORK_ITEMS" />
        <WorkListMap />
      </main>
    </div>
  </div>
</template>
