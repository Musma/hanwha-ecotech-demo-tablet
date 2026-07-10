# Swagger Workflow Decision Guide

Use this guide when deciding whether to bootstrap, generate, or stop and ask the user for missing inputs.

## Decision Tree

1. Inspect `package.json`.
   - If generation scripts already exist, prefer reusing them.
   - If generator dependencies are missing, bootstrap is needed.

2. Inspect `swagger/`.
   - If `swagger/templates` exists and looks intentional, reuse it.
   - If it is missing, bootstrap may need to copy starter templates.

3. Inspect the schema source.
   - If a URL or local file path is already defined in scripts or config, reuse it.
   - If not, ask the user for the schema URL or file path before writing scripts.

4. Inspect the output target.
   - If an output folder such as `src/models` already exists, avoid changing the convention unless the repository clearly expects a different path.
   - If no output folder exists, let bootstrap create one.

5. Choose the path.
   - Missing dependency or missing scripts or missing templates: use `$swagger-init`.
   - Setup already exists: skip bootstrap and run generation.

## Questions To Ask

Ask the user only when the answer is not already discoverable from the repository.

- "Swagger schema URL이 뭐야?"
- "로컬 schema 파일로 할까, 원격 URL로 할까?"

Do not ask for things the repository already defines.

## Verification Targets

After generation, inspect:

- Generated client entrypoints such as `src/models/index.ts`, `Api.ts`, `data-contracts.ts`, and `http-client.ts`
- App wrappers that import or instantiate the generated client
- Cheap verification commands such as TypeScript or lint runs
