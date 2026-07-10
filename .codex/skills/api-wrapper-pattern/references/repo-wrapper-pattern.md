# KNE CP FE API Wrapper Pattern

Use this reference when the target repository matches `/Users/dave/Documents/React/kne-cp-fe`.

## Core pattern

Feature API modules usually:

- import `apiInstance` from `@/config/api`
- import generated DTO types from `@/models`
- define local query or payload helper types near the wrapper
- call one generated Swagger method
- return `response.data`

## Representative examples

- `src/features/apps/users/api/index.ts`
- `src/shared/api/index.ts`

These wrappers keep components and hooks away from raw transport details.

## Exception pattern

Some external APIs still use raw `axios` directly, such as auth login or third-party requests. Do not force those through the generated Swagger client when they are intentionally outside the backend Swagger surface.
