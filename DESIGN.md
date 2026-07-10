# DESIGN.md

이 문서는 이 프로젝트에서 UI를 만들거나 수정할 때 따라야 하는 디자인·구현 기준이다.
색상 토큰의 source of truth는 Figma 디자인 시스템이며, 코드와의 일관성은 자동 하네스로 강제한다.

## Source Of Truth

- 디자인 시스템(색상): Figma file `iortnHn3T1huiIVgy46bt7`, node `5145-17490` ("02. Color")
- 디자인 시스템(타이포그래피): 같은 file, node `5129-13637` ("01. Typography")
- 프로젝트 아키텍처: `ARCHITECTURE.md`
- 폴더 구조: `FOLDER_STRUCTURE.md`
- 토큰 파일: `src/assets/css/theme.css` (`@theme` 블록의 `--color-hw-*`)
- 공용 UI primitive: `src/shared/components/ui/`, `src/shared/components/`

## Design Token Rules

- 색상은 **반드시** `--color-hw-*` 토큰 유틸리티를 쓴다. 컴포넌트 클래스에 `bg-[#hex]` 같은 arbitrary 색상값을 직접 쓰지 않는다(하네스가 차단).
- 새 색이 필요하면 인라인 hex를 반복하지 말고, Figma 팔레트에 추가한 뒤 `theme.css`에 토큰을 정의하고 유틸리티로 참조한다.
- 텍스트 스타일은 Figma 시맨틱 토큰(`text-h1`~`text-c2`)을 우선한다. spacing/radius는 기본 Tailwind 스케일 토큰(`p-2`, `rounded-md` 등)을 쓰고, 토큰과 정확히 같은 값을 arbitrary로 쓰지 않는다(`px-[8px]` 대신 `p-2`). 스케일에 없는 off-scale 값(`px-[14px]` 등)은 허용한다.
- MapLibre GL 등 JS API에 넘기는 raw hex 색은 토큰 대상이 아니다(`shared/constants/map*.ts`, `shared/helpers/map/`, `shared/composables/map/`). 단 가능하면 한 곳의 상수로 모은다.

## Color

토큰 네이밍은 Figma 이름을 그대로 따른다: `--color-hw-{hue}-{scale}` → 유틸리티 `bg-hw-orange-main`, `text-hw-gray-dark`, `border-hw-red-main`. opacity는 Tailwind 수정자(`bg-hw-gray-darker/80`)로 표현한다.

| Hue        | lighter   | light     | main      | dark      | darker    | 용도                                 |
| ---------- | --------- | --------- | --------- | --------- | --------- | ------------------------------------ |
| **orange** | `#fbb584` | `#f89b6c` | `#f37321` | `#ff6506` | `#a64e17` | Primary(브랜드 주색). 주요 액션·강조 |
| **blue**   | `#cce7f5` | `#1fd5da` | `#21a3e6` | `#0a72f2` | `#3322f2` | Secondary. 정보·링크·보조 강조       |
| **gray**   | `#dcdcdc` | `#cccccc` | `#929292` | `#444648` | `#1d1f21` | 텍스트·보더·뉴트럴 표면              |
| **white**  | `#f4f6f9` | `#f9fafb` | `#ffffff` | `#eeeeee` | `#eaeaea` | 배경·표면 단계                       |
| **red**    | `#f5d4cc` | `#f24d22` | `#f22922` | `#e40c01` | `#940e0f` | 위험·삭제·에러                       |
| **green**  | `#ddefe4` | `#5ecb5e` | `#4a9d67` | `#008233` | `#054522` | 성공·정상 상태                       |

단일 토큰: `--color-hw-text-primary` `#262e38`(기본 텍스트), `--color-hw-grey-2` `#8b8b8b`, `--color-hw-btn-hover` `#e4e4e4`.

- 금지: Figma 팔레트에 없는 색을 직접 쓰는 것. shadcn 기본 neutral(`#262626`, `#e7000b`, `#f5f5f5` 등)은 Hanwha gray/red로 흡수했으니 다시 도입하지 않는다.

## Typography

