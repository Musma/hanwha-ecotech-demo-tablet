## 파일이름 및 폴더이름 규칙

케밥 케이스만 사용 ex) case-bob.vue, case-bob.ts

## 프로젝트 구조

```
public/                            # 그대로 서빙되는 정적 파일
.vscode/
├── mcp.json
└── settings.json
vite.config.ts                     # Vite 전역 설정
index.html                         # SPA HTML 엔트리
DESIGN.md                          # 디자인 토큰·컴포넌트 구현 워크플로·디자인 하네스 기준
.husky/                            # git 훅 (pre-commit → lint-staged → check:tokens)
scripts/                           # 빌드/유지보수 스크립트
└── design-tokens/                 # 디자인 토큰 하네스
    ├── palette.mjs                # Figma 색 팔레트 매핑(codemod·감지기 공유)
    ├── codemod.mjs                # 인라인 색 hex → hw-* 토큰 일괄 치환
    ├── codemod-units.mjs          # 토큰 일치 px arbitrary → 토큰 유틸리티 치환
    └── check-tokens.mjs           # 색상 하드코딩 감지(차단) + 토큰 일치 경고
src/                               # 애플리케이션 소스 루트 (@ 알리아스 대상)
├── main.ts                        # Vue 앱 생성/플러그인 설치 엔트리
├── router.ts                      # vue-router 라우트 테이블과 인증 가드
├── app.vue                        # 앱 최상위 엔트리
├── vite-env.d.ts                  # Vite 클라이언트 타입 선언
├── assets/                        # 빌드 파이프라인을 거치는 정적 리소스
│   ├── images/                    # 이미지 파일 모음
│   ├── fonts/                     # 웹폰트 (HanwhaGothic·Hanwha woff2, @font-face는 base.css)
│   ├── lottie/                    # Lottie 애니메이션 JSON
│   ├── main.css                   # Tailwind v4 진입 + 전역 CSS import 엔트리
│   └── css/                       # main.css에서만 import하는 전역 CSS 모듈
│       ├── theme.css              # Tailwind v4 @theme, @theme inline, :root 디자인 토큰
│       ├── base.css               # @layer base 기반 앱 전역 기본 스타일
│       ├── utilities.css          # 프로젝트 전역 Tailwind @utility 정의
│       └── vendors/               # 서드파티 DOM 오버라이드 및 JS 생성 DOM 스타일
│           └── map.css         # MapLibre 컨트롤, 마커, 팝업, 지도 전용 keyframes
├── layouts/                       # 라우터에서 사용하는 Vue 레이아웃
│   └── default-layout.vue         # 로그인 이후 공통 앱 레이아웃
├── pages/                         # vue-router 라우트 컴포넌트
│   ├── index.vue                  # 기본 진입 페이지
│   ├── login.vue                  # 공개 페이지 예시
│   ├── auth/                      # 인증 콜백 페이지
│   ├── me/                        # 내 업무 페이지
│   ├── projects/                  # 프로젝트 페이지
│   └── worklogs/                  # 작업일지 페이지
├── plugins/                       # Vue 앱 플러그인 설치 함수
├── features/                      # 도메인/기능 단위
│   ├── logged/
│   │   └── [도메인]/              # 도메인 이름
│   │       ├── api/               # 도메인에서만 사용하는 API Wrapper 메서드 정의
│   │       ├── composables/       # 도메인에서만 사용하는 Composable 정의
│   │       ├── components/        # 도메인에서만 사용하는 재사용 가능한 UI 정의
│   │       ├── types/             # 도메인에서만 사용하는 Type 정의
│   │       ├── constants/         # 도메인에서만 사용하는 상수 정의
│   │       └── utils/             # 도메인에서만 사용하는 Util 메서드 정의
│   └── public/
│       ├── api/                   # 인증/공개 영역에서만 사용하는 API Wrapper 메서드 정의
│       ├── composables/           # 인증/공개 영역에서만 사용하는 Composable 정의
│       ├── components/            # 인증/공개 영역에서만 사용하는 재사용 가능한 UI 정의
│       ├── types/                 # 인증/공개 영역에서만 사용하는 Type 정의
│       ├── constants/             # 인증/공개 영역에서만 사용하는 상수 정의
│       └── utils/                 # 인증/공개 영역에서만 사용하는 Util 메서드 정의
├── models/                        # 생성 모델 또는 외부 스키마 산출물 자리
├── swagger/                       # API 문서/생성 템플릿 자리
└── shared/                        # 공통 단위
    ├── api/                       # 도메인 2개 이상에서 사용되는 API Wrapper 메서드 정의
    ├── composables/               # 공통으로 사용되는 Composable 정의
    ├── components/                # 공통으로 사용되는 Vue 컴포넌트 정의
    │   ├── button/                # 공용 UI primitive 컴포넌트
    │   ├── input/                 # 공용 UI primitive 컴포넌트
    │   ├── table/                 # 공용 Table/DataTable 컴포넌트
    │   └── [component-name].vue   # 업무 패턴 재사용 컴포넌트
    ├── helpers/                   # 공통 순수 함수 및 외부 라이브러리 래퍼 정의
    ├── types/                     # 공통으로 사용되는 Type 정의
    ├── constants/                 # 공통으로 사용되는 상수 정의
    ├── workers/                   # Web Worker 정의
    └── stores/                    # Pinia store 정의
```

