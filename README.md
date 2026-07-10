# Agents Docs Vue

Vue 기반 프로젝트에서 재사용할 에이전트 지침, 아키텍처 규칙, 폴더 구조 규칙, 로컬 스킬을 모아둔 템플릿 저장소다.

이 저장소는 Codex와 Claude Code가 Vue 프로젝트에서 일관된 기준으로 작업하도록 돕는다. 새 Vue 서비스 프로젝트를 만들거나, 기존 Vue 프로젝트에 에이전트 작업 규칙을 이식할 때 기준 문서와 스킬 세트를 제공한다.

## 목적

- Vue 프로젝트 작업 시 에이전트가 따라야 할 공통 git, 패키지 매니저, 검증 규칙을 제공한다.
- 페이지, feature, shared, composable, store, API wrapper의 책임 분리 기준을 제공한다.
- Vue 프로젝트의 권장 폴더 구조와 파일 배치 규칙을 제공한다.
- Codex와 Claude Code에서 사용할 수 있는 Vue, API client, Swagger, TanStack Query, shadcn-vue 관련 스킬을 함께 관리한다.

## 문서 구성

| 문서 | 목적 |
| --- | --- |
| `AGENTS.md` | Codex가 따라야 할 저장소 작업 규칙과 Vue 프로젝트 지침을 정의한다. |
| `CLAUDE.md` | Claude Code가 따라야 할 저장소 작업 규칙과 Vue 프로젝트 지침을 정의한다. |
| `ARCHITECTURE.md` | Vue 화면 구현 시 페이지, feature, section, composable, helper, API wrapper의 책임 경계를 정의한다. |
| `FOLDER_STRUCTURE.md` | Vue 프로젝트의 폴더 구조, 파일명 규칙, 공통 모듈 배치 규칙을 정의한다. |

## 사용 흐름

1. 대상 Vue 프로젝트에 `AGENTS.md`, `ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`를 배치한다.
2. Claude Code도 함께 사용할 경우 `CLAUDE.md`를 배치한다.
3. 필요한 스킬을 `.codex/skills` 또는 `.claude/skills` 아래에 둔다.
4. 작업 요청 시 스킬 이름이나 트리거 문장을 포함해 에이전트가 적절한 스킬을 사용하게 한다.
5. 구현 전에는 프로젝트 문서와 기존 코드 패턴을 먼저 확인하고, 구현 후에는 lint 또는 관련 검증을 실행한다.

## API Client 오케스트레이션

API client 설정 작업은 `api-client-orchestrator`를 상위 진입점으로 사용한다. 이 스킬은 저장소의 프레임워크, 앱 엔트리, API 설정, 생성 Swagger client, feature API wrapper를 먼저 확인한 뒤 필요한 하위 스킬을 선택한다.

| 단계 | 담당 스킬 | 역할 |
| --- | --- | --- |
| 1 | `api-client-orchestrator` | 전체 API client 구조를 진단하고 필요한 작업 순서를 결정한다. |
| 2 | `swagger-axios-init` | 생성된 Swagger API class와 shared axios instance를 한 곳에서 연결한다. |
| 3 | `tanstack-query-init` | 프로젝트 프레임워크에 맞는 TanStack Query package, QueryClient, Provider 구성을 정렬한다. |
| 4 | `api-wrapper-pattern` | feature 단위 API wrapper를 정리하고 raw Swagger 호출을 컴포넌트 밖으로 분리한다. |
| 5 | `api-client-orchestrator` | app provider, shared API export, feature wrapper 사용 지점을 검증하고 결과를 보고한다. |

대표 트리거는 "api 세팅해줘", "axios instance랑 TanStack Query 연결해줘", "Swagger 기반 API client 구조 만들어줘"처럼 API client 구조 전체를 다루는 요청이다.

## 스킬 보유 목록

