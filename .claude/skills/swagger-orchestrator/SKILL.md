---
name: swagger-orchestrator
description: Orchestrate the end-to-end Swagger client workflow in a repository. Use when Claude Code needs to investigate the current Swagger setup, decide whether initialization is required, ask the user for a missing schema URL, delegate first-time setup to a bootstrap skill, run generation, verify the generated output, and report the result. Use this as the top-level skill for requests like "스웨거 초기화", "Swagger 세팅해줘", or "Swagger client 다시 생성해줘".
---

# Swagger Orchestrator

Lead the overall Swagger workflow. This skill decides what the repository needs, asks the user only for missing high-impact inputs such as the schema URL, delegates first-time setup to `swagger-init` when appropriate, then runs generation and verifies the result.

## Quick Flow

1. Inspect the repository.
2. Decide whether bootstrap is needed.
3. Ask for the schema URL only if the repository does not already define one.
4. Use `swagger-init` if setup is incomplete.
5. Run generation with the repository's conventions.
6. Verify generated outputs and integration points.
7. Report what happened, including installation, URL source, and changed files.

## Workflow

1. Inspect the current setup first.
   Check `package.json`, lockfiles, `swagger/`, generated client folders such as `src/models`, and any existing scripts or templates. Read [references/workflow-decision-guide.md](references/workflow-decision-guide.md) for the decision tree. When working in `kne-cp-fe`, also read [references/repo-swagger-workflow.md](references/repo-swagger-workflow.md).

2. Decide between bootstrap and generate.
   If the repository is missing generator dependencies, generation scripts, or usable templates, call `swagger-init` to prepare the project. If the repository already looks ready, skip bootstrap.

3. Resolve the schema source.
   If the repository already defines a Swagger or OpenAPI URL or local schema file, reuse it. If not, ask the user for the target URL or file path before proceeding. Once the user provides it, write it into the script or config instead of leaving a placeholder.

4. Preserve repository conventions.
   Keep the project's output path, HTTP client mode, template directory, file naming conventions, and existing script structure.

5. Run install steps directly when needed.
   If bootstrap adds missing dependencies, ensure the actual install command is run. Do not leave dependency installation as a manual user follow-up unless blocked by the environment.

6. Run generation.
   Prefer an existing package script. If generation would overwrite tracked outputs, inspect the current generated files first and avoid reverting unrelated edits.

7. Verify the result.
   Re-open key generated files and downstream integration points. If there is a cheap TypeScript or lint verification command, use it.

## Delegation

- Use `swagger-init` for first-time setup and bootstrap work.
- Keep orchestration responsibilities here: investigation, decision-making, user questions, generation, verification, and reporting.
- Do not duplicate bootstrap logic here when `swagger-init` can handle it cleanly.

## Reporting

Report the outcome clearly.

- State whether bootstrap was needed.
- State whether `swagger-init` was used.
- State where the schema source came from.
- State which install and generation commands ran.
- State which important files changed.
- State whether the repository templates came from `/Users/dave/Documents/React/kne-cp-fe/swagger/templates`.
- Mention any follow-up risk or manual decision left to the user.
