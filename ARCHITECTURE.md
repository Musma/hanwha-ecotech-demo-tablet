# Frontend Architecture

이 문서는 프론트엔드의 책임 분리 기준을 정의한다.
에이전트가 한 파일에 너무 많은 구현을 몰아넣지 않도록, 새 기능 구현과 기존 화면 수정 전에 이 문서를 먼저 확인한다.

## Architecture Goals

- 파일 하나가 하나의 명확한 책임을 가지도록 유지한다.
- 페이지는 화면 조립을 담당하고, 업무 로직은 기능 단위 모듈로 분리한다.
- Vue 컴포넌트는 렌더링과 사용자 상호작용에 집중한다.
- API 호출, 상태 관리, 데이터 변환, 검증 규칙은 테스트 가능한 경계로 분리한다.
- 공용화는 실제 재사용이 생겼을 때 진행하고, 처음부터 과도하게 추상화하지 않는다.

## Directory Responsibilities

### `pages`

`pages`는 라우터에 연결되는 화면 진입점이다.

- 라우트 단위 화면 조립을 담당한다.
- 레이아웃, 기능 컴포넌트, 공용 컴포넌트를 연결한다.
- 라우트 파라미터, 쿼리, 권한 흐름을 기능 모듈에 전달한다.
- 복잡한 폼 검증, 목록 가공, API 세부 호출은 직접 오래 보관하지 않는다.

### `features`

`features`는 도메인 또는 기능 단위 구현을 담는다.

- 특정 업무 영역에서만 쓰는 컴포넌트, composable, API wrapper, 타입, 상수, 유틸을 둔다.
- `features/logged/[domain]`은 로그인 이후 업무 도메인에 사용한다.
- `features/public`은 로그인 이전 또는 공개 영역 기능에 사용한다.
- 기능 내부 구현은 먼저 도메인 안에 두고, 2개 이상 도메인에서 재사용될 때 `shared`로 승격한다.

### `shared`

`shared`는 여러 도메인에서 재사용되는 공통 단위를 담는다.

- `shared/components`: 공용 Vue 컴포넌트와 UI primitive를 둔다.
- `shared/composables`: 여러 도메인에서 재사용되는 Composition API 로직을 둔다.
- `shared/api`: 여러 도메인에서 쓰는 API wrapper를 둔다.
- `shared/stores`: 전역 Pinia store를 둔다.
- `shared/helpers`: Vue에 의존하지 않는 순수 함수와 외부 라이브러리 래퍼를 둔다.
- `shared/types`, `shared/constants`, `shared/workers`는 각각 공용 타입, 상수, worker를 둔다.

### `models` and `swagger`

- `models`는 생성 모델 또는 외부 스키마 산출물을 담는다.
- `swagger`는 생성 템플릿과 관련 설정을 담는다.
- 자동 생성 파일은 직접 수정하지 않는다.
- 생성 모델을 그대로 화면에 노출하기보다 필요한 경우 API wrapper나 mapper에서 화면용 타입으로 정리한다.

## Feature Composition Methodology

프론트엔드 화면은 다음 계층을 기준으로 설계하고 리팩토링한다.
이 기준은 새 기능 구현과 기존 화면 수정 모두에 적용한다.

```text
Page Component
  -> Feature Container
    -> Feature Section Components
      -> Domain Composables / Stores
      -> Domain Helpers / Constants / Types
      -> API Wrappers
```

### Page Component

페이지 컴포넌트는 라우터 엔트리와 화면 조립만 담당한다.
페이지에서 feature 컴포넌트 하나만 렌더링하는 것은 허용된다.
다만 이것은 첫 단계일 뿐이며, 모든 로직을 feature 컴포넌트 하나로 옮기는 것을 완료 상태로 보지 않는다.

### Feature Container

feature container는 도메인 화면의 상위 조립자다.
예: `src/features/logged/me/components/me-task-day-entry-view.vue`

feature container는 다음 역할에 집중한다.

- 페이지나 라우트에서 전달된 파라미터를 도메인 흐름에 연결한다.
- 도메인 composable과 section component를 조립한다.
- 주요 loading, empty, error 흐름을 배치한다.
- 서로 다른 section 사이의 데이터 흐름을 연결한다.

feature container에는 다음 구현을 오래 두지 않는다.

- API query/mutation 세부 payload 구성
- 복잡한 필터, 검색, 정렬, 그룹핑 계산
- 폼 검증과 저장 규칙
- 모달 또는 drawer 내부 상태 전부
- 테이블 column 정의 전체
- 날짜 grid, chart option, tree 변환 같은 큰 파생 데이터 생성
- 반복 렌더링되는 카드, 행, 패널, toolbar의 세부 template

### Feature Section Component

