<script setup lang="ts">
import { LOGIN_CONTACT, LOGIN_FOOTER } from '@/features/public/constants/login'

interface Props {
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
})
</script>

<template>
  <footer class="flex flex-col" :class="props.embedded ? 'gap-3' : 'gap-7'">
    <div
      class="flex flex-col border-t border-hw-white-darker"
      :class="props.embedded ? 'gap-1 pt-3' : 'gap-2.5 pt-7'"
    >
      <p
        class="m-0 font-normal text-hw-gray-main"
        :class="props.embedded ? 'text-c1' : 'text-[13px] leading-[1.5]'"
      >
        {{ LOGIN_CONTACT.guide }}
      </p>
      <p
        class="m-0 flex items-center gap-1.5 font-normal text-hw-gray-dark"
        :class="props.embedded ? 'text-c1' : 'text-sm leading-[1.4]'"
      >
        <i
          class="ti ti-world text-hw-orange-main"
          :class="props.embedded ? 'text-sm' : 'text-base'"
          aria-hidden="true"
        />
        <strong class="font-bold text-hw-gray-darker">{{
          LOGIN_CONTACT.org
        }}</strong>
        <span>{{ LOGIN_CONTACT.team }}</span>
      </p>
      <p class="m-0 flex flex-wrap gap-x-6 gap-y-2">
        <span
          class="inline-flex items-center gap-1.5 font-medium text-hw-gray-dark"
          :class="props.embedded ? 'text-c1' : 'text-sm leading-[1.4]'"
        >
          <i
            class="ti ti-phone text-hw-orange-main"
            :class="props.embedded ? 'text-sm' : 'text-base'"
            aria-hidden="true"
          />
          {{ LOGIN_CONTACT.phone }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 font-medium text-hw-gray-dark"
          :class="props.embedded ? 'text-c1' : 'text-sm leading-[1.4]'"
        >
          <i
            class="ti ti-mail text-hw-orange-main"
            :class="props.embedded ? 'text-sm' : 'text-base'"
            aria-hidden="true"
          />
          {{ LOGIN_CONTACT.email }}
        </span>
      </p>
    </div>

    <div class="flex flex-col" :class="props.embedded ? 'gap-0.5' : 'gap-1'">
      <p
        class="m-0 font-normal text-hw-gray-main"
        :class="props.embedded ? 'text-c2' : 'text-xs leading-[1.5]'"
      >
        {{ LOGIN_FOOTER.address }}
      </p>
      <p
        class="m-0 font-normal text-hw-gray-main"
        :class="props.embedded ? 'text-c2' : 'text-xs leading-[1.5]'"
      >
        {{ LOGIN_FOOTER.contact }}
      </p>
      <p
        class="m-0 font-normal text-hw-gray-main"
        :class="props.embedded ? 'text-c2' : 'text-xs leading-[1.5]'"
      >
        {{ LOGIN_FOOTER.copyright }}
      </p>
    </div>
  </footer>
</template>
