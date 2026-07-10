<script setup lang="ts">
import { APP_NAV_ITEMS } from '@/shared/constants/nav'

interface Props {
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), { collapsed: false })

defineEmits<{ toggle: [] }>()
</script>

<template>
  <aside
    class="flex flex-col flex-shrink-0 h-full bg-hw-white-main border-r border-hw-white-dark transition-[width] duration-[160ms] ease-smooth"
    :class="collapsed ? 'w-[72px]' : 'w-[240px]'"
  >
    <div
      class="flex items-center gap-2.5 h-[56px] border-b border-hw-white-dark"
      :class="collapsed ? 'justify-center px-3' : 'px-4'"
    >
      <span
        v-show="!collapsed"
        class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-hw-orange-main to-hw-green-main text-white text-lg"
        aria-hidden="true"
      >
        <i class="ti ti-world" />
      </span>
      <span
        class="flex-1 min-w-0 font-bold text-base leading-[1.2] tracking-[-0.4px] text-hw-gray-darker whitespace-nowrap overflow-hidden"
        :class="{ hidden: collapsed }"
        >한화오션에코텍</span
      >
      <button
        type="button"
        class="inline-flex items-center justify-center flex-shrink-0 w-7 h-7 border-0 rounded-sm bg-transparent text-hw-gray-dark text-lg cursor-pointer transition-[background] duration-[160ms] hover:bg-hw-white-light hover:text-hw-orange-main"
        :title="collapsed ? '메뉴 펼치기' : '메뉴 접기'"
        @click="$emit('toggle')"
      >
        <i
          class="ti"
          :class="
            collapsed
              ? 'ti-layout-sidebar-left-expand'
              : 'ti-layout-sidebar-left-collapse'
          "
        />
      </button>
    </div>

    <nav class="flex flex-col gap-0.5 p-3 overflow-y-auto">
      <template v-for="item in APP_NAV_ITEMS" :key="item.label">
        <RouterLink
          v-if="item.to && !item.disabled"
          :to="item.to"
          class="flex items-center gap-3 rounded-md font-medium text-[15px] leading-none tracking-[-0.3px] text-hw-gray-dark no-underline whitespace-nowrap cursor-pointer transition-[background,color] duration-[160ms] ease-smooth hover:bg-hw-white-light hover:text-hw-gray-darker"
          :class="collapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'"
          active-class="!bg-hw-white-dark !text-hw-orange-main !font-semibold hover:!bg-hw-red-lighter hover:!text-hw-orange-main"
          :exact-active-class="
            item.end
              ? '!bg-hw-white-dark !text-hw-orange-main !font-semibold hover:!bg-hw-red-lighter hover:!text-hw-orange-main'
              : ''
          "
        >
          <i
            class="flex-shrink-0 w-[22px] text-xl text-center"
            :class="item.icon"
          />
          <span
            class="min-w-0 overflow-hidden"
            :class="{ hidden: collapsed }"
            >{{ item.label }}</span
          >
        </RouterLink>
        <span
          v-else
          class="flex items-center gap-3 rounded-md font-medium text-[15px] leading-none tracking-[-0.3px] text-hw-gray-light no-underline whitespace-nowrap cursor-default"
          :class="collapsed ? 'justify-center py-3 px-0' : 'py-3 px-3.5'"
          :title="`${item.label} (준비 중)`"
        >
          <i
            class="flex-shrink-0 w-[22px] text-xl text-center"
            :class="item.icon"
          />
          <span
            class="min-w-0 overflow-hidden"
            :class="{ hidden: collapsed }"
            >{{ item.label }}</span
          >
        </span>
      </template>
    </nav>
  </aside>
</template>
