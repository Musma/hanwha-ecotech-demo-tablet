# KNE CP FE API Client Context

Use this reference when the target repository matches `/Users/dave/Documents/React/kne-cp-fe`.

## Framework detection

- `package.json` uses `vite` and `react`, not Next.js or Vue.
- `src/main.tsx` renders with `createRoot`.
- `src/App.tsx` wraps the app with `QueryClientProvider`, `RouterProvider`, and `ReactQueryDevtools`.
- The repository is a Vite React application with React Router.

## Existing shared API architecture

- `src/config/axios.ts` exports a shared axios instance.
- `src/config/api.ts` creates the generated Swagger client and injects the shared axios instance into it.
- `src/config/query-client.ts` exports a shared `QueryClient`.
- Feature API modules usually import `apiInstance` from `@/config/api`.

## Existing wrapper pattern

- Generated Swagger client methods return an Axios response.
- Feature wrappers usually await the method call and return `response.data`.
- Many modules import generated DTO types from `@/models`.
- Third-party APIs can still use raw `axios` directly when they are outside the backend Swagger surface.

## Recommended skill split

- `$swagger-axios-init`: shared client wiring
- `$tanstack-query-init`: QueryClient and Provider integration
- `$api-wrapper-pattern`: feature wrapper functions
