import { computed, shallowRef } from 'vue'

/** 로그인 폼의 입력 상태와 제출 흐름을 담당하는 composable. */
export function useLoginForm() {
  const username = shallowRef('')
  const password = shallowRef('')
  const passwordVisible = shallowRef(false)
  const submitting = shallowRef(false)

  const canSubmit = computed(
    () => username.value.trim().length > 0 && password.value.length > 0,
  )

  function togglePasswordVisible() {
    passwordVisible.value = !passwordVisible.value
  }

  async function submit() {
    if (!canSubmit.value || submitting.value) return false

    submitting.value = true
    try {
      // TODO: 실제 인증 API 연동

      console.info('login submit', { username: username.value })
      return true
    } finally {
      submitting.value = false
    }
  }

  return {
    username,
    password,
    passwordVisible,
    submitting,
    canSubmit,
    togglePasswordVisible,
    submit,
  }
}
