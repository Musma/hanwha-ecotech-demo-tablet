<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from '@/shared/components/app-sidebar.vue'
import AppTopbar from '@/shared/components/app-topbar.vue'
import { Toaster as Sonner } from '@/shared/components/ui/sonner'

const route = useRoute()
const sidebarCollapsed = ref(false)
const sidebarVisible = computed(() => route.meta.hideSidebar !== true)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div
    class="flex w-full h-screen overflow-hidden bg-hw-white-lighter text-hw-gray-darker"
  >
    <AppSidebar
      v-if="sidebarVisible"
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />

    <div class="flex flex-col flex-1 min-w-0">
      <AppTopbar />
      <main class="flex-1 min-h-0 overflow-auto bg-hw-white-lighter">
        <slot />
      </main>

      <Sonner />
    </div>
  </div>
</template>
