<script setup lang="ts">
import { LOGIN_CONTACT, LOGIN_FOOTER } from '@/features/public/constants/login'
</script>

<template>
  <footer class="flex flex-col gap-7">
    <div class="flex flex-col gap-2.5 border-t border-hw-white-darker pt-7">
      <p class="m-0 text-[13px] font-normal leading-[1.5] text-hw-gray-main">
        {{ LOGIN_CONTACT.guide }}
      </p>
      <p
        class="m-0 flex items-center gap-1.5 text-sm font-normal leading-[1.4] text-hw-gray-dark"
      >
        <i
          class="ti ti-world text-base text-hw-orange-main"
          aria-hidden="true"
        />
        <strong class="font-bold text-hw-gray-darker">{{
          LOGIN_CONTACT.org
        }}</strong>
        <span>{{ LOGIN_CONTACT.team }}</span>
      </p>
      <p class="m-0 flex flex-wrap gap-x-6 gap-y-2">
        <span
          class="inline-flex items-center gap-1.5 text-sm font-medium leading-[1.4] text-hw-gray-dark"
        >
          <i
            class="ti ti-phone text-base text-hw-orange-main"
            aria-hidden="true"
          />
          {{ LOGIN_CONTACT.phone }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 text-sm font-medium leading-[1.4] text-hw-gray-dark"
        >
          <i
            class="ti ti-mail text-base text-hw-orange-main"
            aria-hidden="true"
          />
          {{ LOGIN_CONTACT.email }}
        </span>
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <p class="m-0 text-xs font-normal leading-[1.5] text-hw-gray-main">
        {{ LOGIN_FOOTER.address }}
      </p>
      <p class="m-0 text-xs font-normal leading-[1.5] text-hw-gray-main">
        {{ LOGIN_FOOTER.contact }}
      </p>
      <p class="m-0 text-xs font-normal leading-[1.5] text-hw-gray-main">
        {{ LOGIN_FOOTER.copyright }}
      </p>
    </div>
  </footer>
</template>
