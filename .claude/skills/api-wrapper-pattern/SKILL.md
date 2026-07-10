---
name: api-wrapper-pattern
description: Create or align feature-level API wrapper functions on top of a shared generated client. Use when Claude Code needs to turn raw Swagger method calls into repository-style wrapper functions, organize feature API modules, normalize request and response handling, or preserve patterns such as returning `response.data` from a shared API instance.
---

# API Wrapper Pattern

Handle feature-level wrapper API modules only.

## Workflow

1. Inspect representative feature API files.
   Read the existing wrapper modules that call the shared API instance and return normalized data. Read [references/repo-wrapper-pattern.md](references/repo-wrapper-pattern.md) when working in KNE CP FE.

2. Reuse the repository's wrapper style.
   Preserve file placement, naming, local query type definitions, comments, and the pattern of returning `response.data` from the shared API client.

3. Keep raw transport details out of components.
   Put Swagger method calls in feature API modules so TanStack Query hooks and UI code stay focused on behavior instead of request plumbing.

4. Treat external APIs separately.
   If the repository already uses direct `axios` for third-party services, do not force those calls through the generated Swagger client.

5. Verify downstream compatibility.
   Confirm that wrapper return types and argument shapes still match the consuming hooks or components.

## Notes

- Prefer small focused wrapper functions per feature area.
- Keep generated DTO imports coming from the shared generated client surface the repository already uses.
