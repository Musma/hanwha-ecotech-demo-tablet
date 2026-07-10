---
name: design-rules-doc
description: Create or update a project DESIGN.md from a Figma-exported PDF, Markdown design guide, or existing design token documentation, then connect it to CLAUDE.md so future agents must follow the UI design and Vue component structure rules. Use when Claude Code needs to turn visual design guidelines into actionable frontend implementation rules for agents.
---

# Design Rules Doc

## Purpose

Create a `DESIGN.md` that agents can use as the source of truth when implementing UI. The document must translate a design guide into concrete rules for visuals, layout, components, tokens, responsive behavior, and project-specific Vue implementation boundaries.

Also update `CLAUDE.md` so future UI work must read `DESIGN.md` before creating or modifying screens.

## Inputs

Accept any of these source formats:

- Figma-exported PDF design guide.
- Markdown design guide.
- Existing token docs, screenshots, or style notes supplied by the user.

If the source file is a PDF, extract or inspect its text and visual content before writing `DESIGN.md`. If extraction is incomplete, state what could not be read and avoid inventing missing token values.

## Required Project Context

Before writing or updating `DESIGN.md`, inspect the project:

- Read `CLAUDE.md`.
- Read `ARCHITECTURE.md` and `FOLDER_STRUCTURE.md` when present.
- Inspect existing style and token files such as `assets/theme.css`, `assets/typography.css`, `assets/tailwind.css`, `assets/main.css`, `tailwind.config.*`, or equivalent.
- Inspect existing shared UI primitives under paths such as `shared/components`.
- Inspect relevant package and framework files when needed to confirm Vue, Tailwind, shadcn, icon libraries, or component conventions.

Prefer existing project structure and naming over generic frontend advice.

## Workflow

1. Identify the design source file and project root.
2. Extract the source design rules:
   - color tokens
   - typography scale
   - spacing scale
   - radius
   - shadow/elevation
   - icons
   - layout grid
   - breakpoints
   - component states
   - accessibility constraints
3. Compare source rules with current project structure and existing tokens.
4. Create or update `DESIGN.md` using the template in `references/design-md-template.md`.
5. Add or update a `CLAUDE.md` section requiring agents to read `DESIGN.md` before UI work.
6. Validate that `DESIGN.md` contains implementation-level rules, not only visual descriptions.
7. Report unresolved gaps, especially missing token values or conflicts between Figma, current CSS, and project architecture docs.

## DESIGN.md Rules

The generated document must be actionable for another agent. It should say where to place UI code, which existing primitives to reuse, which token files to edit, and which visual choices are forbidden.

Include these sections unless clearly irrelevant:

- Purpose
- Source Of Truth
- Design Token Rules
- Color
- Typography
- Spacing
- Radius
- Shadow and Elevation
- Icons
- Layout
- Responsive Behavior
- Component Rules
- Vue Implementation Rules
- Accessibility Rules
- Do / Don't
- Conflict Resolution
- Agent Checklist

Use exact token names and file paths when available. If a value is missing, write `TBD` with a short note rather than guessing.

## CLAUDE.md Connection

Add a concise design rules section to `CLAUDE.md` if it is missing. Use or adapt the snippet in `references/agents-design-section.md`.

The section must require:

- Reading `DESIGN.md` before creating or modifying UI.
- Following `DESIGN.md` for visual styling, component usage, layout, and responsive behavior.
- Reporting conflicts between `DESIGN.md`, architecture docs, folder structure docs, and existing implementation.

Do not duplicate the full `DESIGN.md` content inside `CLAUDE.md`.

## Quality Bar

Before finishing, verify:

- `DESIGN.md` ties design rules to actual project files and folders.
- Token rules discourage arbitrary hex colors, font sizes, spacing values, radius values, and shadows.
- Component rules tell agents when to use `shared/components` versus feature components.
- Vue rules align with the project's architecture and folder structure.
- The AGENTS connection is short and points to `DESIGN.md`.
- No source-only claims are invented when the PDF/MD lacks that detail.

If the project uses git rules requiring validation or commits, follow the repository instructions after edits.

