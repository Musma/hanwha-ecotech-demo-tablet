# KNE CP FE TanStack Query Pattern

Use this reference when the target repository matches `/Users/dave/Documents/React/kne-cp-fe`.

## Framework

- This is a Vite React app.
- Use `@tanstack/react-query`, not Vue Query or Next-specific patterns.

## Existing QueryClient structure

`src/config/query-client.ts` currently exports one shared `QueryClient` with:

- custom `QueryCache` and `MutationCache`
- shared `errorHandler`
- repository-specific defaults for retries, window focus refetching, stale time, and gc time

Reuse that module if possible instead of replacing it.

## Provider location

`src/App.tsx` currently wraps the app with:

- `QueryClientProvider`
- `RouterProvider`
- `ReactQueryDevtools`

That is the source of truth for the shared TanStack Query wiring in this repository.

## Related usage patterns

- Feature pages and components call `useQuery`, `useMutation`, `useInfiniteQuery`, and `useQueries`.
- `src/shared/hooks/use-invalidate-quries.ts` wraps `useQueryClient` for invalidation helpers.
