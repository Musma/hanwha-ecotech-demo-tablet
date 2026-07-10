<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useJibunStore } from '@/features/logged/jibun/composables/use-jibun-store'
import JibunMasterTable from '@/features/logged/jibun-master/components/jibun-master-table.vue'
import LoggedPageShell from '@/shared/components/logged-page-shell.vue'

// 지번 마스터 화면이다.
// 테이블에서 선택한 지번은 store에 지도 포커스 요청을 남긴 뒤 상세 화면으로 이동한다.

const store = useJibunStore()
const router = useRouter()
const { jibuns } = storeToRefs(store)

function selectJibunAndGoToDetail(id: number) {
  store.focusJibunOnMap(id)
  router.push('/jibun')
}
</script>

<template>
  <LoggedPageShell>
    <JibunMasterTable
      :jibuns="jibuns"
      @select="selectJibunAndGoToDetail"
      @import="store.importJibuns"
    />
  </LoggedPageShell>
</template>
