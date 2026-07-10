<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from '@lucide/vue'
import { ref } from 'vue'

import LoggedPageHead from '@/shared/components/logged-page-head.vue'
import LoggedPageShell from '@/shared/components/logged-page-shell.vue'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { DateTimePicker } from '@/shared/components/ui/date-time-picker'
import { IconButton } from '@/shared/components/ui/icon-button'
import { Pagination } from '@/shared/components/ui/pagination'
import { PrimaryButton } from '@/shared/components/ui/primary-button'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { SearchSelect } from '@/shared/components/ui/search-select'
import { Select } from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  FieldLabel,
  FormField,
  HelperText,
  TextInput,
} from '@/shared/components/ui/text-input'
import { TimePicker } from '@/shared/components/ui/time-picker'
import { useClientPagination } from '@/shared/composables/use-client-pagination'

// 지금까지 만든 디자인시스템 컴포넌트를 육안으로 확인하는 미리보기 화면이다.
const checkL = ref(false)
const checkM = ref(true)
const checkS = ref(false)

const radioL = ref('a')
const radioM = ref('a')
const radioS = ref('a')

const switchL = ref(true)
const switchM = ref(false)
const switchS = ref(true)

const inputDefault = ref('')
const inputError = ref('잘못된 값')
const inputSuccess = ref('올바른 값')

const datePickerValue = ref('')
const datePickerValueS = ref('')

const timePickerValue = ref('')
const timePickerValueS = ref('')

const dateTimeValue = ref('')
const dateTimeValueS = ref('')

const searchSelectValue = ref('')
const selectValue = ref('')
const searchSelectOptions = [
  { label: '서울특별시', value: 'seoul' },
  { label: '부산광역시', value: 'busan' },
  { label: '대구광역시', value: 'daegu' },
  { label: '인천광역시', value: 'incheon' },
  { label: '광주광역시', value: 'gwangju' },
]

const breadcrumbItems = [
  { label: 'Menu Name', href: '#' },
  { label: 'Menu Name' },
]

const tableRows = [
  { id: 'A-001', name: '강판 코일', team: '1공정', status: '입고' },
  { id: 'A-002', name: '냉연 강판', team: '2공정', status: '가공중' },
  { id: 'A-003', name: '도금 강판', team: '3공정', status: '출고' },
]

const paginationPage = ref(2)
const paginationPageMany = ref(6)
const paginationItemsPerPage = ref(10)
const paginationItemsPerPagePage = ref(3)

// Table + Pagination 결합(client-side): useClientPagination 으로 현재 페이지
// 슬라이스만 Table 에 렌더. 23개 더미라 5개씩 → 5페이지.
const allTableRows = Array.from({ length: 23 }, (_, i) => {
  const stages = ['1공정', '2공정', '3공정']
  const states = ['입고', '가공중', '출고']
  return {
    id: `A-${String(i + 1).padStart(3, '0')}`,
    name: `강판 ${i + 1}호`,
    team: stages[i % 3],
    status: states[i % 3],
  }
})
const {
  page: clientPage,
  itemsPerPage: clientItemsPerPage,
  total: clientTotal,
  pageItems: clientPageItems,
} = useClientPagination(allTableRows, { itemsPerPage: 5 })
</script>

