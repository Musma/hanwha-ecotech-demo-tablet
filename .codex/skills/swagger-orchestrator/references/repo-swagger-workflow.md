# KNE CP FE Swagger Workflow

Use this reference when working inside `/Users/dave/Documents/React/kne-cp-fe` or a repo with the same structure.

## Relevant files

- `package.json`
- `swagger/templates/api.ejs`
- `swagger/templates/route-types.ejs`
- `swagger/templates/procedure-call.ejs`
- `src/models/index.ts`
- `src/models/Api.ts`
- `src/models/data-contracts.ts`
- `src/models/http-client.ts`
- `src/config/api.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`

## Existing generation command

Use the package script first.

```bash
pnpm swagger-api
```

This repository already has custom templates under `swagger/templates`, and those files are the required source of truth. If another project needs the same template set, copy from this repository path rather than using alternate starter assets.

At the time of inspection, `package.json` defines:

```bash
swagger-typescript-api generate \
  -p https://kne-api.musma.net/docs-json \
  -r \
  -o ./src/models \
  --modular \
  -d \
  --extract-request-body \
  --extract-response-body \
  --extract-response-error \
  --axios \
  --templates ./swagger/templates
```

## What this repo expects

- Generate into `src/models`.
- Keep modular output with `Api.ts`, `data-contracts.ts`, `http-client.ts`, and `index.ts`.
- Keep Axios mode enabled.
- Keep the custom templates under `swagger/templates`.
- Preserve the current import surface because the app imports many DTO and model types from `@/models`.

## Integration points to check

`src/config/api.ts` instantiates the generated `Api` class and swaps in the shared Axios instance.

Important downstream assumptions:

- `@/models` re-exports generated files through `src/models/index.ts`.
- Feature modules import many DTOs directly from `@/models`.
- Auth code also imports specific contracts from `@/models/data-contracts`.

If generation changes export names or file names, the app will break widely.

## Workflow-specific rule

- Use `/Users/dave/Documents/React/kne-cp-fe/swagger/templates` as the template source of truth.
