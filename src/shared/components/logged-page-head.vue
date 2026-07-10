<script setup lang="ts">
// 로그인 이후 업무 화면에서 재사용하는 제목/액션 헤더다.

interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="mb-3.5 flex items-end justify-between">
    <div>
      <h1
        class="m-0 text-[22px] font-bold leading-[1.2] tracking-[-0.4px] text-hw-gray-darker"
      >
        {{ title }}
      </h1>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
