# Agent Instructions Template

본 문서는 Vue 기반 프로젝트에서 재사용하기 위한 에이전트 지침 템플릿이다.
이 문서는 Claude Code용 지침이며, Codex용 지침인 `AGENTS.md`와 내용이 동일하되 스킬 경로만 `.claude/skills/`를 가리킨다.

## Repository Agent Instructions

본 문서는 이 레포지토리에서 Claude Code가 준수하여야 하는 공통 git 지침을 정의한다.

### Core Git Rules

- 작업이 성공적으로 완료되고 검증이 종료된 경우, 사용자의 별도 승인을 기다리지 않고 변경 사항을 git 커밋으로 기록하여야 한다.
- 단, 설계서를 바탕으로 작업을 진행하는 경우에는 사용자가 명시적으로 요청하기 전까지 커밋을 진행하지 않아야 한다.
- 커밋 전에는 반드시 `git status`와 `git diff`를 확인하여 의도하지 않은 변경 사항이 포함되지 않았는지 점검하여야 한다.
- 커밋 전에는 프로젝트에 정의된 lint script를 실행하여 검증하여야 한다.
- lint script가 없거나 실행할 수 없는 경우, 그 이유를 최종 보고에 명시하여야 한다.
- 커밋에는 승인된 작업 범위에 포함된 변경 사항만 포함하여야 한다.
- 사용자가 별도로 요청하지 않는 한 `git push`는 수행하지 않아야 한다.
- 커밋 메시지는 반드시 Conventional Commits 형식을 따라야 한다.
- 기본 커밋 메시지 형식은 `<type>: <summary>`로 작성하여야 한다.
- 필요한 경우 범위를 포함하여 `<type>(<scope>): <summary>` 형식으로 작성할 수 있다.
- 커밋 타입은 변경 목적에 맞게 선택하여야 한다.
- summary는 변경 내용을 명확히 설명하는 간결한 한글 문장으로 작성하여야 한다.
- summary 끝에는 마침표를 붙이지 않아야 한다.

### Commit Types

- `feat`: 새로운 기능을 추가한 경우에 사용한다.
- `fix`: 버그를 수정한 경우에 사용한다.
- `refactor`: 동작 변화 없이 코드 구조를 개선한 경우에 사용한다.
- `style`: 포맷팅, 세미콜론, 공백, CSS 스타일 등 로직 변화가 없는 변경에 사용한다.
- `chore`: 빌드 설정, 패키지 관리, 기타 유지보수 작업에 사용한다.
- `docs`: 문서만 변경한 경우에 사용한다.
- `test`: 테스트를 추가하거나 수정한 경우에 사용한다.
- `perf`: 성능을 개선한 경우에 사용한다.
- `ci`: CI/CD 설정을 변경한 경우에 사용한다.
- `build`: 빌드 시스템, 번들러, 의존성 관련 변경에 사용한다.
- `revert`: 이전 커밋을 되돌리는 경우에 사용한다.

### Commit Principles

- 하나의 커밋에는 하나의 논리적 변경만 포함하여야 한다.
- 승인된 작업 범위에 포함된 변경 사항만 커밋하여야 한다.
- 여러 종류의 변경이 함께 발생한 경우, 가능한 한 논리 단위별로 커밋을 분리하여야 한다.
- 커밋 타입 선택이 명확하지 않은 경우 사용자에게 확인하거나, 변경 목적에 가장 직접적으로 부합하는 타입을 선택하여야 한다.
- 단순 파일 정리나 설정 변경에는 `chore`를 사용하여야 한다.
- UI 표시 또는 스타일만 변경된 경우에는 `style`을 사용하여야 한다.
- 사용자에게 보이는 기능 변화가 있는 경우에는 `feat` 또는 `fix`를 우선적으로 고려하여야 한다.

### Package Manager Rules

- 패키지 매니저는 기본적으로 `pnpm`을 사용하여야 한다.
- 레포지토리에 `yarn.lock`, `package-lock.json`, `bun.lockb`, `bun.lock`, `deno.lock` 등 다른 패키지 매니저 사용을 명확히 나타내는 파일이 있는 경우에만 해당 레포지토리의 기존 패키지 매니저를 따라야 한다.
- 명확한 기존 패키지 매니저가 없는 경우 `npm install`, `npm add`, `npm run`을 기본 선택으로 사용하지 않아야 한다.
- 기본 명령은 `pnpm`, `pnpm add`, `pnpm add -D`, `pnpm run`을 사용하여야 한다.
- `package-lock.json`은 생성하지 않아야 한다.
- 의존성 설치나 스크립트 실행을 제안하거나 수행할 때에도 본 규칙을 따라야 한다.

