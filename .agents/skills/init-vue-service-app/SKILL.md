---
name: init-vue-service-app
description: Orchestrate Vue service app initialization. Use when Codex needs to create a new Vue service project by running create-vue-service with verification after project creation. shadcn-vue setup is handled separately by the setup-shadcn-vue skill when requested.
---

# Init Vue Service App

## Overview

Create a new Vue service application by delegating to `create-vue-service`. shadcn-vue setup is intentionally separate and should be run through `setup-shadcn-vue` only when the user asks for it.

## Orchestration

Run in this order:

1. `create-vue-service`

Use the bundled script:

```bash
node .Codex/skills/init-vue-service-app/scripts/init-vue-service-app.mjs <project-name>
```

If installed outside the working repository:

```bash
node /path/to/init-vue-service-app/scripts/init-vue-service-app.mjs <project-name> --skills-root /path/to/.Codex/skills
```

## Workflow

1. Confirm the target project name or directory.
2. Run the orchestrator script.
3. Verify in the generated project:

```bash
pnpm lint
pnpm build
```

4. Report the base Vue service creation result.

## Output

The final project includes the base Vue service stack:

```text
Vite
Vue 3
TypeScript
Pinia
Vue Router
SCSS
axios
ESLint
lint-staged
```

To add shadcn-vue after initialization, use the separate `setup-shadcn-vue` skill.
