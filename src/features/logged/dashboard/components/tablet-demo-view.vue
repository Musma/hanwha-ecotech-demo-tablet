<script setup lang="ts">
import { shallowRef } from 'vue'

import TabletUnlockSlider from '@/features/logged/dashboard/components/tablet-unlock-slider.vue'
import { useTabletClock } from '@/features/logged/dashboard/composables/use-tablet-clock'
import LoginView from '@/features/public/components/login-view.vue'

const unlocked = shallowRef(false)
const { currentDate, currentTime } = useTabletClock()

function unlockTablet() {
  unlocked.value = true
}
</script>

<template>
  <section
    class="flex min-h-full items-center justify-center bg-hw-white-lighter p-4 sm:p-6"
  >
    <div
      class="relative aspect-[10/16] w-full max-w-sm rounded-3xl border-[10px] border-hw-gray-darker bg-hw-gray-darker shadow-2xl sm:aspect-[16/10] sm:max-w-6xl"
    >
      <span
        class="absolute left-1/2 top-2 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-hw-gray-main sm:w-24"
        aria-hidden="true"
      />

      <div
        class="absolute inset-3 overflow-hidden rounded-2xl border border-hw-gray-dark bg-hw-white-lighter text-hw-text-primary sm:inset-6"
      >
        <div
          class="flex h-11 items-center justify-between bg-hw-gray-darker px-3 text-c1 font-semibold text-hw-white-main sm:px-4"
        >
          <span class="min-w-0 truncate">
            <i class="ti ti-device-tablet mr-1" aria-hidden="true" />
            에코텍 물류 · 현장 태블릿 PC
          </span>
          <span class="flex-shrink-0">
            <i class="ti ti-wifi mr-1" aria-hidden="true" />
            {{ currentTime }}
          </span>
        </div>

        <div class="relative h-[calc(100%-44px)] overflow-hidden">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-smooth motion-reduce:transition-none"
            enter-from-class="opacity-0 scale-[0.99]"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-smooth motion-reduce:transition-none"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-[0.99]"
          >
            <div
              v-if="!unlocked"
              key="locked"
              class="relative flex h-full flex-col items-center overflow-hidden bg-[url('/login.webp')] bg-cover bg-center p-6 text-center text-hw-white-main"
            >
              <div
                class="absolute inset-0 bg-hw-gray-darker/55"
                aria-hidden="true"
              />

              <div class="relative mt-[16%] sm:mt-[10%]">
                <p class="text-h3 font-light sm:text-h1">{{ currentTime }}</p>
                <p class="mt-1 text-c1 text-hw-white-dark">
                  {{ currentDate }}
                </p>
              </div>

              <TabletUnlockSlider
                class="relative mt-auto mb-4 sm:mb-8"
                @unlock="unlockTablet"
              />
            </div>

            <div v-else key="login" class="h-full bg-hw-white-main">
              <LoginView embedded />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>