## Vue Project Agent Instructions

본 문서는 Vue 프로젝트에서 준수하여야 하는 프론트엔드 작업 지침을 정의한다.

### Architecture Rules

- 프론트엔드 기능을 새로 구현하거나 기존 화면의 구조를 바꾸기 전에는 반드시 `ARCHITECTURE.md`를 먼저 읽어야 한다.
- 페이지, 기능 컴포넌트, 공용 컴포넌트, composable, store, API wrapper, helper의 책임은 `ARCHITECTURE.md`의 기준을 따른다.
- 새 기능 구현과 기존 화면 리팩토링은 `ARCHITECTURE.md`의 Feature Composition Methodology를 따른다.
- 페이지 컴포넌트만 얇게 만들고 모든 구현을 feature component 하나에 몰아넣는 것은 완료 상태로 보지 않는다.
- feature container는 화면 조립자 역할에 집중하고, 독립 UI 영역은 feature section component로, 상태와 side effect는 domain composable로, 순수 계산은 helper/constant/type으로 분리한다.
- 한 파일에 화면 조립, API 호출, 상태 관리, 복잡한 계산, 폼 검증, 테이블 렌더링, 모달 제어를 모두 넣지 않는다.
- 페이지 컴포넌트는 라우팅 단위의 화면 조립과 데이터 흐름 연결에 집중한다.
- 비즈니스 로직, 상태 파생, API 요청, 반복 가능한 이벤트 처리는 composable, store, API wrapper, helper로 분리한다.
- 파일이 커졌을 때는 기능을 계속 추가하기 전에 `ARCHITECTURE.md`의 분리 기준에 따라 먼저 책임 경계를 점검한다.

### Folder Structure Rules

- 프론트엔드 파일을 생성하거나 이동하거나 import/export 구조를 변경하기 전에는 반드시 `FOLDER_STRUCTURE.md`를 먼저 읽어야 한다.
- 신규 페이지, 레이아웃, 컴포넌트, composable, store, API wrapper, helper, type, constant, worker는 `FOLDER_STRUCTURE.md`의 배치 규칙을 우선 따라야 한다.
- Vue 컴포넌트와 공용 UI primitive는 `shared/components` 기준을 따르고, Vue 컴포넌트가 아닌 공통 함수나 외부 라이브러리 래퍼는 `shared/helpers` 기준을 따라야 한다.
- `FOLDER_STRUCTURE.md`와 실제 코드가 충돌하는 경우, 임의로 판단하지 말고 기존 구현을 확인한 뒤 필요한 경우 사용자에게 보고하여야 한다.

### Style Rules

- 스타일 시스템은 Tailwind CSS v4를 기본으로 사용한다(CSS-first, `@tailwindcss/vite` 플러그인).
- 전역 스타일 엔트리는 `assets/main.css`를 사용하며 `@import 'tailwindcss';`로 진입한다.
- 디자인 토큰(색상·폰트·easing·animation)은 `assets/main.css`의 `@theme` 블록에 정의한다. 색상은 `--color-hw-*`(예: `bg-hw-orange`, `text-hw-gray-darker`), 폰트는 `--font-*`(`font-sans`/`font-mono` 등), 모션은 `--ease-*`·`--animate-*`로 둔다.
- 컴포넌트 스타일은 Vue SFC `<template>`의 인라인 유틸리티 클래스로 작성하는 것을 기본으로 한다. `<style>` 블록은 원칙적으로 두지 않는다.
- 토큰 스케일에 정확히 맞지 않는 값은 임의값(`px-[14px]`, `text-[13px]`, `shadow-[...]`)으로 충실히 표현한다.
- 유틸리티로 표현할 수 없는 경우(서드파티 DOM 오버라이드, `::-webkit-scrollbar` 등 의사요소, JS로 명령형 생성되는 지도 마커/팝업, keyframes)에 한해 `assets/main.css`의 CSS 레이어에 둔다. mapbox 등 외부 요소 스타일도 여기에 둔다.
- 새 디자인 토큰이 필요하면 인라인 임의값을 반복하지 말고 `@theme`에 토큰을 추가한 뒤 유틸리티로 참조한다.

### Design Rules

