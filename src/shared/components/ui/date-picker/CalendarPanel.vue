<script setup lang="ts">
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date'
import {
  ChevronLeftIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronRightIcon,
} from '@lucide/vue'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from 'reka-ui'
import { computed, ref } from 'vue'

import { cn } from '@/shared/helpers/utils'

import type { DatePickerSize } from '.'
import type { DateValue } from 'reka-ui'

// 달력 본문(헤더 네비 + 그리드)만 담당하는 내부 패널. 팝오버/필드는 없다.
// DatePicker(필드+팝업)와 DateTimePicker(Date 탭)가 공유한다.
interface Props {
  size?: DatePickerSize
}

const props = withDefaults(defineProps<Props>(), {
  size: 'm',
})

// v-model 은 'YYYY-MM-DD' 문자열. 내부에서 CalendarDate 로 변환해 연결한다.
const model = defineModel<string>()

function toDateValue(value: string | undefined): CalendarDate | undefined {
  if (!value) return undefined
  try {
    return parseDate(value)
  } catch {
    return undefined
  }
}

const calendarValue = computed<DateValue | undefined>({
  get: () => toDateValue(model.value),
  set: (value) => {
    model.value = value ? value.toString() : undefined
  },
})

// 처음 보여줄 기준 월. 선택값이 있으면 그 달, 없으면 오늘.
const placeholderDate = ref<DateValue>(
  toDateValue(model.value) ?? today(getLocalTimeZone()),
)

// 년 이동(« »): CalendarRoot 가 제공하지 않으므로 placeholder 를 직접 조정.
function shiftYear(amount: number) {
  placeholderDate.value = placeholderDate.value.add({ years: amount })
}

// 사이즈별 달력 타이포·셀 높이(Figma M=5357-2804, S=5357-3477).
const sizeClasses = computed(() => {
  if (props.size === 's') {
    return {
      heading: 'text-c2', // 헤더 제목 10
      headCell: 'text-c2', // 요일 헤더 10
      cell: 'h-5 text-c2', // 날짜 셀 20px, C2(10)
    }
  }
  return {
    heading: 'text-s3', // 헤더 제목 12
    headCell: 'text-s3', // 요일 헤더 12
    cell: 'h-6 text-c1', // 날짜 셀 24px, C1(12)
  }
})
</script>

<template>
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    v-model="calendarValue"
    v-model:placeholder="placeholderDate"
    :week-starts-on="1"
    weekday-format="short"
    fixed-weeks
    class="flex flex-col gap-1"
  >
    <CalendarHeader class="flex items-center justify-between">
      <!-- 이전 년(«) + 이전 월(‹) -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          aria-label="이전 년"
          class="flex items-center justify-center text-hw-gray-light outline-none"
          @click="shiftYear(-1)"
        >
          <ChevronsLeftIcon class="size-3.5" />
        </button>
        <CalendarPrev
          aria-label="이전 월"
          class="flex items-center justify-center text-hw-gray-light outline-none"
        >
          <ChevronLeftIcon class="size-3.5" />
        </CalendarPrev>
      </div>

      <CalendarHeading :class="cn('text-hw-gray-dark', sizeClasses.heading)" />

      <!-- 다음 월(›) + 다음 년(») -->
      <div class="flex items-center gap-3">
        <CalendarNext
          aria-label="다음 월"
          class="flex items-center justify-center text-hw-gray-light outline-none"
        >
          <ChevronRightIcon class="size-3.5" />
        </CalendarNext>
        <button
          type="button"
          aria-label="다음 년"
          class="flex items-center justify-center text-hw-gray-light outline-none"
          @click="shiftYear(1)"
        >
          <ChevronsRightIcon class="size-3.5" />
        </button>
      </div>
    </CalendarHeader>

    <!-- 헤더 아래 구분선(팝업 가로 패딩 8px 가정, 가장자리까지 bleed) -->
    <div class="-mx-2 border-t border-hw-gray-light" />

    <div class="flex flex-col gap-1 pt-1">
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse select-none"
      >
        <CalendarGridHead>
          <CalendarGridRow class="flex w-full">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              :class="
                cn(
                  'flex flex-1 items-center justify-center py-1 text-hw-gray-dark',
                  sizeClasses.headCell,
                )
              "
            >
              {{ day.slice(0, 2) }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>

        <CalendarGridBody class="flex flex-col gap-1">
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`week-${index}`"
            class="flex w-full gap-1"
          >
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="flex flex-1 items-center justify-center"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="
                  cn(
                    // 셀: 중앙정렬, 이번 달 gray-dark, 다른 달(outside-view)
                    // gray-light. 높이/텍스트는 사이즈별.
                    'flex w-full items-center justify-center rounded-[4px] text-hw-gray-dark outline-none',
                    sizeClasses.cell,
                    'data-[outside-view]:text-hw-gray-light',
                    // hover/키보드 focus: 배경 white-lighter, 텍스트 orange-main.
                    'hover:bg-hw-white-lighter hover:text-hw-orange-main data-[focused]:bg-hw-white-lighter data-[focused]:text-hw-orange-main',
                    // 선택일: orange-main + white. hover 뒤에 둬서 겹칠 때 우선.
                    'data-[selected]:bg-hw-orange-main data-[selected]:text-hw-white-main',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )
                "
              >
                {{ weekDate.day }}
              </CalendarCellTrigger>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
