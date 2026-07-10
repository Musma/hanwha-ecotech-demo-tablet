<script setup lang="ts">
import { useLoginForm } from '@/features/public/composables/use-login-form'
import {
  LOGIN_HEADING,
  LOGIN_SUBHEADING,
} from '@/features/public/constants/login'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const {
  username,
  password,
  passwordVisible,
  submitting,
  togglePasswordVisible,
  submit,
} = useLoginForm()
</script>

<template>
  <section class="flex flex-col gap-7">
    <header class="flex flex-col gap-2.5">
      <h1
        class="m-0 text-[28px] font-bold leading-[1.2] tracking-[-0.6px] text-hw-gray-darker"
      >
        {{ LOGIN_HEADING }}
      </h1>
      <p class="m-0 text-[15px] font-normal leading-[1.4] text-hw-gray-main">
        {{ LOGIN_SUBHEADING }}
      </p>
    </header>

    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <label class="flex flex-col gap-2">
        <span class="text-sm font-semibold leading-none text-hw-gray-dark"
          >아이디</span
        >
        <span
          class="flex h-[50px] items-center rounded-md border border-hw-gray-lighter bg-hw-white-main px-3.5 transition-[border-color,box-shadow] duration-[160ms] ease-smooth focus-within:border-hw-orange-main focus-within:shadow-[0_0_0_3px_rgba(243,115,33,0.14)]"
        >
          <i
            class="ti ti-user mr-2.5 flex-shrink-0 text-xl text-hw-gray-main"
            aria-hidden="true"
          />
          <Input
            v-model="username"
            type="text"
            class="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-[15px] focus:shadow-none"
            placeholder="아이디 입력"
            autocomplete="username"
          />
        </span>
      </label>

      <label class="flex flex-col gap-2">
        <span class="text-sm font-semibold leading-none text-hw-gray-dark"
          >비밀번호</span
        >
        <span
          class="flex h-[50px] items-center rounded-md border border-hw-gray-lighter bg-hw-white-main px-3.5 transition-[border-color,box-shadow] duration-[160ms] ease-smooth focus-within:border-hw-orange-main focus-within:shadow-[0_0_0_3px_rgba(243,115,33,0.14)]"
        >
          <i
            class="ti ti-lock mr-2.5 flex-shrink-0 text-xl text-hw-gray-main"
            aria-hidden="true"
          />
          <Input
            v-model="password"
            :type="passwordVisible ? 'text' : 'password'"
            class="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-[15px] focus:shadow-none"
            placeholder="비밀번호 입력"
            autocomplete="current-password"
          />
          <Button
            type="button"
            variant="brand-ghost"
            size="brand-icon"
            class="ml-1.5 size-7 flex-shrink-0 rounded-sm text-lg text-hw-gray-main hover:bg-transparent"
            :title="passwordVisible ? '비밀번호 숨기기' : '비밀번호 표시'"
            @click="togglePasswordVisible"
          >
            <i
              class="ti"
              :class="passwordVisible ? 'ti-eye' : 'ti-eye-off'"
              aria-hidden="true"
            />
          </Button>
        </span>
      </label>

      <Button
        type="submit"
        variant="brand"
        size="brand"
        class="mt-1 h-[52px] rounded-md text-base font-bold tracking-[-0.3px]"
        :disabled="submitting"
      >
        로그인
      </Button>
    </form>
  </section>
</template>
