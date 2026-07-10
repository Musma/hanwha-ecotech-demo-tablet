<script setup lang="ts">
import hanwhaMarkUrl from '@/assets/images/hanwha-mark.svg'
import LoginForm from '@/features/public/components/login-form.vue'
import LoginInfoFooter from '@/features/public/components/login-info-footer.vue'
import { LOGIN_BRAND_NAME } from '@/features/public/constants/login'

interface Props {
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
})
</script>

<template>
  <div
    class="flex w-full overflow-hidden bg-hw-white-main"
    :class="props.embedded ? 'h-full' : 'h-screen'"
  >
    <div
      class="flex w-[460px] max-w-full flex-shrink-0 flex-col overflow-y-auto bg-hw-white-main max-[880px]:w-full"
    >
      <div class="flex flex-1 flex-col gap-9 px-12 py-[56px]">
        <div class="flex items-center gap-3">
          <img
            :src="hanwhaMarkUrl"
            alt="Hanwha"
            class="h-10 w-11 flex-shrink-0 object-contain"
          />
          <span
            class="text-[22px] font-bold leading-[1.2] tracking-[-0.5px] text-hw-gray-darker"
            >{{ LOGIN_BRAND_NAME }}</span
          >
        </div>

        <LoginForm class="mt-3" />

        <LoginInfoFooter class="mt-auto" />
      </div>
    </div>

    <div
      class="min-w-0 flex-1 bg-hw-gray-darker bg-[url('/login.webp')] bg-cover bg-center bg-no-repeat max-[880px]:hidden"
      role="img"
      aria-label="한화오션에코텍 조선소 전경"
    />
  </div>
</template>