## 소스 경로 규칙

- 애플리케이션 코드는 `src/` 아래에 배치한다.
- `@/`는 `src/`를 가리키는 알리아스다. `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`의 `paths` 설정으로 매핑한다.
- 루트에는 설정 파일(`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `package.json`, `index.html`, `.env*`, `.vscode/`, `.husky/`), Claude Code 설정(`.claude/` — `agents/`, `hooks/`, `skills/`, `settings.json`), 정적 자산 폴더(`public/`), 빌드/유지보수 스크립트(`scripts/`), 에이전트·디자인 지침 문서(`CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, `DESIGN.md`)를 둔다.
- `index.html`의 진입 스크립트는 `/src/main.ts`로 작성한다.

## 공통 모듈 배치 규칙

- Vue 컴포넌트는 `components` 아래에 둔다.
- 기능 도메인 전용 컴포넌트는 `src/features/[scope]/[domain]/components`에 둔다.
- 여러 도메인에서 재사용하는 Vue 컴포넌트는 `src/shared/components`에 둔다.
- 공용 UI primitive도 Vue 컴포넌트이므로 `src/shared/components/[primitive-name]`에 둔다.
- Vue 컴포넌트가 아닌 공통 함수, 순수 유틸, 외부 라이브러리 래퍼는 `src/shared/helpers`에 둔다.
- 예: SweetAlert 래퍼는 Vue 컴포넌트가 아니므로 `src/shared/helpers/sweet-alert.ts`에 둔다.
- `src/shared/ui`는 신규 공통 Vue 컴포넌트 위치로 사용하지 않는다.

## 스타일 파일 배치 규칙

- 전역 스타일은 `src/assets/main.css`에서 `@import 'tailwindcss';`로 진입하며, `main.css`는 전역 CSS 모듈을 import하는 엔트리 역할만 담당한다.
- 디자인 토큰은 `src/assets/css/theme.css`의 `@theme` 블록에 정의한다(색상 `--color-hw-*`, 폰트 `--font-*`, 모션 `--ease-*`·`--animate-*`).
- 앱 전역 기본 스타일은 `src/assets/css/base.css`의 `@layer base`에 둔다.
- 프로젝트 전역 Tailwind custom utility는 `src/assets/css/utilities.css`에 둔다.
- 서드파티 DOM 오버라이드와 JS로 생성되는 DOM 스타일은 `src/assets/css/vendors/[vendor-name].css`에 둔다.
- 컴포넌트 스타일은 Vue SFC `<template>`의 인라인 Tailwind 유틸리티 클래스로 작성하며, `<style>` 블록은 원칙적으로 두지 않는다.
- 유틸리티로 표현할 수 없는 스타일(서드파티 DOM·의사요소·JS로 생성되는 지도 마커/팝업·keyframes)만 `src/assets/css` 하위 전역 CSS 모듈에 둔다.
- SCSS 및 컴포넌트별 공유 SCSS partial(`src/assets/styles`)은 더 이상 사용하지 않는다.

## Vue Router 라우팅 규칙

`src/pages` 구조는 `src/router.ts`의 라우트 테이블에 명시적으로 연결한다.

- 폴더 구조는 URL 구조와 맞추되, 실제 매핑은 `src/router.ts`가 담당한다.
- `index.vue`는 해당 경로의 기본 페이지다.
- 동적 세그먼트는 `[id].vue`, `[project-id].vue`처럼 파일명 또는 폴더명으로 표현한다.
- 중첩 라우트는 폴더로 표현하고 `src/router.ts`에 path를 등록한다. 예: `src/pages/projects/[project-id]/tasks.vue` -> `/projects/:project-id/tasks`
- 레이아웃은 `src/layouts`에 두고, `src/router.ts`의 route meta 또는 `src/app.vue`에서 선택한다.
- 인증/인가 같은 라우트 접근 제어는 `src/router.ts`의 전역 guard에서 처리한다.
- 라우트 전용 구현물은 해당 도메인의 `src/features` 내부에 두고, 여러 곳에서 재사용되면 `src/shared` 또는 `src/shared/components`, `src/shared/composables`로 승격한다.

권장 예시

- `src/pages/login.vue`: 로그인 이전 공개 페이지
- `src/layouts/default-layout.vue`: 로그인 이후 공통 앱 레이아웃
- `src/pages/[route-name]/index.vue`: 일반 페이지
- `src/pages/[route-name]/[entity-id].vue`: 동적 상세 페이지
