<script setup lang="ts">
import TabletDemoView from '@/features/logged/dashboard/components/tablet-demo-view.vue'
import { consumeTabletStartScreen } from '@/features/logged/dashboard/utils/tablet-start-screen'

const initialScreen = consumeTabletStartScreen()
</script>

<template>
  <TabletDemoView :initial-screen="initialScreen" />
</template>
