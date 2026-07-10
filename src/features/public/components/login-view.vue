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
      class="flex w-[460px] max-w-full flex-shrink-0 flex-col bg-hw-white-main max-[880px]:w-full"
      :class="props.embedded ? 'overflow-hidden' : 'overflow-y-auto'"
    >
      <div
        class="flex flex-1 flex-col"
        :class="props.embedded ? 'gap-4 px-7 py-5' : 'gap-9 px-12 py-[56px]'"
      >
        <div class="flex items-center gap-3">
          <img
            :src="hanwhaMarkUrl"
            alt="Hanwha"
            class="flex-shrink-0 object-contain"
            :class="props.embedded ? 'h-8 w-9' : 'h-10 w-11'"
          />
          <span
            class="font-bold leading-[1.2] tracking-[-0.5px] text-hw-gray-darker"
            :class="props.embedded ? 'text-h5' : 'text-[22px]'"
            >{{ LOGIN_BRAND_NAME }}</span
          >
        </div>

        <LoginForm
          :embedded="props.embedded"
          :class="props.embedded ? 'mt-auto' : 'mt-3'"
        />

        <LoginInfoFooter :embedded="props.embedded" class="mt-auto" />
      </div>
    </div>

    <div
      class="min-w-0 flex-1 bg-hw-gray-darker bg-[url('/login.webp')] bg-cover bg-center bg-no-repeat max-[880px]:hidden"
      role="img"
      aria-label="한화오션에코텍 조선소 전경"
    />
  </div>
</template>
