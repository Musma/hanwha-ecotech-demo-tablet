---
name: api-client-orchestrator
description: Orchestrate repository-specific API client setup work. Use when Codex needs to inspect the framework and existing architecture, decide how axios, generated Swagger clients, TanStack Query, and feature-level API wrappers should fit together, delegate focused setup work, and report the final integration plan or implementation path. Use this as the top-level skill for requests like "axios instance랑 tanstack query 연결해줘", "swagger 기반 api client 구조 만들어줘", or "api 세팅해줘".
---

# API Client Orchestrator

Lead the full API client setup workflow. Start by inspecting the repository, identify the framework and existing API architecture, then delegate the focused implementation steps to the smaller skills that handle Swagger plus axios wiring, TanStack Query setup, and feature-level wrapper patterns.

## Quick Flow

1. Inspect the framework and current setup.
2. Decide what is already present.
3. Use `$swagger-axios-init` if shared client wiring is missing or inconsistent.
4. Use `$tanstack-query-init` if QueryClient or Provider setup is missing or needs alignment.
5. Use `$api-wrapper-pattern` if feature API wrappers need to be added or normalized.
6. Verify that the pieces fit together and report the result.

## Workflow

1. Inspect the repository first.
   Read `package.json`, app entry files, router or provider setup, API config files, generated Swagger client files, and representative feature API wrappers. Read [references/repo-api-context.md](references/repo-api-context.md) for the KNE CP FE structure.

2. Identify the framework and runtime shape.
   Determine whether the repo is React, Next, Vue, or another framework before proposing TanStack Query setup. Use the repository's real app structure instead of assuming a generic entrypoint.

3. Preserve the current architecture when it already works.
   Reuse existing axios instances, generated Swagger clients, query clients, and wrapper function conventions instead of replacing them with a new pattern.

4. Delegate by responsibility.
   Use `$swagger-axios-init` for shared client wiring. Use `$tanstack-query-init` for QueryClient and Provider setup. Use `$api-wrapper-pattern` for feature API functions that wrap the generated client.

5. Verify the final integration points.
   Check app provider wiring, shared API exports, and representative feature modules that consume the setup.

## Delegation

- Use `$swagger-axios-init` for `axios.create`, generated Swagger class instantiation, and injection through a shared config module.
- Use `$tanstack-query-init` for framework-aware QueryClient setup and Provider integration.
- Use `$api-wrapper-pattern` for feature-level wrapper APIs that call the shared client and return `response.data`.
- Keep top-level investigation, sequencing, and reporting here.

## Reporting

- State which framework was detected.
- State which lower-level skills were needed.
- State which existing pieces were reused.
- State which integration points were changed or verified.
