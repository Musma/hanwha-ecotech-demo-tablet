---
name: tanstack-query-init
description: Set up or align TanStack Query for the detected frontend framework. Use when Codex needs to determine the framework flavor first, install the correct TanStack Query package for that framework, create or update the shared QueryClient, wire the Provider into the actual app entry structure, or preserve repository-specific query defaults and error handling.
---

# TanStack Query Init

Handle framework-aware TanStack Query setup only.

## Workflow

1. Detect the framework before changing anything.
   Inspect the app entry files and package dependencies to decide whether the project uses React, Next, Vue, or another supported environment. Read [references/repo-query-pattern.md](references/repo-query-pattern.md) when working in KNE CP FE.

2. Use the framework-correct TanStack Query package.
   Do not assume React by habit. Match the real framework before suggesting imports, provider names, or setup files.

3. Reuse existing provider structure.
   If the repository already has a QueryClient and Provider, align with it instead of replacing it. If it is missing, add the shared QueryClient in a config-style module and inject the Provider at the real app root.

4. Preserve repository defaults.
   Keep existing error handling, retry behavior, refetch settings, and devtools behavior when the repository already defines them.

5. Verify feature usage.
   Confirm that existing `useQuery`, `useMutation`, or invalidation helpers still match the configured QueryClient shape.

## Notes

- Provider location depends on framework and app structure, so always inspect first.
- Prefer one shared QueryClient module rather than inline client construction in the root render path.