- 폰트: 전역 **HanwhaGothic**(`base.css` `@font-face`, 파일 `src/assets/fonts/hanwha-gothic-font/`). weight: thin 100 / extralight 250 / light 300 / regular 400 / bold 700. 폴백 Pretendard → Noto Sans KR → system. 숫자 강조용 `--font-numeric`.
- **시맨틱 텍스트 토큰**(Figma node 5129-13637 "01. Typography"). 각 토큰이 size + line-height + letter-spacing + weight 를 묶는다. 사용 예: `text-h1`, `text-b2`, `text-c1`.

  | 토큰      | px  | line-height | letter-spacing | weight | 용도       |
  | --------- | --- | ----------- | -------------- | ------ | ---------- |
  | `text-h1` | 40  | 56          | -0.6           | 400    | Heading 1  |
  | `text-h2` | 32  | 48          | -0.6           | 400    | Heading 2  |
  | `text-h3` | 24  | 32          | -0.6           | 400    | Heading 3  |
  | `text-h4` | 20  | 30          | -0.2           | 400    | Heading 4  |
  | `text-h5` | 18  | 24          | -0.2           | 400    | Heading 5  |
  | `text-h6` | 16  | 24          | -0.2           | 400    | Heading 6  |
  | `text-s1` | 20  | 30          | -0.2           | 300    | Subtitle 1 |
  | `text-s2` | 14  | 20          | 0              | 400    | Subtitle 2 |
  | `text-s3` | 12  | 18          | 0              | 400    | Subtitle 3 |
  | `text-b1` | 18  | 24          | -0.2           | 300    | Body 1     |
  | `text-b2` | 16  | 22          | -0.2           | 300    | Body 2     |
  | `text-b3` | 14  | 20          | 0              | 250    | Body 3     |
  | `text-c1` | 12  | 16          | 0              | 300    | Caption 1  |
  | `text-c2` | 10  | 14          | 0              | 300    | Caption 2  |

- UI 텍스트는 위 시맨틱 토큰을 우선 사용한다. 기본 Tailwind numeric 스케일(`text-xs`~`text-9xl`)도 공존하지만, 디자인 시스템 텍스트 스타일은 시맨틱 토큰이 source of truth 다.
- spacing/radius/shadow 는 디자인 시스템에서 별도 토큰화하지 않고 기본 Tailwind 스케일을 그대로 사용한다.

## Spacing

- 기준 단위 `--spacing: 4px`. step: `0.5`=2px, `1`=4px, `1.5`=6px, `2`=8px, `2.5`=10px, `3`=12px, `3.5`=14px, `4`=16px …
- 토큰 step과 동일한 px는 step 유틸리티로(`px-[10px]`→`px-2.5`). 그 외 off-scale는 arbitrary 허용.

## Radius

- 스케일(px): `rounded-xs` 2 / `rounded-sm` 6 / `rounded-md` 8 / `rounded-lg` 10 / `rounded-xl` 14 / `rounded-2xl` 16 / `rounded-3xl` 24 / `rounded-4xl` 32. (`sm`~`xl`은 `--radius: 10px` 기반)

## Shadow And Elevation

- 디자인 시스템에서 별도 토큰화하지 않는다. 기본 Tailwind shadow 유틸리티(`shadow-xs`, `shadow-sm` 등)를 사용한다.

## Icons

- 아이콘 라이브러리: `@lucide/vue`, `@tabler/icons-webfont`.
- 버튼 내 아이콘 크기는 버튼 size variant가 제어한다(`[&_svg:not([class*=size-])]:size-4` 등). 임의 size 지정은 지양.

## Layout

- 앱 셸: `src/layouts/default-layout.vue`(로그인 이후 공통), `src/shared/components/app-sidebar.vue`, `app-topbar.vue`.
- 페이지 래퍼: `src/shared/components/logged-page-shell.vue`, `logged-page-head.vue`.
- empty/loading/error 큰 흐름은 page/feature container에서 배치(`ARCHITECTURE.md` 참고).

## Responsive Behavior

