<script setup lang="ts">
import { computed, ref } from 'vue'

import { cn } from '@/shared/helpers/utils'

import {
  CENTER,
  DIAL_RADIUS,
  LABEL_RADIUS,
  MARKER_RADIUS,
  PIN_RADIUS,
  pointOnDial,
  valueFromPoint,
} from './clock'
import {
  formatTime,
  HOUR_LABELS,
  type Meridiem,
  MINUTE_STEPS,
  parseTime,
  to12Hour,
  to24Hour,
  toMeridiem,
} from './time'

import type { TimePickerSize } from '.'

// 시계 본문(디지털 디스플레이 + AM/PM + 아날로그 다이얼)만 담당하는 내부 패널.
// 팝오버/필드는 없다. TimePicker(필드+팝업)와 DateTimePicker(Time 탭)가 공유.
// 시/분 모드는 mount 시 'hour' 로 초기화된다 — reka Popover/Tabs 콘텐츠는 숨길
// 때 unmount 되므로, 다시 열 때마다 시 모드로 시작한다(별도 reset 불필요).
interface Props {
  size?: TimePickerSize
}

const props = withDefaults(defineProps<Props>(), {
  size: 'm',
})

// v-model 은 'HH:mm' 24시간제 문자열로 노출한다(빈 값 undefined).
const model = defineModel<string>()

// 시/분 모드.
const mode = ref<'hour' | 'minute'>('hour')

// 포인터가 눌린 상태인지 / 실제로 끌고 있는지. dragging 중에는 transition 을
// 꺼서 바늘이 손가락을 1:1 로 따라가고, 단순 클릭은 transition 으로 회전한다.
const pointerActive = ref(false)
const dragging = ref(false)
const svgRef = ref<SVGSVGElement>()

// 현재 값(파싱). 없으면 디스플레이는 0시 0분으로 보여주되 model 은 비운 채 둔다.
const parts = computed(() => parseTime(model.value))

const hour24 = computed(() => parts.value?.hour24 ?? 0)
const minute = computed(() => parts.value?.minute ?? 0)
const hour12 = computed(() => to12Hour(hour24.value))
const meridiem = computed<Meridiem>(() => toMeridiem(hour24.value))

// 디지털 디스플레이용 2자리 문자열.
const hourLabel = computed(() => hour12.value.toString().padStart(2, '0'))
const minuteLabel = computed(() => minute.value.toString().padStart(2, '0'))

// 내부 {hour24, minute} 를 'HH:mm' 로 직렬화해 model 에 반영.
function commit(nextHour24: number, nextMinute: number) {
  model.value = formatTime({ hour24: nextHour24, minute: nextMinute })
}

// 포인터(viewBox 좌표)를 현재 모드의 값으로 변환해 반영한다.
// 시: 12등분 → 12h 값을 현재 AM/PM 으로 24h 변환. 분: 60등분 → 1분 단위.
// 시를 골라도 분 모드로 자동 전환하지 않는다(사용자가 직접 MM 박스를 눌러야 함).
function updateFromPointer(event: PointerEvent) {
  const svg = svgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  if (mode.value === 'hour') {
    const step = valueFromPoint(x, y, 12)
    const hour = step === 0 ? 12 : step
    commit(to24Hour(hour, meridiem.value), minute.value)
  } else {
    commit(hour24.value, valueFromPoint(x, y, 60))
  }
}

function onPointerDown(event: PointerEvent) {
  pointerActive.value = true
  svgRef.value?.setPointerCapture(event.pointerId)
  // 클릭(눌렀다 떼기)은 transition 으로 회전. 이동 시점에 dragging 으로 전환.
  updateFromPointer(event)
}

function onPointerMove(event: PointerEvent) {
  if (!pointerActive.value) return
  dragging.value = true
  updateFromPointer(event)
}

function onPointerUp() {
  pointerActive.value = false
  dragging.value = false
}

// AM/PM 토글: 12h 값 유지하고 hour24 만 ±12.
function setMeridiem(next: Meridiem) {
  if (next === meridiem.value) return
  commit(to24Hour(hour12.value, next), minute.value)
}

// 다이얼에 그릴 숫자 라벨(시 1~12, 분 5분 격자). 좌표는 12등분 고정.
const dialItems = computed(() => {
  const labels = mode.value === 'hour' ? HOUR_LABELS : MINUTE_STEPS
  const selectedValue = mode.value === 'hour' ? hour12.value : minute.value
  return labels.map((label, index) => ({
    label,
    text:
      mode.value === 'hour' ? String(label) : label.toString().padStart(2, '0'),
    labelPoint: pointOnDial(index, 12, LABEL_RADIUS),
    selected: label === selectedValue,
  }))
})

// 시계바늘 회전 각도(도). 12시 방향 0, 시계방향. 시 30도/칸, 분 6도/칸(1분 단위).
const handAngle = computed(() =>
  mode.value === 'hour' ? (hour12.value % 12) * 30 : minute.value * 6,
)

// 마커 끝이 숫자 라벨 위에 정확히 놓이는지(분 1분 단위라 라벨 밖일 수 있음).
const markerOnLabel = computed(() =>
  mode.value === 'hour' ? true : minute.value % 5 === 0,
)

