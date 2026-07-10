<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import DefaultLayout from '@/layouts/default-layout.vue'

const route = useRoute()
const isBlankLayout = computed(() => route.meta.layout === 'blank')
</script>

<template>
  <RouterView v-if="isBlankLayout" />
  <DefaultLayout v-else>
    <RouterView />
  </DefaultLayout>
</template>
