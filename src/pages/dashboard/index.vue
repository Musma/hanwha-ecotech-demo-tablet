<script setup lang="ts">
import { useRoute } from 'vue-router'

import TabletDemoView from '@/features/logged/dashboard/components/tablet-demo-view.vue'
import type { TabletScreen } from '@/features/logged/dashboard/types/tablet'

const route = useRoute()
const initialScreen: TabletScreen =
  route.query.screen === 'work-list' ? 'work-list' : 'locked'
</script>

<template>
  <TabletDemoView :initial-screen="initialScreen" />
</template>
