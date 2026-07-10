import { computed, onMounted, onUnmounted, shallowRef } from 'vue'

import {
  formatTabletDate,
  formatTabletTime,
  getMillisecondsUntilNextMinute,
} from '@/features/logged/dashboard/utils/tablet-date-time'

export function useTabletClock() {
  const currentDateTime = shallowRef(new Date())
  let updateTimerId: number | undefined

  const currentDate = computed(() => formatTabletDate(currentDateTime.value))
  const currentTime = computed(() => formatTabletTime(currentDateTime.value))

  function scheduleNextMinuteUpdate(date: Date) {
    updateTimerId = window.setTimeout(() => {
      const nextDateTime = new Date()
      currentDateTime.value = nextDateTime
      scheduleNextMinuteUpdate(nextDateTime)
    }, getMillisecondsUntilNextMinute(date))
  }

  onMounted(() => scheduleNextMinuteUpdate(currentDateTime.value))

  onUnmounted(() => {
    if (updateTimerId !== undefined) window.clearTimeout(updateTimerId)
  })

  return {
    currentDate,
    currentTime,
  }
}