- breakpoints(px): `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536.

## Component Rules

- 공용 primitive는 `src/shared/components/ui/` 의 shadcn-vue 패턴을 따른다: `reka-ui` `Primitive` + `class-variance-authority`(`cva`)로 variant 정의 + `cn`(`@/shared/helpers/utils`)으로 클래스 병합 + `data-slot`/`data-variant`/`data-size` 속성.
- 신규 컴포넌트는 기존 primitive(`button`, `input`, `dialog`, `combobox`, `label`, `textarea`, `card`, `sonner`)를 먼저 재사용한다.
- variant의 색은 hw-\* 토큰만 사용한다. 새 색 도입 금지.
- 배치: 도메인 전용은 `features/[scope]/[domain]/components`, 2개 이상 도메인 재사용 시 `shared/components`로 승격.

## Component Implementation Workflow (Figma → Code)

새 컴포넌트/화면을 Figma에서 구현할 때 다음 순서를 따른다.

1. Figma 노드 URL을 받고 `get_design_context`(또는 `get_screenshot`)로 시각·구조를 확인한다.
2. `get_variable_defs`로 그 노드가 쓰는 색/토큰을 확인하고, `theme.css`의 `--color-hw-*`로 매핑한다. 팔레트에 없는 색이 있으면 Figma·토큰에 추가를 제안한다(임의 hex 금지).
3. 기존 `ui/` primitive를 재사용하거나, 없으면 `cva` + `reka-ui` + `cn` + `data-slot` 패턴으로 새 primitive를 만든다.
4. `ARCHITECTURE.md`의 Page → Feature Container → Section → Composable 계층을 지킨다.
5. 마무리 전 `pnpm check:tokens`로 색상 하드코딩 0을 확인한다(pre-commit에서도 자동 차단).

## Figma 레이어 네이밍 컨벤션

figma-implementer가 Figma를 읽을 때 이름→토큰 매핑의 기준이다(관찰된 실제 규칙).

- **색**: `{Hue}/{scale}` — `Orange/main` → `hw-orange-main`, `Gray/dark` → `hw-gray-dark`. scale은 `lighter·light·main·dark·darker`.
- **타이포**: `{Style}.{Category}` — `H1.Heading` → `text-h1`, `B2.Body` → `text-b2`, `C1.Caption` → `text-c1`.
- **단일 토큰**: `Text/Primary` → `hw-text-primary`, `Btn/Hover` → `hw-btn-hover`.
- 컴포넌트 프레임은 `Component NN` 같은 일련번호로 표기될 수 있다 — 이름이 의미를 안 줄 때는 스크린샷·구조로 판단한다.

## Do / Don't

**Do**

- 색은 `hw-*` 토큰 유틸(`bg-hw-orange-main`), 텍스트는 시맨틱 토큰(`text-h1`~`text-c2`)을 쓴다.
- 컴포넌트 폭은 `w-full` + 부모 padding/grid로 제어한다.
- 기존 `ui/` primitive를 먼저 재사용하고, cva+reka-ui+`data-slot` 패턴을 따른다.
- Figma 원본 텍스트·variant를 그대로 옮긴다.

**Don't**

- `bg-[#hex]` 등 arbitrary 색을 직접 쓰지 않는다(하네스가 차단).
- 컴포넌트에 고정 px 너비(`w-[320px]`)를 박지 않는다.
- Figma에 없는 variant·상태·색을 임의로 만들지 않는다.
- 토큰과 정확히 같은 값을 arbitrary로 쓰지 않는다(`text-[12px]` 대신 `text-xs`/시맨틱 토큰).

## Design System Harness

`scripts/design-tokens/` 가 일관성을 자동으로 강제한다.

- `pnpm check:tokens` — 색상 하드코딩(`…-[#hex]`)을 ERROR로 차단하고, 토큰과 정확히 일치하는 typography/spacing/radius arbitrary를 WARN으로 보고. lint-staged(pre-commit)와 CI에서 사용.
- `pnpm tokens:codemod` — 인라인 색 hex를 Figma 팔레트 토큰으로 일괄 치환(리포트 모드). `--write`로 실제 적용. 팔레트에 없는 색은 최근접 토큰으로 스냅하며 Δ와 함께 리포트.
- `scripts/design-tokens/palette.mjs` — Figma 팔레트 매핑(EXACT/SHADCN/최근접). 색을 추가/변경할 때 이 파일과 `theme.css`를 함께 갱신한다.
- pre-commit 게이트: `.husky/pre-commit` → `pnpm lint-staged` → 스테이징된 `.ts`/`.vue`에 `check:tokens` 실행.

## Conflict Resolution

- `DESIGN.md`가 Figma 소스와 충돌하면 사용자에게 보고한다.
- `DESIGN.md`가 `ARCHITECTURE.md`/`FOLDER_STRUCTURE.md`와 충돌하면 편집 전 보고한다.
- 기존 구현이 `DESIGN.md`와 충돌하면, 변경이 작업 범위 내임을 확인한 뒤에만 문서 규칙을 우선한다.

## Agent Checklist

UI 작업 전:

- `DESIGN.md`를 읽는다. Vue 구조 변경 시 `ARCHITECTURE.md`·`FOLDER_STRUCTURE.md`도 읽는다.
- 기존 토큰·primitive를 먼저 확인한다.

UI 작업 후:

- `pnpm check:tokens` 통과(색상 하드코딩 0)를 확인한다.
- 컴포넌트 배치·계층(`ARCHITECTURE.md`)을 확인한다.
- empty/loading/error 상태를 확인한다.
