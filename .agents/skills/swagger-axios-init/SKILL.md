---
name: swagger-axios-init
description: Align a generated Swagger API class with a repository's shared axios instance. Use when Codex needs to create or update the shared axios config, instantiate the generated Swagger API client, inject the axios instance into that client, or preserve a repository pattern where feature wrappers call methods on a shared Swagger-backed API instance.
---

# Swagger Axios Init

Handle only the shared API client wiring between axios and generated Swagger classes.

## Workflow

1. Inspect the existing shared API files.
   Read the axios config, the generated Swagger client entrypoints, and the shared API config module. Read [references/repo-swagger-axios-pattern.md](references/repo-swagger-axios-pattern.md) when working in KNE CP FE.

2. Reuse existing shared axios behavior.
   Keep interceptors, base URL logic, timeout settings, auth token behavior, and refresh flows that already exist in the repository.

3. Instantiate the generated client in one shared place.
   Prefer a shared module such as `src/config/api.ts` that creates the Swagger client once and injects the axios instance there.

4. Keep feature modules simple.
   Feature-level modules should import the shared API instance instead of constructing their own Swagger clients.

5. Verify the contract surface.
   Confirm that the generated class export, axios injection, and downstream wrapper imports still match.

## Notes

- Preserve the generated class naming that the repository already uses.
- Avoid scattering `new Api()` calls around the codebase.
- Keep auth-exempt requests separate when the repository already treats them differently.