- UI를 새로 구현하거나 기존 UI를 수정하기 전에는 반드시 `DESIGN.md`를 먼저 읽는다.
- `DESIGN.md`는 Figma 디자인 시스템(색상 source of truth)과 프로젝트 구조를 연결한 UI 구현 기준이다.
- 색상은 반드시 `--color-hw-*` 토큰 유틸리티를 사용하고, `bg-[#hex]` 같은 arbitrary 색상값을 직접 쓰지 않는다.
- typography/spacing/radius는 정의된 토큰과 정확히 일치하는 값을 arbitrary로 쓰지 않는다(`text-[12px]`→`text-xs`). off-scale 값은 허용한다.
- 새 색이 필요하면 Figma 팔레트에 추가한 뒤 `src/assets/css/theme.css`와 `scripts/design-tokens/palette.mjs`에 토큰을 정의하고 유틸리티로 참조한다.
- Figma → 코드 컴포넌트 구현은 `DESIGN.md`의 Component Implementation Workflow를 따른다.
- UI 작업 마무리 전 `pnpm check:tokens` 통과(색상 하드코딩 0)를 확인한다. pre-commit에서도 자동 차단된다. 빌드+토큰 일괄 검증은 `pnpm design:qa`를 쓴다.
- **Figma 충실도**: 원본 텍스트(레이블·문구)를 그대로 유지하고 자의적으로 바꾸지 않는다. 색·간격·타이포는 Figma 값에 충실하게 옮긴다.
- **컴포넌트 구현 금지사항**: Figma에 없는 variant·상태·옵션을 임의로 만들지 않는다. 디자인에 있는 것만 구현한다.
- **컴포넌트 너비 규칙**: 컴포넌트에 고정 px 너비를 박지 않는다. `w-full` + 부모의 padding/grid로 폭을 제어한다.
- **에이전트 위임**: Figma 노드 URL로 화면/컴포넌트를 구현할 때는 `figma-implementer` 에이전트(`.claude/agents/figma-implementer.md`)에 위임한다. 비자명한 작업은 구현 전 계획 승인을 받고(계획 게이트), 검증까지 끝나면 자동 커밋한다.
- `DESIGN.md`, `ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, 기존 구현이 충돌하면 임의 판단하지 말고 사용자에게 보고한다.

### File Size and Split Rules

- Vue 단일 파일 컴포넌트는 기본적으로 300라인을 넘기지 않도록 설계한다.
- `script setup`이 150라인을 넘기거나 `computed`, `watch`, handler, formatter가 빠르게 늘어나면 composable 또는 helper 분리를 검토한다.
- `template`에서 동일한 조건 분기나 렌더링 블록이 반복되면 하위 컴포넌트로 분리한다.
- 같은 로직이 2곳 이상에서 필요해지면 도메인 composable, 공용 composable, helper 중 적절한 위치로 승격한다.
- 컴포넌트가 테스트하기 어려운 비즈니스 규칙을 포함하면 순수 함수나 composable로 빼서 테스트 가능한 경계를 만든다.
- 라인 수 기준은 절대 규칙이 아니라 경고 신호다. 다만 새 코드를 추가하면서 기준을 넘길 경우에는 분리하지 않는 이유가 명확해야 한다.

### Vue Skill Reference Rules

- `.claude/skills/*/SKILL.md` 파일은 프로젝트 로컬 Claude Code skill 문서로 취급한다.
- Claude Code는 `.claude/skills/`의 스킬을 자동으로 인식한다. 스킬 자동 실행이 보장되지 않는 상황에서는 관련 구현 전에 해당 `SKILL.md`를 직접 읽고 요약 기준만 적용한다.
- Vue 3 Composition API, 반응성, lifecycle, SSR, 성능 판단이 애매하면 `.claude/skills/vue-best-practices/SKILL.md`를 참고한다.
- Options API 코드를 수정할 때는 `.claude/skills/vue-options-api-best-practices/SKILL.md`를 참고한다.
- Vue Router guard, route param, route component lifecycle을 수정할 때는 `.claude/skills/vue-router-best-practices/SKILL.md`를 참고한다.
- Pinia store를 새로 만들거나 상태 구조를 바꿀 때는 `.claude/skills/vue-pinia-best-practices/SKILL.md`를 참고한다.
- Vue 테스트, Vitest, Vue Test Utils, Playwright 관련 작업을 할 때는 `.claude/skills/vue-testing-best-practices/SKILL.md`를 참고한다.
- Vue JSX 또는 TSX를 작성하거나 수정할 때는 `.claude/skills/vue-jsx-best-practices/SKILL.md`를 참고한다.
- Vue 런타임 오류, 경고, 비동기 오류, 반응성 문제를 디버깅할 때는 `.claude/skills/vue-debug-guides/SKILL.md`를 참고한다.
- 재사용 composable을 설계할 때는 `.claude/skills/create-adaptable-composable/SKILL.md`를 참고한다.
- 스킬 문서는 일반 모범 사례다. 프로젝트 고유 규칙인 `ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, 실제 코드 패턴을 우선한다.
