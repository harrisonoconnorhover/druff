# Project Overview — Druff

> **What every agent should know before touching this repo.** This is the north star.
> When a product decision is made, append it to the Decision Log at the bottom — this file is
> the single source of truth for "why is it this way."
>
> **Status: placeholder.** This file mirrors the structure of Dander's
> `steering/00-project-overview.md` but the actual product scope, modules, and non-goals below
> are not yet defined — fill them in once the specific frontend project is described.

## One-liner

Druff is the front-end companion to **Dander** (`../dander`), an open-source GCP-native EL(T)
suite. Dander's `pipeline` package defines a durable YAML/JSON pipeline-graph format — nodes with
field schemas, edges with field mappings/transformations/joins — described as the storage format
"behind a future drag-drop UI." Druff is that UI. (Refine this once the exact product surface is
scoped — visual graph editor only? Also a run/monitoring dashboard? TBD.)

## Why this exists

- Dander's pipeline-graph model (see Dander's `steering/00-project-overview.md` and
  `src/dander/pipeline/README.md`) is authored either programmatically or via this UI — Druff is
  the human-facing half of that.
- Kept as a **separate repo** from Dander so its toolchain, CI, and release cadence don't inherit
  Dander's Python/GCP/Terraform constraints (see Dander's Decision Log, 2026-07-22).

## Contract with Dander

- TODO: how is the pipeline-graph schema shared? Likely candidate: Dander exports
  `PipelineGraph.model_json_schema()` (Pydantic) as a versioned artifact Druff consumes, rather
  than Druff importing Dander's Python types directly.
- TODO: how does Druff read/write actual graph files during development — talk to a running
  Dander instance, a local file, or both?

## Modules (target architecture — TBD)

| Module | Responsibility |
|---|---|
| TBD | TBD — fill in once the product is scoped (e.g. graph canvas/editor, node/field inspector, validation-error surface, run history view, …). |

## Scope discipline (non-goals)

- TBD.

## Tech stack

- TBD — framework, language, package manager, and build tooling not yet chosen. Once decided,
  add `steering/languages/<stack>.md` (mirroring Dander's `languages/python.md` pattern) and a
  matching `code-<stack>` agent under `.claude/agents/`.

---

## Decision Log

Append newest at top. Format: `- YYYY-MM-DD — decision — rationale`.

- 2026-07-22 — **Druff scaffolded as a separate repo from Dander** — steering files and agent
  workforce ported from Dander's governance-first bootstrap and adapted (project name, ticket
  prefix DRUFF-<n>, stack-specific pieces left as placeholders). See Dander's Decision Log entry
  the same date for the separate-repo rationale (independent toolchain/CI/release cadence; schema
  shared via an explicit contract rather than direct type imports).
