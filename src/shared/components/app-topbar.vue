<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { Button } from '@/shared/components/ui/button'
import { APP_NAV_ITEMS } from '@/shared/constants/nav'

const route = useRoute()

const currentLabel = computed(() => {
  const match = APP_NAV_ITEMS.find((item) => item.to && item.to === route.path)
  return match?.label ?? '대시보드'
})
</script>

<template>
  <header
    class="flex items-center justify-between flex-shrink-0 h-[56px] px-6 bg-hw-white-main border-b border-hw-white-dark"
  >
    <div class="flex items-center gap-2">
      <i class="ti ti-home text-xl text-hw-gray-darker" />
      <i class="ti ti-chevron-right text-base text-hw-gray-light" />
      <span
        class="font-semibold text-base leading-none tracking-[-0.3px] text-hw-gray-darker"
        >{{ currentLabel }}</span
      >
    </div>

    <div class="flex items-center gap-3.5">
      <span
        class="font-normal text-sm leading-none tracking-[-0.2px] text-hw-gray-dark"
      >
        <b class="font-semibold text-hw-gray-darker">홍길동</b>님 로그인
        되었습니다.
      </span>
      <Button
        type="button"
        variant="brand-ghost"
        size="brand-icon"
        class="relative"
        title="로그아웃"
      >
        <i class="ti ti-logout" />
      </Button>
      <Button
        type="button"
        variant="brand-ghost"
        size="brand-icon"
        class="relative"
        title="알림"
      >
        <i class="ti ti-bell" />
        <span
          class="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-md bg-hw-red-main text-white font-numeric font-semibold text-[10px] leading-[15px] text-center"
          >1</span
        >
      </Button>
    </div>
  </header>
</template>