| 스킬 | 제공 위치 | 트리거 | 목적 | 예시 프롬프트 |
| --- | --- | --- | --- | --- |
| `api-client-orchestrator` | Codex / Claude | API client, axios, Swagger, TanStack Query 설정을 함께 다룰 때 | 저장소 구조를 확인한 뒤 Swagger client, axios instance, TanStack Query, feature API wrapper의 통합 방향을 조율하고 하위 스킬에 위임한다. | "axios instance랑 TanStack Query를 Swagger client 기반으로 연결해줘." |
| `api-wrapper-pattern` | Codex / Claude | feature API wrapper 작성 또는 정리 요청 | raw Swagger 호출을 feature 단위 wrapper 함수로 감싸고, 컴포넌트가 transport 세부 구현에 묶이지 않게 한다. | "프로젝트 목록 API를 feature wrapper 패턴으로 정리해줘." |
| `create-adaptable-composable` | Codex / Claude | 재사용 composable, MaybeRef, MaybeRefOrGetter 설계 | plain value, ref, getter를 모두 받을 수 있는 Vue composable을 설계한다. | "검색어를 MaybeRefOrGetter로 받는 재사용 composable을 만들어줘." |
| `create-vue-service` | Codex / Claude | 새 Vue 서비스 프로젝트 생성 | Vite, Vue 3, TypeScript, Pinia, Vue Router, axios, lint-staged 기반 프로젝트를 생성한다. | "새 Vue 서비스 프로젝트를 `admin-web` 이름으로 만들어줘." |
| `design-rules-doc` | Claude | 디자인 가이드, Figma PDF, DESIGN.md 작성 | 디자인 자료를 에이전트가 따를 수 있는 `DESIGN.md` 구현 규칙으로 정리한다. | "Figma 디자인 가이드를 바탕으로 DESIGN.md를 작성해줘." |
| `init-vue-service-app` | Codex / Claude | Vue 서비스 앱 초기화 | `create-vue-service`를 실행하고 생성된 프로젝트의 lint/build 검증까지 이어간다. | "`my-service` Vue 앱을 초기화하고 검증까지 해줘." |
| `setup-shadcn-vue` | Codex / Claude | 기존 Vue 프로젝트에 shadcn-vue 추가 | shadcn-vue를 설치하고 `shared/components/ui`, `shared/helpers` 기준으로 배치한다. | "이 Vue 프로젝트에 shadcn-vue를 설정해줘." |
| `shadcn-vue` | Codex / Claude | shadcn-vue 컴포넌트 추가, 검색, 수정 | shadcn-vue registry와 컴포넌트 문서를 참고해 UI 컴포넌트를 추가하거나 조합한다. | "shadcn-vue로 설정 화면에 쓸 tabs와 form 컴포넌트를 추가해줘." |
| `swagger-axios-init` | Codex / Claude | Swagger client와 axios instance 연결 | 생성된 Swagger API class를 shared axios instance와 연결하고 공통 API client를 구성한다. | "생성된 Swagger client가 shared axios instance를 쓰도록 연결해줘." |
| `swagger-init` | Codex / Claude | Swagger 초기 설정 누락 | Swagger client 생성을 위한 의존성, 스크립트, 템플릿, 출력 구조를 준비한다. | "Swagger 생성 환경이 없는 프로젝트에 초기 설정을 추가해줘." |
| `swagger-orchestrator` | Codex / Claude | Swagger 초기화, 재생성, 전체 workflow | 현재 Swagger 설정을 진단하고 필요한 초기화, 생성, 검증 흐름을 조율한다. | "Swagger client 다시 생성하고 결과를 검증해줘." |
| `tanstack-query-init` | Codex / Claude | TanStack Query 설치 또는 Provider 연결 | 프로젝트 프레임워크에 맞게 QueryClient와 Provider 설정을 구성한다. | "이 Vue 프로젝트에 TanStack Query를 설정해줘." |
| `vue-best-practices` | Codex / Claude | Vue, `.vue`, Vite, Composition API 작업 | Vue 3 Composition API, `<script setup lang="ts">`, 컴포넌트 책임 분리 기준을 적용한다. | "이 Vue 컴포넌트를 Composition API 기준으로 리팩토링해줘." |
| `vue-debug-guides` | Codex / Claude | Vue 런타임 오류, 반응성 문제, hydration 문제 | Vue 3 런타임 경고, 비동기 오류, 반응성 함정을 진단한다. | "ref 값이 바뀌는데 화면이 갱신되지 않는 문제를 찾아줘." |
| `vue-jsx-best-practices` | Codex / Claude | Vue JSX 또는 TSX 작성/수정 | Vue JSX 문법과 React JSX와의 차이를 반영해 코드를 작성한다. | "이 React JSX 예시를 Vue JSX 컴포넌트로 바꿔줘." |
| `vue-options-api-best-practices` | Codex / Claude | Options API 코드 수정 | Vue 3 Options API의 `data`, `methods`, `this` context, TypeScript 패턴을 적용한다. | "이 Options API 컴포넌트의 타입 오류를 고쳐줘." |
| `vue-pinia-best-practices` | Codex / Claude | Pinia store 작성, 수정, 디버깅 | Pinia store 구조, 반응성, setup store, 전역 상태 기준을 적용한다. | "사용자 세션 상태를 Pinia store로 정리해줘." |
| `vue-router-best-practices` | Codex / Claude | Vue Router guard, params, route lifecycle | Vue Router 4의 navigation guard, route param 변경, cleanup 패턴을 적용한다. | "라우트 파라미터가 바뀔 때 상세 데이터를 다시 불러오게 고쳐줘." |
| `vue-testing-best-practices` | Codex / Claude | Vue 테스트, Vitest, Vue Test Utils, Playwright | Vue 컴포넌트와 composable 테스트 패턴, async 검증, E2E 기준을 적용한다. | "이 composable에 Vitest 테스트를 추가해줘." |

## 기본 작업 규칙

- 패키지 매니저는 기본적으로 `pnpm`을 사용한다.
- Vue 구현은 Composition API와 `<script setup lang="ts">`를 기본으로 한다.
- 신규 기능 또는 큰 수정 전에는 `ARCHITECTURE.md`와 `FOLDER_STRUCTURE.md`를 확인한다.
- 컴포넌트가 커지면 feature section, composable, helper, API wrapper로 책임을 분리한다.
- 작업 완료 후에는 가능한 범위에서 lint 또는 관련 검증을 실행한다.
- 성공적으로 검증된 변경은 Conventional Commits 형식으로 커밋한다.
