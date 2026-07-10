<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { ChevronRightIcon, HomeIcon } from '@lucide/vue'
import { Primitive } from 'reka-ui'

import { cn } from '@/shared/helpers/utils'

import { breadcrumbItemVariants } from '.'

import type { BreadcrumbItem } from '.'
import type { PrimitiveProps } from 'reka-ui'

interface Props extends /* @vue-ignore */ PrimitiveProps {
  items: BreadcrumbItem[]
  /** 선두 홈 아이콘 노출 여부. Figma 기본값은 노출(true). */
  home?: boolean
  /** 홈 아이콘 링크. 지정하면 홈 아이콘을 `<a>` 로 감싼다. */
  homeHref?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'nav',
  class: undefined,
  home: true,
  homeHref: undefined,
})

function isCurrent(index: number) {
  return index === props.items.length - 1
}
</script>

<template>
  <Primitive
    data-slot="breadcrumb"
    :as="as"
    :as-child="asChild"
    aria-label="Breadcrumb"
    :class="cn('inline-flex items-center', props.class)"
  >
    <ol class="flex items-center" data-slot="breadcrumb-list">
      <li v-if="home" class="flex items-center" data-slot="breadcrumb-home">
        <component
          :is="homeHref ? 'a' : 'span'"
          :href="homeHref"
          class="text-hw-orange-main flex items-center"
        >
          <HomeIcon class="size-6 fill-current" stroke="none" />
          <span class="sr-only">Home</span>
        </component>
      </li>

      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center"
        data-slot="breadcrumb-item"
      >
        <ChevronRightIcon
          v-if="home || index > 0"
          class="text-hw-gray-light size-6 shrink-0"
          :stroke-width="1.5"
          aria-hidden="true"
        />
        <a
          v-if="item.href && !isCurrent(index)"
          :href="item.href"
          :class="cn(breadcrumbItemVariants({ current: false }))"
          data-slot="breadcrumb-link"
        >
          {{ item.label }}
        </a>
        <span
          v-else
          :class="cn(breadcrumbItemVariants({ current: isCurrent(index) }))"
          :aria-current="isCurrent(index) ? 'page' : undefined"
          data-slot="breadcrumb-page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </Primitive>
</template>