// 사이즈별 디지털 디스플레이·다이얼 타이포(Figma M=5369-3879, S=5369-3978).
const sizeClasses = computed(() => {
  if (props.size === 's') {
    return {
      digital: 'text-h3 font-semibold', // HH/MM 박스 H3(24) SemiBold(600)
      colonDot: 'size-1.5', // 6px
      colonGap: 'gap-1.5', // 6px
      meridiem: 'text-c2', // AM/PM C2(10)
      clockMargin: 'mt-1.5', // 디스플레이→시계 6px
      dialText: 'text-[5.4px]', // 다이얼 숫자: 마커 대비 비율(S, ~10px)
    }
  }
  return {
    digital: 'text-h2 font-bold', // HH/MM 박스 H2(32) bold
    colonDot: 'size-2', // 8px
    colonGap: 'gap-2.5', // 10px
    meridiem: 'text-s3', // AM/PM S3(12)
    clockMargin: 'mt-4', // 디스플레이→시계 16px
    dialText: 'text-[6.5px]', // 다이얼 숫자: 마커(지름 11.2단위) 대비(M, ~12px)
  }
})
</script>

<template>
  <div>
    <!-- 상단 디지털 디스플레이: HH : MM + AM/PM 세로 토글 -->
    <div class="flex items-stretch gap-1.5">
      <!-- HH 박스 -->
      <button
        type="button"
        :data-active="mode === 'hour' ? '' : undefined"
        :class="
          cn(
            'flex flex-1 items-center justify-center rounded-sm bg-hw-white-light text-hw-gray-darker outline-none data-[active]:bg-hw-orange-lighter/15 data-[active]:text-hw-orange-main',
            sizeClasses.digital,
          )
        "
        @click="mode = 'hour'"
      >
        {{ hourLabel }}
      </button>

      <!-- 콜론: 디지털 시계 풍의 점 두 개(세로) -->
      <div
        :class="
          cn(
            'flex flex-col items-center justify-center px-1',
            sizeClasses.colonGap,
          )
        "
      >
        <span
          :class="cn('rounded-full bg-hw-gray-darker', sizeClasses.colonDot)"
        />
        <span
          :class="cn('rounded-full bg-hw-gray-darker', sizeClasses.colonDot)"
        />
      </div>

      <!-- MM 박스 -->
      <button
        type="button"
        :data-active="mode === 'minute' ? '' : undefined"
        :class="
          cn(
            'flex flex-1 items-center justify-center rounded-sm bg-hw-white-light text-hw-gray-darker outline-none data-[active]:bg-hw-orange-lighter/15 data-[active]:text-hw-orange-main',
            sizeClasses.digital,
          )
        "
        @click="mode = 'minute'"
      >
        {{ minuteLabel }}
      </button>

      <!-- AM/PM 세로 2칸 토글 -->
      <div
        class="flex flex-col overflow-hidden rounded-[4px] border border-solid border-hw-gray-light"
      >
        <button
          type="button"
          :data-active="meridiem === 'AM' ? '' : undefined"
          :class="
            cn(
              'flex flex-1 items-center justify-center px-2 text-hw-gray-light outline-none data-[active]:bg-hw-orange-lighter/15 data-[active]:text-hw-orange-main',
              sizeClasses.meridiem,
            )
          "
          @click="setMeridiem('AM')"
        >
          AM
        </button>
        <button
          type="button"
          :data-active="meridiem === 'PM' ? '' : undefined"
          :class="
            cn(
              'flex flex-1 items-center justify-center px-2 text-hw-gray-light outline-none data-[active]:bg-hw-orange-lighter/15 data-[active]:text-hw-orange-main',
              sizeClasses.meridiem,
            )
          "
          @click="setMeridiem('PM')"
        >
          PM
        </button>
      </div>
    </div>

    <!-- 아날로그 시계(SVG, viewBox 0~100). 포인터 드래그로 바늘을 돌린다. -->
    <div :class="cn('aspect-square w-full', sizeClasses.clockMargin)">
      <svg
        ref="svgRef"
        viewBox="0 0 100 100"
        role="presentation"
        class="size-full cursor-pointer touch-none select-none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <!-- 다이얼 배경 원 -->
        <circle
          :cx="CENTER"
          :cy="CENTER"
          :r="DIAL_RADIUS"
          class="fill-hw-white-light"
        />

        <!-- 시계바늘: 회전 transform + transition 으로 클릭/드래그 시 돈다 -->
        <g
          :style="{
            transform: `rotate(${handAngle}deg)`,
            transformBox: 'view-box',
            transformOrigin: '50% 50%',
          }"
          :class="dragging ? '' : 'transition-transform duration-200 ease-out'"
        >
          <line
            :x1="CENTER"
            :y1="CENTER"
            :x2="CENTER"
            :y2="CENTER - LABEL_RADIUS"
            stroke-width="1.2"
            stroke-linecap="round"
            class="stroke-hw-orange-main"
          />
          <circle
            :cx="CENTER"
            :cy="CENTER - LABEL_RADIUS"
            :r="MARKER_RADIUS"
            class="fill-hw-orange-main"
          />
          <!-- 라벨 밖(5분 격자가 아닌) 분일 때 끝점 표시용 작은 흰 점 -->
          <circle
            v-if="!markerOnLabel"
            :cx="CENTER"
            :cy="CENTER - LABEL_RADIUS"
            r="1.4"
            class="fill-hw-white-main"
          />
        </g>

        <!-- 숫자 라벨(마커 위에 표시): 선택 항목은 흰색 -->
        <text
          v-for="item in dialItems"
          :key="item.label"
          :x="item.labelPoint.x"
          :y="item.labelPoint.y"
          text-anchor="middle"
          dominant-baseline="central"
          class="pointer-events-none"
          :class="
            cn(
              sizeClasses.dialText,
              item.selected ? 'fill-hw-white-main' : 'fill-hw-gray-darker',
            )
          "
        >
          {{ item.text }}
        </text>

        <!-- 중심 점 -->
        <circle
          :cx="CENTER"
          :cy="CENTER"
          :r="PIN_RADIUS"
          class="fill-hw-orange-main"
        />
      </svg>
    </div>
  </div>
</template>
