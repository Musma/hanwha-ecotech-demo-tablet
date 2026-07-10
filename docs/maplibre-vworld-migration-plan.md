# MapLibre + VWorld Migration Plan

## Goal

Mapbox GL JS runtime, Mapbox style URLs, and Mapbox token requirements will be removed and replaced with MapLibre GL JS + VWorld WMTS.

Final target:

- Remove `mapbox-gl` from package dependencies.
- Remove runtime dependency on `VITE_MAPBOX_ACCESS_TOKEN`.
- Use VWorld satellite/base and OSM fallback styles.
- Keep existing dashboard and jibun yard map behavior.
- Use neutral `map` naming for shared map code.

## Progress

- 2026-06-30: Phase 1 completed. Added shared MapLibre style builder in `src/shared/constants/map.ts`.
- 2026-06-30: Phase 2 completed. Replaced jibun yard map runtime with MapLibre + VWorld/OSM styles.
- 2026-06-30: Phase 3 completed. Removed unused Mapbox base component and Mapbox token/style constants.
- 2026-06-30: Phase 4 completed. Renamed shared map folders/files/types from `mapbox` to `map`.
- 2026-06-30: Phase 5 completed. Removed direct `mapbox-gl` dependency from `package.json` and `pnpm-lock.yaml`.
- Remaining work: visual QA in a browser with a VWorld API key.

## Current Code Shape

Dashboard:

- `src/features/logged/dashboard/components/dashboard-yard-map.vue`
- Uses `getMapLibreStyle()` from `src/shared/constants/map.ts`.

Jibun yard map:

- `src/features/logged/jibun/components/jibun-yard-map.vue`
- `src/shared/components/map/yard-map.vue`
- `src/shared/composables/map/*`
- `src/shared/helpers/map/*`
- `src/shared/types/map/*`
- `src/shared/constants/map-common.ts`
- `src/shared/constants/map-yard.ts`
- `src/assets/css/vendors/map.css`

`package.json` no longer contains `mapbox-gl`.

`pnpm-lock.yaml` can still contain `@mapbox/*` entries because `maplibre-gl` depends on some Mapbox-origin utility packages internally. The direct `mapbox-gl` package and source imports are removed.

## Phase 1. Shared MapLibre Style Foundation

Status: completed.

Scope:

- Add VWorld satellite/base style builder.
- Add OSM fallback style.
- Share the style builder between dashboard and jibun maps.

Done:

- Added `src/shared/constants/map.ts`.
- Dashboard and jibun map now use the shared builder.

## Phase 2. Jibun Map Runtime Migration

Status: completed.

Scope:

- Replace `mapbox-gl` runtime initialization with `maplibre-gl`.
- Remove Mapbox token requirement from the jibun map.
- Replace Mapbox style URLs with VWorld/OSM `StyleSpecification`.
- Preserve custom source/layer restoration after style changes.

Done:

- `src/shared/components/map/yard-map.vue` initializes `maplibre-gl`.
- The map uses `getMapLibreStyle(props.mapStyle)`.
- Error messaging no longer asks for `VITE_MAPBOX_ACCESS_TOKEN`.

## Phase 3. Remove Mapbox Runtime Surface

Status: completed.

Scope:

- Remove unused Mapbox-only base component.
- Remove Mapbox token/style constants.
- Replace Mapbox GL type imports with MapLibre GL type imports.

Done:

- Deleted `src/shared/components/mapbox/mapbox-base-map.vue`.
- Removed Mapbox style/token constants from the shared constants layer.
- Replaced helper type imports with `maplibre-gl`.

## Phase 4. Rename Mapbox Naming To Map

Status: completed.

Scope:

- `shared/components/mapbox` -> `shared/components/map`
- `shared/composables/mapbox` -> `shared/composables/map`
- `shared/helpers/mapbox` -> `shared/helpers/map`
- `shared/types/mapbox` -> `shared/types/map`
- `shared/assets/mapbox` -> `shared/assets/map`
- `mapbox.css` -> `map.css`
- `Mapbox*` public type/function/component names -> neutral `Map*` or `YardMap*` names.

Done:

- Source paths no longer contain `mapbox`.
- `rg "mapbox|Mapbox|MAPBOX" src FOLDER_STRUCTURE.md DESIGN.md .env.example` returns no matches.

## Phase 5. Remove Package Dependency

Status: completed.

Scope:

- Removed `mapbox-gl` from `package.json`.
- Updated `pnpm-lock.yaml`.
- Confirmed no source import depends on `mapbox-gl`.
- Ran type check, token check, and production build.

Command used:

```sh
pnpm --store-dir /Users/dave/Library/pnpm/store/v11 remove mapbox-gl
```

The explicit store path was required because the existing `node_modules` was linked from `/Users/dave/Library/pnpm/store/v11`.

## Verification Checklist

- `./node_modules/.bin/vue-tsc --noEmit`
- `node scripts/design-tokens/check-tokens.mjs`
- `./node_modules/.bin/vite build`
- `/dashboard` map renders.
- `/jibun` map renders.
- VWorld satellite/base/OSM style selection works.
- Jibun polygon selection and focus work.
- CAD overlay, grid, markers, route markers, and drawing overlays survive style reloads.
