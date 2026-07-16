<script setup lang="ts">
import { useRouter } from 'vue-router'

import { requestTabletStartScreen } from '@/features/logged/dashboard/utils/tablet-start-screen'
import LoginView from '@/features/public/components/login-view.vue'

const router = useRouter()

function handleLoginSuccess() {
  requestTabletStartScreen('work-list')
  void router.push({
    name: 'dashboard',
  })
}
</script>

<template>
  <LoginView @success="handleLoginSuccess" />
</template>
