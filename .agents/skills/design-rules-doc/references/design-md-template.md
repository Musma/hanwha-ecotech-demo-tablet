# DESIGN.md

## Purpose

This document defines the UI design and implementation rules that agents must follow when creating or modifying screens in this project.

## Source Of Truth

- Design guide: `[source file name]`
- Project architecture: `ARCHITECTURE.md`
- Project folder structure: `FOLDER_STRUCTURE.md`
- Token files: `[list actual files]`
- Shared UI primitives: `[list actual folders]`

## Design Token Rules

- Use existing project tokens before adding new values.
- Do not use arbitrary color, spacing, radius, shadow, or font values when a token exists.
- Add new tokens only when the design guide defines them or the user approves them.
- If a design value is missing from the source guide, mark it as `TBD` instead of guessing.

## Color

Document:

- token name
- value
- purpose
- allowed usage
- forbidden usage

## Typography

Document:

- font family
- text styles
- size
- line-height
- weight
- usage context

## Spacing

Document:

- spacing scale
- page padding
- section gap
- form gap
- table/list density

## Radius

Document:

- radius scale
- component usage
- forbidden over-rounding rules

## Shadow And Elevation

Document:

- shadow tokens
- overlay/elevation rules
- surfaces that may or may not use shadows

## Icons

Document:

- icon library
- size rules
- stroke/fill rules
- button icon rules
- when labels are required

## Layout

Document:

- app shell structure
- page width
- grid rules
- content density
- empty/loading/error placement
- modal/drawer patterns

## Responsive Behavior

Document:

- breakpoints
- mobile stacking rules
- table/list behavior
- navigation behavior
- touch target rules

## Component Rules

For each important primitive or pattern, define:

- when to use it
- props/API expectations if known
- states required
- visual restrictions
- file or folder location

Recommended component coverage:

- button
- input
- select
- checkbox/radio/switch
- table/data grid
- card/panel
- dialog/modal/drawer
- tabs/segmented controls
- toast/alert
- empty/loading/error states

## Vue Implementation Rules

- Page components should focus on route-level composition.
- Feature UI should live under `features/[scope]/[domain]/components` unless the project defines a different structure.
- Domain state and side effects should move into feature composables.
- Shared UI primitives should live under `shared/components`.
- Vue-independent helpers should live under `shared/helpers`.
- Reuse existing primitives before creating new ones.
- Do not create a large feature container that contains all sections, API calls, state, and complex template logic.

## Accessibility Rules

Document:

- contrast requirements
- focus states
- keyboard behavior
- aria labeling
- form error behavior
- disabled/loading states

## Do / Don't

Use short, concrete implementation rules.

Do:

- `[project-specific allowed pattern]`

Don't:

- `[project-specific forbidden pattern]`

## Conflict Resolution

- If `DESIGN.md` conflicts with the source design guide, report the conflict to the user.
- If `DESIGN.md` conflicts with `ARCHITECTURE.md` or `FOLDER_STRUCTURE.md`, report the conflict before editing.
- If existing implementation conflicts with `DESIGN.md`, prefer the documented design rule only after confirming the change is in scope.

## Agent Checklist

Before UI work:

- Read `DESIGN.md`.
- Read `ARCHITECTURE.md` and `FOLDER_STRUCTURE.md` when changing Vue structure.
- Identify existing tokens and primitives before adding new ones.

Before finishing UI work:

- Check token usage.
- Check component placement.
- Check responsive behavior.
- Check empty/loading/error states.
- Check accessibility states.
