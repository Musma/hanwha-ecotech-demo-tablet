<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'

import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from '@lucide/vue'
import { Toaster as Sonner } from 'vue-sonner'

import { cn } from '@/shared/helpers/utils'

// hw 브랜드 토스트: 기존 다크 pill 형태(하단 중앙, 흰 텍스트)를 그대로 유지한다.
const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'bottom-center',
  duration: 2400,
})
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': '#1d1f21',
      '--normal-text': '#ffffff',
      '--normal-border': '#1d1f21',
      '--border-radius': '4px',
    }"
    :toast-options="{
      classes: {
        toast:
          'rounded-[4px] shadow-[0_8px_24px_rgba(29,31,33,0.2)]  text-[13px] font-medium tracking-[-0.2px]',
      },
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
