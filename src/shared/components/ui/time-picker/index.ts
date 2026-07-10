export { default as TimePicker } from './TimePicker.vue'

/**
 * 시간 선택 TimePicker (Figma 04.Time —
 * Default/빈 5369-3754, Normal/값 5369-3810,
 * 시 선택 팝업 5369-3866, 분 선택 팝업 5369-3922).
 *
 * 입력 필드를 클릭하면 시계 팝오버가 열린다(시 모드). 다이얼 위에서 클릭하거나
 * 포인터를 누른 채 드래그하면 시계바늘이 부드럽게 돌며 값이 실시간 반영된다.
 * 시를 골라도 분 모드로 자동 전환하지 않는다 — 상단 MM 박스를 눌러 직접 분
 * 모드로 넘어간다. 라벨(Time)은 이 컴포넌트에 포함하지 않는다 — 외부에서
 * FieldLabel / FormField 로 조립한다(DatePicker·text-input·search-select 와 동일
 * 사고). 컴포넌트는 필드(트리거) + 팝업만 담당한다.
 *
 * 구조 (reka-ui 프리미티브 + SVG):
 * - PopoverRoot / PopoverTrigger / PopoverPortal / PopoverContent : 팝오버
 *   (DatePicker 와 동일 패턴, 팝업은 필드 아래에 정렬).
 * - 아날로그 시계는 reka 프리미티브가 없어 SVG(viewBox 0 0 100 100)로 직접
 *   렌더한다(해상도 독립, aspect-square). 좌표·각도·포인터→값 변환은 ./clock.ts.
 *   시계바늘은 회전 transform(`rotate`) + `transition-transform` 으로 그려,
 *   클릭/드래그 시 부드럽게 돈다(드래그 중에는 transition 을 끄고 포인터를
 *   실시간 추적). 포인터 이벤트(pointerdown/move/up)로 각도를 step 으로 변환.
 * - AM/PM 토글은 일반 button 2개 + data-[active] 상태.
 *
 * v-model 동작 (문자열 ↔ {hour24, minute}):
 * - 외부 인터페이스는 'HH:mm' 24시간제 zero-pad 문자열('07:00','19:35').
 *   빈 값이면 undefined.
 * - UI 는 12시간제 + AM/PM 토글(디자인 그대로). 내부에서 24h ↔ 12h+AM/PM 으로
 *   변환한다(./time.ts). 분은 1분 단위(0~59) — 다이얼 숫자 라벨만 5분 격자로
 *   표시하고, 드래그/클릭으로 1분 단위까지 선택할 수 있다(라벨 밖 분은 바늘
 *   끝에 작은 흰 점으로 표시).
 *
 * 인터랙션:
 * - 필드 클릭 → 팝업 열림(시 모드). 다이얼 클릭/드래그 → 바늘 회전 + 값 반영.
 *   시를 골라도 분 모드로 자동 전환하지 않는다(사용자가 직접 MM 박스 클릭).
 * - 상단 HH 박스 클릭 → 시 모드, MM 박스 클릭 → 분 모드(수동 전환).
 * - AM/PM 토글 클릭 → 오전/오후 전환(같은 12h 값 유지, hour24 만 ±12).
 *
 * Field metrics (Figma M, DatePicker M 과 동일):
 * - 트리거 높이 32px(`h-8`), radius 4px(`rounded-[4px]`)
 * - 표시 텍스트 B3(14)→`text-b3`, placeholder '00:00'
 * - 우측 알람시계 아이콘 `size-4`, `text-hw-gray-dark`
 *
 * Popup metrics (Figma 시 선택 팝업 5369-3879, 컨테이너 200×252):
 * - 패딩 좌우 8px(`px-2`) / 상하 16px(`py-4`), radius 4px, gray/light 보더
 * - 디지털 HH/MM 박스 60×60, radius 6px(`rounded-sm`), 박스 사이 gap 6px(`gap-1.5`)
 * - AM/PM 토글 박스 radius 4px(`rounded-[4px]`) + gray/light 1px 보더, 활성칸 상단만 4px
 * - 디스플레이 → 시계 간격 16px(`mt-4`)
 * - 다이얼 144×144(clock 영역 가득): viewBox 기준 dial r=50, label r=38.9,
 *   선택 마커 r=5.6(16px 지름), 중심점 r=2.8(8px 지름) — `./clock.ts`
 *
 * Size 'm' | 's' (DatePicker 와 동일 분기 패턴, `sizeClasses` computed):
 * - 색·radius·보더·동작 로직·clock.ts 좌표는 사이즈 무관(M/S 동일). 사이즈가
 *   바꾸는 것은 필드 높이/텍스트/아이콘, 팝업 패딩, 디지털·AM/PM 타이포,
 *   콜론 점 크기, 디스플레이→시계 간격뿐이다. 다이얼 SVG 는 같은 viewBox(0~100)
 *   를 `aspect-square w-full` 로 렌더하므로 숫자/마커 비율도 M/S 동일.
 *
 * S metrics (Figma S 노드 5369-3978: 필드 5369-3979/5369-3985 148×46,
 * 팝업 5369-3991 148×212):
 * - 트리거 높이 24px(`h-6`), 표시 텍스트 C1(12)→`text-c1`, 아이콘 14px(`size-3.5`)
 * - 팝업 패딩 상하좌우 8px(`px-2 py-2`)
 * - 디지털 HH/MM 박스 40×40, 타이포 H3(24) SemiBold→`text-h3 font-semibold`(600)
 * - 콜론 점: M `size-2`/`gap-2.5` → S `size-1.5`/`gap-1.5`(40px 박스 스케일,
 *   ~5.3px/~6.7px 를 최근접 스케일 토큰으로 표현)
 * - AM/PM 타이포 C2(10)→`text-c2`
 * - 디스플레이 → 시계 간격 6px(`mt-1.5`)
 * - 다이얼 숫자: M `text-[6.5px]` → S `text-[5.4px]`(마커 대비 비율 유지,
 *   마커/중심점은 viewBox 정규화라 M 과 동일)
 *
 * Colour 매핑 (Figma hex → hw-* tokens, hex 직접 사용 금지):
 * - 트리거 보더 default #cccccc Gray/light → `border-hw-gray-light` (EXACT)
 * - 트리거 보더 open/focus #f37321 Orange/main → `border-hw-orange-main`
 *   (EXACT). open 은 runtime 상태(`data-[state=open]`)이지 variant 가 아니다.
 * - surface #FFFFFF Bg/Paper → `bg-hw-white-main` (EXACT)
 * - HH/MM 활성 박스·AM/PM 활성칸 배경 rgba(251,181,132,0.14) orange-lighter 14%
 *   → `bg-hw-orange-lighter/15` (SNAP: 0.14 → /15)
 * - HH/MM 비활성 박스 배경 #F9FAFB → `bg-hw-white-light` (EXACT)
 * - 디지털 숫자·콜론·시계 숫자 기본(미선택) #242E40 Gray/800 → `text-hw-gray-darker`
 *   / `fill-hw-gray-darker` (SNAP: #242e40 → gray-darker)
 * - 디지털 HH:MM 은 text-h2(32) + `font-bold`(700, Figma 가 H2 에 bold 커스텀)
 * - 콜론은 타이포 ':' 가 아니라 세로 점 2개(`size-2 rounded-full bg-hw-gray-darker`)
 * - 활성 디지털 숫자·활성 AM/PM·선택 마커 #f37321 → `text-hw-orange-main` /
 *   `fill-hw-orange-main` (EXACT)
 * - 비활성 AM/PM·placeholder #cccccc → `text-hw-gray-light` (EXACT)
 * - 다이얼 배경 #F9FAFB → `fill-hw-white-light` (EXACT)
 * - 선택 마커 위 숫자·바늘 대비용 흰색 #FFFFFF → `text-hw-white-main` /
 *   `stroke-hw-white-main` (EXACT)
 * - 시계 바늘·중심점 #f37321 → `stroke-hw-orange-main` / `fill-hw-orange-main`
 *
 * Typography (전역 HanwhaGothic, 사이즈 토큰만 매핑):
 * - 디지털 HH:MM H2(32)→`text-h2 font-bold`(700)
 * - AM/PM S3(12)→`text-s3`
 * - 시계 숫자: SVG viewBox(0~100) 단위라 화면 px 가 아니다. 선택 마커(지름
 *   11.2단위)에 두 자리 숫자가 여유 있게 들어가도록 맞춘 값 — M `text-[6.5px]`
 *   / S `text-[5.4px]`(off-scale, sizeClasses.dialText 로 분기)
 * - 필드 입력 B3(14)→`text-b3`
 *
 * Width: 고정 px 금지. 트리거는 `w-full`(부모가 폭 제어), 팝오버는 트리거
 * 너비(`--reka-popper-anchor-width`)에 맞춘다. 시계는 `aspect-square`.
 *
 * Size: Figma 에서 M(5369-3866 등)·S(5369-3978) 두 사이즈 제공.
 */
export type TimePickerSize = 'm' | 's'
