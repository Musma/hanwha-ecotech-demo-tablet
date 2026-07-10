---
name: setup-shadcn-vue
description: Install and configure shadcn-vue in an existing Vite Vue project. Use when Codex needs to add shadcn-vue to a project that already has Vue 3, Tailwind CSS v4, TypeScript, and @ alias support, while following FOLDER_STRUCTURE.md by placing UI components under shared/components/ui and utilities under shared/helpers.
---

# Setup shadcn-vue

## Overview

Add shadcn-vue to an existing Vue service project. This skill is execution-oriented: run the bundled script, patch aliases to match `FOLDER_STRUCTURE.md`, add the default `button` and `input` components, and verify the project.

## Required Defaults

- Use `pnpm dlx shadcn-vue@latest`.
- Use Vite mode with no `src` directory.
- Use the Reka base, vega style, lucide icons, inter font, and neutral base color.
- Keep Tailwind CSS v4 config with an empty Tailwind config path.
- Place generated UI components in `shared/components/ui`.
- Place shadcn utility helpers in `shared/helpers/utils.ts`.
- Add `button` and `input` by default.
- Do not add Husky or test tools.

## Quick Start

From the Vue project root:

```bash
node .codex/skills/setup-shadcn-vue/scripts/setup-shadcn-vue.mjs
```

If the skill is outside the project root, run it by absolute path:

```bash
node /path/to/setup-shadcn-vue/scripts/setup-shadcn-vue.mjs --cwd /path/to/project
```

## Workflow

1. Confirm the target directory contains a Vue service project.
2. Run `scripts/setup-shadcn-vue.mjs --cwd <project>`.
3. Inspect `components.json` and generated files.
4. Run:

```bash
pnpm lint
pnpm build
```

5. Report generated component paths and verification results.

## Generated Paths

Expected paths:

```text
components.json
shared/components/ui/button/
shared/components/ui/input/
shared/helpers/utils.ts
```

If the CLI creates default `components/` or `lib/` folders, the script removes or migrates them after patching aliases.
