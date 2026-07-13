<script setup lang="ts">
interface Props {
  employeeName: string
  vehicleNumber: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  logout: []
}>()
</script>

<template>
  <header
    class="relative flex h-15 flex-shrink-0 items-center justify-between bg-hw-orange-main px-8 text-hw-white-main max-md:px-4"
  >
    <div class="flex min-w-0 items-center gap-3 text-s2 font-bold">
      <button
        type="button"
        class="inline-flex h-8 items-center gap-1.5 rounded-sm bg-hw-white-main/20 px-2.5 transition-colors hover:bg-hw-white-main/30"
        @click="emit('logout')"
      >
        <i class="ti ti-logout text-base" aria-hidden="true" />
        <span class="max-sm:hidden">로그아웃</span>
      </button>

      <span class="inline-flex items-center gap-1 whitespace-nowrap">
        <i class="ti ti-truck text-xl text-hw-blue-light" aria-hidden="true" />
        T/P
      </span>

      <select
        :value="props.vehicleNumber"
        class="h-8 rounded-sm border border-hw-gray-dark bg-hw-white-main px-2 text-s2 font-bold text-hw-gray-dark outline-none"
        aria-label="T/P 선택"
      >
        <option :value="props.vehicleNumber">
          ㆍ {{ props.vehicleNumber }}
        </option>
      </select>

      <strong class="whitespace-nowrap max-lg:hidden">
        {{ props.employeeName }}님
      </strong>
    </div>

    <h1
      class="pointer-events-none absolute left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 text-h5 font-bold"
    >
      작업목록
    </h1>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="inline-flex h-8 items-center gap-1.5 rounded-sm bg-hw-white-main px-3 text-s2 font-bold text-hw-red-main shadow-xs"
      >
        <i class="ti ti-phone-call text-lg" aria-hidden="true" />
        <span class="max-sm:hidden">긴급호출</span>
      </button>

      <button
        type="button"
        class="inline-flex size-8 items-center justify-center text-xl"
        aria-label="알림"
      >
        <i class="ti ti-bell" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>