<template>
  <LoggedPageShell>
    <LoggedPageHead title="컴포넌트 미리보기" />

    <div class="flex flex-col gap-6 pb-10">
      <!-- PrimaryButton -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">PrimaryButton</h2>
        <div class="flex flex-col gap-5">
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">variant (size l)</p>
            <div class="flex flex-wrap items-center gap-3">
              <div class="w-32">
                <PrimaryButton variant="fill">Fill</PrimaryButton>
              </div>
              <div class="w-32">
                <PrimaryButton variant="outline">Outline</PrimaryButton>
              </div>
              <div class="w-32">
                <PrimaryButton variant="warning">Warning</PrimaryButton>
              </div>
            </div>
          </div>

          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">size (fill)</p>
            <div class="flex flex-wrap items-end gap-3">
              <div class="w-32">
                <PrimaryButton size="xl">XL</PrimaryButton>
              </div>
              <div class="w-32"><PrimaryButton size="l">L</PrimaryButton></div>
              <div class="w-32"><PrimaryButton size="m">M</PrimaryButton></div>
              <div class="w-32"><PrimaryButton size="s">S</PrimaryButton></div>
              <div class="w-32">
                <PrimaryButton size="xs">XS</PrimaryButton>
              </div>
            </div>
          </div>

          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">disabled</p>
            <div class="flex flex-wrap items-center gap-3">
              <div class="w-32">
                <PrimaryButton variant="fill" disabled>Fill</PrimaryButton>
              </div>
              <div class="w-32">
                <PrimaryButton variant="outline" disabled
                  >Outline</PrimaryButton
                >
              </div>
              <div class="w-32">
                <PrimaryButton variant="warning" disabled
                  >Warning</PrimaryButton
                >
              </div>
            </div>
          </div>

          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">icon + text</p>
            <div class="flex flex-wrap items-center gap-3">
              <div class="w-40">
                <PrimaryButton><SearchIcon /> 검색</PrimaryButton>
              </div>
              <div class="w-40">
                <PrimaryButton variant="outline"
                  ><CheckIcon /> 확인</PrimaryButton
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- IconButton -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">IconButton</h2>
        <div class="flex flex-col gap-5">
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">fill · size l/m/s</p>
            <div class="flex items-center gap-3">
              <IconButton size="l" aria-label="검색"><SearchIcon /></IconButton>
              <IconButton size="m" aria-label="검색"><SearchIcon /></IconButton>
              <IconButton size="s" aria-label="검색"><SearchIcon /></IconButton>
            </div>
          </div>
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              outline · size l/m/s
            </p>
            <div class="flex items-center gap-3">
              <IconButton variant="outline" size="l" aria-label="닫기">
                <XIcon />
              </IconButton>
              <IconButton variant="outline" size="m" aria-label="닫기">
                <XIcon />
              </IconButton>
              <IconButton variant="outline" size="s" aria-label="닫기">
                <XIcon />
              </IconButton>
            </div>
          </div>
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">disabled</p>
            <div class="flex items-center gap-3">
              <IconButton disabled aria-label="더보기"
                ><ChevronDownIcon
              /></IconButton>
              <IconButton variant="outline" disabled aria-label="더보기">
                <ChevronDownIcon />
              </IconButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Checkbox -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Checkbox</h2>
        <div class="flex flex-col gap-5">
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              size l/m/s (클릭해보세요)
            </p>
            <div class="flex items-center gap-6">
              <Checkbox v-model="checkL" size="l" />
              <Checkbox v-model="checkM" size="m" />
              <Checkbox v-model="checkS" size="s" />
            </div>
          </div>
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              disabled (unchecked / checked)
            </p>
            <div class="flex items-center gap-6">
              <Checkbox disabled />
              <Checkbox disabled :model-value="true" />
            </div>
          </div>
        </div>
      </section>

      <!-- RadioGroup -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">RadioGroup</h2>
        <div class="flex flex-col gap-5">
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              size l/m/s (클릭해보세요)
            </p>
            <div class="flex items-start gap-10">
              <RadioGroup v-model="radioL" class="gap-2">
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rl-a" value="a" size="l" />
                  <span class="text-c1 text-hw-gray-dark">옵션 A</span>
                </div>
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rl-b" value="b" size="l" />
                  <span class="text-c1 text-hw-gray-dark">옵션 B</span>
                </div>
              </RadioGroup>

              <RadioGroup v-model="radioM" class="gap-2">
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rm-a" value="a" size="m" />
                  <span class="text-c1 text-hw-gray-dark">옵션 A</span>
                </div>
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rm-b" value="b" size="m" />
                  <span class="text-c1 text-hw-gray-dark">옵션 B</span>
                </div>
              </RadioGroup>

              <RadioGroup v-model="radioS" class="gap-2">
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rs-a" value="a" size="s" />
                  <span class="text-c1 text-hw-gray-dark">옵션 A</span>
                </div>
                <div class="flex items-center gap-2">
                  <RadioGroupItem id="rs-b" value="b" size="s" />
                  <span class="text-c1 text-hw-gray-dark">옵션 B</span>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              disabled (checked / unchecked)
            </p>
            <RadioGroup :model-value="'a'" disabled class="gap-2">
              <div class="flex items-center gap-2">
                <RadioGroupItem id="rd-a" value="a" />
                <span class="text-c1 text-hw-gray-main">선택됨</span>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem id="rd-b" value="b" />
                <span class="text-c1 text-hw-gray-main">해제</span>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      <!-- Switch -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Switch</h2>
        <div class="flex flex-col gap-5">
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              size l/m/s (클릭해보세요)
            </p>
            <div class="flex items-center gap-6">
              <Switch v-model="switchL" size="l" />
              <Switch v-model="switchM" size="m" />
              <Switch v-model="switchS" size="s" />
            </div>
          </div>
          <div>
            <p class="m-0 mb-2 text-c1 text-hw-gray-main">
              disabled (off / on)
            </p>
            <div class="flex items-center gap-6">
              <Switch disabled />
              <Switch disabled :model-value="true" />
            </div>
          </div>
        </div>
      </section>

      <!-- TextInput (FormField 컨텍스트로 조립: status 1회, 라벨/aria 자동) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          TextInput (FormField 조립)
        </h2>

        <p class="m-0 mb-2 text-c1 text-hw-gray-main">size l / m / s</p>
        <div class="mb-6 grid max-w-[640px] grid-cols-3 gap-4">
          <FormField size="l">
            <FieldLabel>L</FieldLabel>
            <TextInput v-model="inputDefault" placeholder="L 44px" />
            <HelperText>height 44</HelperText>
          </FormField>
          <FormField size="m">
            <FieldLabel>M</FieldLabel>
            <TextInput v-model="inputDefault" placeholder="M 32px" />
            <HelperText>height 32</HelperText>
          </FormField>
          <FormField size="s">
            <FieldLabel>S</FieldLabel>
            <TextInput v-model="inputDefault" placeholder="S 24px" />
            <HelperText>height 24</HelperText>
          </FormField>
        </div>

        <p class="m-0 mb-2 text-c1 text-hw-gray-main">status (size l)</p>
        <div class="grid max-w-[640px] grid-cols-2 gap-5">
          <FormField>
            <FieldLabel>기본</FieldLabel>
            <TextInput v-model="inputDefault" placeholder="입력하세요" />
            <HelperText>도움말 텍스트</HelperText>
          </FormField>

          <FormField>
            <FieldLabel>포커스 시 오렌지 보더</FieldLabel>
            <TextInput v-model="inputDefault" placeholder="클릭해보세요" />
            <HelperText>focus 시 보더가 orange-main</HelperText>
          </FormField>

          <FormField status="error">
            <FieldLabel>에러</FieldLabel>
            <TextInput v-model="inputError" />
            <HelperText>Form 검사 실패 상태임</HelperText>
          </FormField>

          <FormField status="success">
            <FieldLabel>성공</FieldLabel>
            <TextInput v-model="inputSuccess" />
            <HelperText>Form 검사 성공 상태</HelperText>
          </FormField>

          <FormField disabled>
            <FieldLabel>비활성</FieldLabel>
            <TextInput model-value="수정 불가" />
            <HelperText>disabled 상태</HelperText>
          </FormField>
        </div>
      </section>

      <!-- DatePicker (입력 필드 클릭 → 달력 팝오버) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          DatePicker (size m / s)
        </h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          입력 필드를 클릭하면 달력이 열리고, 날짜를 고르면 v-model 반영
        </p>
        <div class="grid max-w-[640px] grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <FieldLabel>Date (m)</FieldLabel>
            <DatePicker v-model="datePickerValue" />
            <HelperText>선택값: {{ datePickerValue || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성 (m)</FieldLabel>
            <DatePicker model-value="2021-12-14" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel size="s">Date (s)</FieldLabel>
            <DatePicker v-model="datePickerValueS" size="s" />
            <HelperText>선택값: {{ datePickerValueS || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel size="s">비활성 (s)</FieldLabel>
            <DatePicker model-value="2021-12-14" size="s" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
        </div>
      </section>

      <!-- TimePicker (입력 필드 클릭 → 시계 팝오버) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          TimePicker (size m / s)
        </h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          필드 클릭 → 시 선택(자동 분 전환) → 분 선택(5분 단위) · v-model 은
          'HH:mm' 24시간제
        </p>
        <div class="grid max-w-[640px] grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <FieldLabel>Time (m)</FieldLabel>
            <TimePicker v-model="timePickerValue" />
            <HelperText>선택값: {{ timePickerValue || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>Time (s)</FieldLabel>
            <TimePicker v-model="timePickerValueS" size="s" />
            <HelperText>선택값: {{ timePickerValueS || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성 (m)</FieldLabel>
            <TimePicker model-value="19:35" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성 (s)</FieldLabel>
            <TimePicker model-value="19:35" size="s" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
        </div>
      </section>

      <!-- DateTimePicker (Date/Time 탭으로 달력+시계 결합) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          DateTimePicker (size m / s)
        </h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          필드 클릭 → Date/Time 탭 전환 · v-model 은 'YYYY-MM-DD HH:mm' 결합
          문자열
        </p>
        <div class="grid max-w-[640px] grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <FieldLabel>Date &amp; Time (m)</FieldLabel>
            <DateTimePicker v-model="dateTimeValue" />
            <HelperText>선택값: {{ dateTimeValue || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>Date &amp; Time (s)</FieldLabel>
            <DateTimePicker v-model="dateTimeValueS" size="s" />
            <HelperText>선택값: {{ dateTimeValueS || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성 (m)</FieldLabel>
            <DateTimePicker model-value="2021-12-14 19:35" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성 (s)</FieldLabel>
            <DateTimePicker model-value="2021-12-14 19:35" size="s" disabled />
            <HelperText>disabled 상태</HelperText>
          </div>
        </div>
      </section>

      <!-- Select (Dropdown · 기본 비검색 / searchable 옵션) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Select (Dropdown)</h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          기본은 비검색(클릭→선택) · <code>searchable</code> prop 으로 검색 활성
        </p>
        <div class="grid max-w-[640px] grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <FieldLabel>지역 (size m)</FieldLabel>
            <Select
              v-model="selectValue"
              :options="searchSelectOptions"
              placeholder="지역을 선택하세요"
            />
            <HelperText>선택값: {{ selectValue || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel size="s">지역 (size s)</FieldLabel>
            <Select
              v-model="selectValue"
              :options="searchSelectOptions"
              size="s"
              placeholder="size s"
            />
            <HelperText>작은 사이즈(필드 24·폰트 12)</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>검색 활성 (searchable)</FieldLabel>
            <Select
              v-model="selectValue"
              :options="searchSelectOptions"
              searchable
              placeholder="타이핑해 필터"
            />
            <HelperText>searchable=true → 콤보박스</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성</FieldLabel>
            <Select
              :options="searchSelectOptions"
              placeholder="disabled"
              disabled
            />
            <HelperText>disabled 상태</HelperText>
          </div>
        </div>
      </section>

      <!-- SearchSelect (입력형 검색 Dropdown / combobox) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          SearchSelect (입력형 검색 Dropdown)
        </h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          타이핑하면 리스트가 필터됩니다 · 항목을 고르면 v-model 반영
        </p>
        <div class="grid max-w-[640px] grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <FieldLabel>지역 (size m)</FieldLabel>
            <SearchSelect
              v-model="searchSelectValue"
              :options="searchSelectOptions"
              placeholder="지역을 검색하세요"
            />
            <HelperText>선택값: {{ searchSelectValue || '없음' }}</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel size="s">지역 (size s)</FieldLabel>
            <SearchSelect
              v-model="searchSelectValue"
              :options="searchSelectOptions"
              size="s"
              placeholder="size s"
            />
            <HelperText>작은 사이즈(필드 24·폰트 12)</HelperText>
          </div>
          <div class="flex flex-col gap-1">
            <FieldLabel>비활성</FieldLabel>
            <SearchSelect
              :options="searchSelectOptions"
              placeholder="disabled"
              disabled
            />
            <HelperText>disabled 상태</HelperText>
          </div>
        </div>
      </section>

      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Breadcrumb</h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          items 배열로 조립 · 마지막 항목이 현재 페이지(gray-darker)
        </p>
        <div class="flex flex-col gap-4">
          <Breadcrumb :items="breadcrumbItems" />
          <Breadcrumb :items="breadcrumbItems" :home="false" />
        </div>
      </section>

      <!-- Table (서브컴포넌트 조립: thead/tbody/tr/th/td) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Table</h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          서브컴포넌트로 헤더+행을 자유 조립 · 헤더는 가운데 정렬, 바디 셀은
          왼쪽 정렬
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in tableRows" :key="row.id">
              <TableCell>{{ row.id }}</TableCell>
              <TableCell>{{ row.name }}</TableCell>
              <TableCell>{{ row.team }}</TableCell>
              <TableCell>{{ row.status }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <!-- Pagination (reka PaginationRoot 기반 · 첫/이전/번호/다음/끝) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">Pagination</h2>
        <p class="m-0 mb-2 text-c1 text-hw-gray-main">
          v-model:page 로 현재 페이지 바인딩 · 현재 페이지는 orange 원형 ·
          첫/끝(« ») 버튼은 showEdges 로 제어 · 페이지가 많으면 …(생략) 표시 ·
          v-model:items-per-page 로 Rows per page 통합(변경 시 1페이지로 리셋)
        </p>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Pagination
              v-model:page="paginationItemsPerPagePage"
              v-model:items-per-page="paginationItemsPerPage"
              :total="200"
            />
            <span class="text-c1 text-hw-gray-main">
              현재 {{ paginationItemsPerPagePage }} 페이지 · 페이지당
              {{ paginationItemsPerPage }} 행
            </span>
          </div>
          <div class="flex items-center gap-4">
            <Pagination
              v-model:page="paginationPage"
              :total="50"
              :show-rows-per-page="false"
            />
            <span class="text-c1 text-hw-gray-main">
              현재 {{ paginationPage }} 페이지 (Rows per page 숨김)
            </span>
          </div>
          <div class="flex items-center gap-4">
            <Pagination
              v-model:page="paginationPageMany"
              :total="200"
              :items-per-page="10"
              :show-rows-per-page="false"
            />
            <span class="text-c1 text-hw-gray-main">
              현재 {{ paginationPageMany }} 페이지 (Rows per page 숨김)
            </span>
          </div>
        </div>
      </section>

      <!-- Table + Pagination 결합 (client-side, useClientPagination) -->
      <section
        class="rounded-md border border-hw-white-dark bg-hw-white-main p-6"
      >
        <h2 class="m-0 mb-4 text-h6 text-hw-gray-darker">
          Table + Pagination (client-side)
        </h2>
        <p class="m-0 mb-3 text-c1 text-hw-gray-main">
          useClientPagination 으로 현재 페이지 슬라이스만 Table 에 렌더 · 전체
          {{ clientTotal }}건, 페이지당 {{ clientItemsPerPage }}개
        </p>
        <div class="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>코드</TableHead>
                <TableHead>품명</TableHead>
                <TableHead>공정</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in clientPageItems" :key="row.id">
                <TableCell>{{ row.id }}</TableCell>
                <TableCell>{{ row.name }}</TableCell>
                <TableCell>{{ row.team }}</TableCell>
                <TableCell>{{ row.status }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Pagination
            v-model:page="clientPage"
            v-model:items-per-page="clientItemsPerPage"
            :total="clientTotal"
          />
        </div>
      </section>
    </div>
  </LoggedPageShell>
</template>