feature section component는 화면의 독립 UI 영역을 담당한다.
예: toolbar, filter panel, calendar body, task section, draft panel, picker dialog, summary card.

section component는 props와 emits로 상위와 통신한다.
section component가 자체 composable을 사용할 수는 있지만, API 호출과 mutation이 직접 섞이면 먼저 container 또는 domain composable 경계를 점검한다.

### Domain Composable

domain composable은 Vue 반응성 기반 상태와 side effect를 담당한다.
다음 항목은 composable 추출을 우선한다.

- query/mutation 결과를 화면 상태로 연결하는 흐름
- 모달, picker, drawer, form draft 상태
- pagination, infinite scroll, debounce, optimistic state
- route/query param과 화면 상태 동기화
- 저장/수정/삭제 payload 구성과 후속 refetch 흐름

### Domain Helper, Constant, Type

Vue 반응성이 필요 없는 계산은 helper, constant, type으로 분리한다.
날짜 포맷, label 매핑, 상태 판정, 검색 predicate, tree/grid 변환처럼 테스트 가능한 로직은 component 안에 오래 두지 않는다.

### Required Working Rule

새 기능을 만들거나 기존 화면을 수정할 때는 다음 순서로 판단한다.

1. Page는 route entry와 feature container 연결만 담당하는지 확인한다.
2. Feature container가 여러 UI 영역과 여러 상태 흐름을 동시에 갖고 있으면 section component와 composable 분리를 먼저 계획한다.
3. 순수 계산은 helper/constant/type으로 먼저 분리한다.
4. 상태와 side effect는 domain composable로 분리한다.
5. 큰 template 영역은 feature section component로 분리한다.
6. 두 개 이상 도메인에서 재사용되는 것이 확인된 뒤에만 shared로 승격한다.

페이지가 얇더라도 feature container가 God Component가 되면 AGENTS 준수로 보지 않는다.
완료 기준은 `Page -> Feature Container -> Feature Section Components -> Domain Composables/Helpers` 계층이 실제 코드에 반영되는 것이다.

## Component Responsibility

### Page Component

페이지 컴포넌트는 다음 역할에 집중한다.

- 라우트 단위 화면 구성
- 상위 레이아웃과 기능 컴포넌트 연결
- 라우트 파라미터와 쿼리 해석
- 기능 composable 또는 store 호출
- 빈 상태, 로딩 상태, 오류 상태의 큰 흐름 배치

페이지 컴포넌트에는 다음 구현을 오래 두지 않는다.

- 세부 API 요청 함수
- 복잡한 데이터 변환
- 여러 단계의 폼 검증
- 테이블 컬럼 생성 로직 전체
- 모달 내부 비즈니스 규칙
- 반복 가능한 이벤트 처리 로직

### Feature Component

기능 컴포넌트는 특정 도메인 UI와 상호작용을 담당한다.

- 업무 도메인에 종속된 UI를 표현한다.
- props와 emits로 상위와 통신한다.
- 도메인 composable에서 받은 상태와 액션을 렌더링한다.
- 테이블, 폼, 필터, 모달이 커지면 하위 컴포넌트로 나눈다.

### Shared Component

공용 컴포넌트는 표현과 일반적인 상호작용에 집중한다.

- 도메인 API를 직접 호출하지 않는다.
- 특정 업무 용어에 강하게 묶이지 않는다.
- 프로젝트가 제공하는 UI Set, 디자인 토큰, 공용 컴포넌트 규칙을 따른다.
- 재사용 API가 불명확하면 도메인 컴포넌트로 먼저 두고, 반복 사용이 확인된 뒤 승격한다.

## Logic Placement

### API Wrapper

- 서버 요청 함수는 `api` 폴더에 둔다.
- Swagger 생성 클라이언트 호출은 wrapper에서 감싼다.
- 컴포넌트는 raw Swagger 메서드보다 도메인 API wrapper를 호출한다.
- 요청 파라미터 정리와 응답 데이터 정규화는 wrapper 또는 mapper에서 처리한다.

### Composable

composable은 Vue 반응성 기반의 재사용 로직을 담당한다.

- API wrapper와 UI 컴포넌트 사이의 상태 흐름을 관리한다.
- 로딩, 오류, 선택 상태, 필터 상태, 페이지네이션 상태를 관리할 수 있다.
- `MaybeRef`, `MaybeRefOrGetter` 입력 패턴이 필요한 경우 `<skills-root>/create-adaptable-composable/SKILL.md`(`.codex/skills` 또는 `.claude/skills`)를 참고한다.
- 도메인 전용 composable은 `src/features/[scope]/[domain]/composables`에 둔다.
- 여러 도메인에서 재사용되면 `src/shared/composables`로 옮긴다.

