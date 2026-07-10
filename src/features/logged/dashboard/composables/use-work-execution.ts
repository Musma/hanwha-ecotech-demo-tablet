import { computed, onUnmounted, shallowRef } from 'vue'

import type { WorkExecutionPhase } from '@/features/logged/dashboard/types/work-list'

const TIMER_TICK_MS = 250

function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(date)
}

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export function useWorkExecution() {
  const phase = shallowRef<WorkExecutionPhase>('waiting')
  const elapsedSeconds = shallowRef(0)
  const startedAt = shallowRef('')
  const completedAt = shallowRef('')
  const destinationCode = shallowRef('')

  let startedAtMilliseconds: number | null = null
  let timerId: ReturnType<typeof setInterval> | null = null

  const elapsedTime = computed(() => formatElapsedTime(elapsedSeconds.value))

  function stopTimer() {
    if (timerId === null) return
    clearInterval(timerId)
    timerId = null
  }

  function updateElapsedTime() {
    if (startedAtMilliseconds === null) return
    elapsedSeconds.value = Math.floor(
      (Date.now() - startedAtMilliseconds) / 1000,
    )
  }

  function startWork() {
    if (phase.value !== 'waiting') return

    const now = new Date()
    startedAtMilliseconds = now.getTime()
    startedAt.value = formatClockTime(now)
    completedAt.value = ''
    destinationCode.value = ''
    elapsedSeconds.value = 0
    phase.value = 'inProgress'

    stopTimer()
    timerId = setInterval(updateElapsedTime, TIMER_TICK_MS)
  }

  function completeWork(arrivalCode: string) {
    if (phase.value !== 'inProgress') return

    updateElapsedTime()
    stopTimer()
    destinationCode.value = arrivalCode
    completedAt.value = formatClockTime(new Date())
    phase.value = 'completed'
  }

  function resetWork() {
    stopTimer()
    startedAtMilliseconds = null
    phase.value = 'waiting'
    elapsedSeconds.value = 0
    startedAt.value = ''
    completedAt.value = ''
    destinationCode.value = ''
  }

  onUnmounted(stopTimer)

  return {
    completedAt,
    completeWork,
    destinationCode,
    elapsedTime,
    phase,
    resetWork,
    startedAt,
    startWork,
  }
}
