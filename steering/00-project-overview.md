# Project Overview — Druff

> **What every agent should know before touching this repo.** This is the north star.
> When a product decision is made, append it to the Decision Log at the bottom — this file is
> the single source of truth for "why is it this way."
>
> **Status:** stack decided, product scoping in progress. Modules/non-goals below reflect the
> first working description of the product (2026-07-22) — refine as it's built out.

## One-liner

Druff is the front-end companion to **Dander** (`../dander`), an open-source GCP-native EL(T)
suite. Dander's `pipeline` package defines a durable YAML/JSON pipeline-graph format — nodes with
field schemas, edges with field mappings/transformations/joins — described as the storage format
"behind a future drag-drop UI." Druff is that UI: a lightweight, canvas-based editor for building
and visualizing Dander pipeline graphs by dragging, dropping, and wiring together the object types
below.

## Why this exists

- Dander's pipeline-graph model (see Dander's `steering/00-project-overview.md` and
  `src/dander/pipeline/README.md`) is authored either programmatically or via this UI — Druff is
  the human-facing half of that.
- Kept as a **separate repo** from Dander so its toolchain, CI, and release cadence don't inherit
  Dander's Python/GCP/Terraform constraints (see Dander's Decision Log, 2026-07-22).

## Contract with Dander

- `PipelineGraph` is the canonical document Druff edits. Dander's localhost single-file service
  owns validation, optimistic concurrency, canonical serialization, and atomic file replacement.
- The deployed version-1 `dander.yaml` manifest remains a separate contract. Druff may import it
  into a detached one-way projection, but does not write it back or deploy it.
- Druff preserves every field in Dander's current graph model, patches only editor-owned fields,
  and fails loud on unknown fields. Model equivalence is guaranteed; YAML formatting/comments are
  not preserved.

## Modules (target architecture)

Each row below is a **draggable node kind** on the canvas, backed by Dander's `Node`/`Edge` model
(see Dander's `src/dander/pipeline/README.md`). This is a UI/authoring layer only — none of these
execute in the browser; Druff produces/edits the pipeline-graph YAML/JSON and Dander runs it.

| Module | Responsibility |
|---|---|
| **Canvas** | The React Flow surface: pan/zoom, drag nodes from a palette, draw/redraw edges between handles, minimap, selection, undo/redo. |
| **Pre-made connectors** | Config-driven node types for popular sources (Salesforce, Greenhouse, NetSuite, Marketo, …) — a form over each connector's known config shape, no code. |
| **Custom API connectors** | A node type where the user writes and saves reusable custom code (Python) with parameters, for sources with no pre-made connector. |
| **Transform layers** | A node type where the user writes custom transform code (BigQuery SQL, per Dander's Transform module) against upstream fields — direct mapping, expression, constant, or join, per Dander's DANDER-5/6/7 field-mapping model. |
| **Write layers** | Pre-made or custom node types mirroring Dander's write patterns (SCD1/SCD2/snapshot/incremental) as a target. |
| **Pipelines** | A container/grouping of the above into one executable graph — the top-level thing a user builds and saves. |
| **Triggers** | A configurable node representing what starts a pipeline run (schedule, webhook/event) — maps to a Cloud Function/Cloud Run trigger on Dander's side. |
| **Validation surface** | Inline display of Dander's `graph_ops` validation errors (dangling edge, cycle, unknown field, …) directly on the offending node/edge, not a separate log. |
| **Graph source view** | A read/edit toggle between the visual canvas and the underlying YAML/JSON, since Dander's graph format round-trips both ways. |

## Scope discipline (non-goals)

- **Druff never executes user code.** Custom connector/transform snippets are authored and stored
  here; Dander executes them. No client-side Python/SQL runtime, no "run preview" that evaluates
  arbitrary user code in the browser.
- Not a general low-code app builder — the canvas only models Dander's pipeline-graph primitives
  (nodes/edges/fields/mappings/joins/triggers), not arbitrary UI/logic.
- Single-user editing for now (no real-time multiplayer) — see Decision Log.

## Tech stack

- **Next.js (App Router) + React + TypeScript** — see `steering/languages/typescript.md`.
- **React Flow (`@xyflow/react`)** for the node/edge canvas.
- **Tailwind CSS + shadcn/ui** for styling and components.
- **Zustand** for canvas/app state.
- **Monaco Editor** for embedded code widgets (Python/SQL snippets).
- **pnpm** for package management.

---

## Decision Log

Append newest at top. Format: `- YYYY-MM-DD — decision — rationale`.

- 2026-08-03 — **Dander-backed single-file persistence with `PipelineGraph` canonical** — Druff
  uses explicit Open/Save through a loopback-only Dander API. The operator chooses one file when
  starting Dander; conditional writes prevent stale overwrites, and Dander remains the validation
  and filesystem authority. Execution/deployment stay separate until graph runtime binding exists.

- 2026-08-03 — **Import `dander.yaml` as a one-way local visualization draft** — the hosted
  manifest is the real deployed contract today, while Druff's graph format is not an execution
  input. Projecting schedule/source/model structure gives immediate value without changing Dander
  or inventing unsafe write-back semantics; exports are explicitly named Druff drafts.

- 2026-07-22 — **Druff never executes user code** — custom connector/transform snippets are
  authored and stored, never run client-side. Keeps the frontend genuinely lightweight and avoids
  running arbitrary user Python/SQL in the browser; execution is Dander's job.
- 2026-07-22 — **Single-user editing, no real-time multiplayer (for now)** — avoids a CRDT
  sync layer (Yjs/Liveblocks) and hosted sync infra before there's a working single-user editor.
  Explicitly revisitable; the state model (Zustand-backed) doesn't preclude adding it later.
- 2026-07-22 — **Stack = Next.js (App Router) + TypeScript, React Flow, Tailwind + shadcn/ui,
  Zustand, Monaco, pnpm** — React Flow is purpose-built for a draggable/custom-node/redrawable-edge
  canvas; Next.js chosen over a plain Vite SPA per explicit preference; Tailwind + shadcn/ui over a
  batteries-included library (e.g. Mantine) for full control over a distinctive node-editor look;
  Zustand over Redux as React Flow's own recommended pairing; Monaco for real code editing
  (Python/SQL, not a plain textarea) in connector/transform nodes.
- 2026-07-22 — **Druff scaffolded as a separate repo from Dander** — steering files and agent
  workforce ported from Dander's governance-first bootstrap and adapted (project name, ticket
  prefix DRUFF-<n>, stack-specific pieces left as placeholders). See Dander's Decision Log entry
  the same date for the separate-repo rationale (independent toolchain/CI/release cadence; schema
  shared via an explicit contract rather than direct type imports).