### Pinia Store

Pinia store는 전역 또는 장기 보존 상태에 사용한다.

- 사용자 세션, 권한, 앱 전역 설정처럼 여러 화면이 공유하는 상태에 사용한다.
- 단일 페이지에서만 쓰는 필터, 모달 열림 상태, 임시 폼 상태는 composable 또는 컴포넌트 상태를 우선한다.
- store에 API 호출을 넣을 때는 호출 책임과 상태 책임이 과도하게 섞이지 않는지 점검한다.

### Helper and Util

- Vue 반응성에 의존하지 않는 순수 함수는 helper 또는 util로 분리한다.
- 날짜 포맷, 숫자 포맷, enum label 매핑, 정렬, 필터링 같은 로직은 컴포넌트 내부에 반복 작성하지 않는다.
- 도메인 전용 함수는 feature 내부 `utils`에 두고, 공용 함수는 `src/shared/helpers`에 둔다.

## Split Guidelines

다음 조건 중 하나라도 해당하면 파일 분리를 검토한다.

- Vue 단일 파일 컴포넌트가 300라인을 넘는다.
- `script setup`이 150라인을 넘는다.
- `template`이 길어져 주요 UI 영역을 한눈에 파악하기 어렵다.
- `computed`, `watch`, event handler가 많아져 상태 흐름이 불명확하다.
- 같은 로직이 2곳 이상에서 반복된다.
- 테이블 컬럼, 필터, 폼 검증, 모달 상태가 한 컴포넌트에 모두 들어 있다.
- API 호출과 화면 렌더링이 강하게 결합되어 테스트하기 어렵다.
- 특정 UI 블록을 독립적으로 이해하거나 테스트하기 어렵다.

분리할 때는 다음 순서를 우선한다.

1. 반복되는 순수 로직은 helper 또는 util로 분리한다.
2. Vue 반응성과 상태 흐름은 composable로 분리한다.
3. 큰 `template` 영역은 도메인 하위 컴포넌트로 분리한다.
4. 여러 도메인에서 재사용되는 UI만 `src/shared/components`로 승격한다.
5. 여러 화면이 공유하는 장기 상태만 Pinia store로 승격한다.

## Implementation Workflow

새 기능을 구현하거나 기존 화면을 크게 수정할 때는 다음 순서를 따른다.

1. `AGENTS.md`를 확인한다.
2. `ARCHITECTURE.md`에서 책임 분리 기준을 확인한다.
3. 파일 생성, 이동, import/export 변경이 있으면 `FOLDER_STRUCTURE.md`를 확인한다.
4. UI 컴포넌트나 스타일을 변경하기 전에는 `DESIGN.md`(색상·타이포그래피 토큰, 컴포넌트 구현 워크플로, 디자인 하네스)를 확인한다.
5. 기존 코드에서 같은 도메인의 패턴을 먼저 찾는다.
6. 큰 파일에 기능을 추가해야 한다면 먼저 분리 지점을 정한다.
7. 구현 후 관련 스크립트 또는 최소한 타입/린트 검증을 실행한다.

## Vue Skill Usage

프로젝트 로컬 skill 문서는 두 위치에 동일한 내용으로 제공된다. Codex는 `.codex/skills/`를, Claude Code는 `.claude/skills/`를 사용한다.
자동 스킬 실행이 지원되지 않는 환경이라도 파일로는 읽을 수 있으므로, 관련 상황에서 직접 `SKILL.md`를 확인한다. 아래 경로는 `<skills-root>`를 사용하는 에이전트에 맞는 루트(`.codex/skills` 또는 `.claude/skills`)로 치환한다.

- Vue 3 Composition API, 반응성, lifecycle, SSR, 성능: `<skills-root>/vue-best-practices/SKILL.md`
- Options API: `<skills-root>/vue-options-api-best-practices/SKILL.md`
- Vue Router 4: `<skills-root>/vue-router-best-practices/SKILL.md`
- Pinia: `<skills-root>/vue-pinia-best-practices/SKILL.md`
- Vue 테스트, Vitest, Vue Test Utils, Playwright: `<skills-root>/vue-testing-best-practices/SKILL.md`
- Vue JSX 또는 TSX: `<skills-root>/vue-jsx-best-practices/SKILL.md`
- Vue 런타임 오류, 경고, 비동기 오류, 반응성 디버깅: `<skills-root>/vue-debug-guides/SKILL.md`
- 재사용 composable 설계: `<skills-root>/create-adaptable-composable/SKILL.md`

스킬 문서는 일반 모범 사례다.
프로젝트 고유 규칙은 `AGENTS.md`, 이 문서, `FOLDER_STRUCTURE.md`, 실제 코드 패턴 순으로 우선한다.
