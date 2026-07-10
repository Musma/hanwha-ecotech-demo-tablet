<script setup lang="ts">
import { useRouter } from 'vue-router'

import LoginView from '@/features/public/components/login-view.vue'

const router = useRouter()

function handleLoginSuccess() {
  void router.push({
    name: 'dashboard',
    query: { screen: 'work-list' },
  })
}
</script>

<template>
  <LoginView @success="handleLoginSuccess" />
</template>
