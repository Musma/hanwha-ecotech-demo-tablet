<script setup lang="ts">
import { useRouter } from 'vue-router'

import LoginView from '@/features/public/components/login-view.vue'

const router = useRouter()

function handleLoginSuccess() {
  void router.push('/dashboard')
}
</script>

<template>
  <LoginView @success="handleLoginSuccess" />
</template>
