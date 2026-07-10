---
name: create-vue-service
description: Create and initialize a new Vue service project. Use when Codex needs to generate a real Vue boilerplate with Vite, Vue 3, TypeScript, Pinia, Vue Router, SCSS, axios, @musma/eslint-config-vue, and lint-staged, following this repository's AGENTS.md and FOLDER_STRUCTURE.md conventions.
---

# Create Vue Service

## Overview

Create a new Vue service project from scratch and apply the repository's boilerplate conventions. This is an execution skill: create files, install dependencies, wire configuration, and verify the generated project.

## Required Defaults

- Use `pnpm`.
- Start from `pnpm create vite@latest <project-name> --template vue-ts`.
- Use TypeScript.
- Include `vue`, `vite`, `pinia`, `vue-router@4`, `axios`, `sass`, `@musma/eslint-config-vue`, `prettier`, and `lint-staged`.
- Exclude tests by default. Do not install Vitest, Vue Test Utils, or Playwright.
- Exclude Husky. Provide a `lint:staged` script only.
- Use SCSS for global and component styles.
- Do not add a server-state query library by default.
- Do not add a UI component library by default.
- Follow `FOLDER_STRUCTURE.md` when it is present in the current repository or template.

## Quick Start

Run the bundled script from this skill:

```bash
node .codex/skills/create-vue-service/scripts/create-vue-service.mjs <project-name>
```

If this skill is installed outside the working repository, run the script by absolute path:

```bash
node /path/to/create-vue-service/scripts/create-vue-service.mjs <project-name>
```

Use `--force` only when the target directory may be overwritten.

## Workflow

1. Confirm the target project name or directory from the user request.
2. If a directory already exists and is non-empty, stop unless the user explicitly asked to overwrite it.
3. Run `scripts/create-vue-service.mjs <project-name>`.
4. Inspect generated files when the script completes.
5. Run verification in the generated project:

```bash
pnpm lint
pnpm build
```

6. Report created location, installed stack, verification result, and any skipped checks.

## Generated Structure

Generate a root-based Vite structure, not the default `src/` structure:

```text
public/
.vscode/
vite.config.ts
index.html
main.ts
router.ts
app.vue
assets/
layouts/
pages/
plugins/
features/
models/
swagger/
shared/
```

Create placeholder `.gitkeep` files for empty directories, including `plugins`, `models`, `swagger`, and leaf folders under `features` and `shared`.

## Generated Behavior

- `router.ts` uses explicit Vue Router route records.
- `pages/index.vue` is the home route.
- `pages/not-found.vue` is the fallback route.
- `main.ts` installs Pinia and Vue Router.
- `shared/stores/pinia.ts` exports `createAppPinia()`.
- `shared/stores/app.ts` exports a minimal `useAppStore`.
- `shared/api/http.ts` exports an axios instance with `baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'` and `withCredentials: true`.
- `assets/main.scss`, `assets/theme.scss`, and `assets/typography.scss` are minimal placeholders.
- `.env.example` contains `VITE_API_BASE_URL=/api`.

## Linting

Configure ESLint with `@musma/eslint-config-vue`:

```js
import musmaVueConfig from '@musma/eslint-config-vue'

export default musmaVueConfig
```

Configure scripts:

```json
{
  "lint": "eslint \"**/*.{ts,vue}\" --fix",
  "lint:staged": "lint-staged"
}
```

Configure `lint-staged` without Husky:

```json
{
  "*.{js,jsx,ts,tsx,vue}": "eslint --fix",
  "*.{css,scss,html,json,md,yml,yaml}": "prettier --write"
}
```

Do not add Git hooks unless the user asks for them separately.
