---
name: swagger-init
description: Bootstrap Swagger client generation in a repository that is missing the initial setup. Use when Claude Code needs to add Swagger generation scripts, add missing generator dependencies, create or copy starter templates, create output folders, or perform first-time setup after an orchestrator decides the project is not ready yet. Do not use this as the top-level decision maker for the overall Swagger workflow.
---

# Swagger Init

Handle bootstrap work only. This skill is responsible for making a repository ready to generate Swagger clients for the first time. Let a higher-level coordinator decide whether bootstrap is actually needed.

If a `swagger-orchestrator` skill is available, expect it to decide when to call this skill.

## Workflow

1. Confirm bootstrap is needed.
   Use this skill when the repository is missing one or more of these basics: generator dependency, `package.json` generation scripts, output directory, or `swagger/templates`. If the repository already has a working setup, stop and let the orchestrator move to generation instead.

2. Resolve the schema source.
   If the repository does not already define the schema source URL or file path, ask the user for it before writing scripts. After the user provides the value, write it into the chosen script or config path instead of leaving placeholders unresolved.

3. Add missing generator tooling.
   If `swagger-typescript-api` or another required generator package is missing, add it to `devDependencies` and run the install command yourself. Do not stop after editing `package.json`.

4. Create missing project structure.
   Add the required directories such as `src/models`, `swagger`, and `swagger/templates` when they do not exist yet.

5. Create starter scripts.
   Add repository-appropriate `package.json` scripts for initialization and generation. Reuse the repository's existing script style when available.

6. Apply the required template source.
   Use `/Users/dave/Documents/React/kne-cp-fe/swagger/templates` as the source of truth for Swagger templates. If the target project needs templates created or refreshed, copy from that repository path and keep the copied files aligned with that source. Do not substitute different starter templates.

7. Hand control back to the orchestrator.
   After bootstrap is complete, report what was added and whether the repository is now ready for a generate step.

## Outputs

After bootstrap, the repository should have:

- Installed generator dependencies
- Added or updated `package.json` scripts
- Created `swagger/templates` if it was missing
- Copied starter templates when needed
- Created output folders such as `src/models` if they were missing

## Notes

Prefer concise reporting.

- State which dependency was installed.
- State which scripts were added or changed.
- State whether the schema URL came from the user or an existing repository value.
- State whether templates were copied from `/Users/dave/Documents/React/kne-cp-fe/swagger/templates`.
- State whether the repository is now ready for generation.
