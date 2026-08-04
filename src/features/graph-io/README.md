# `graph-io`

Canonical graph Open/Save and the canvas ⇄ source view toggle. This is glue between the canvas
store, the pure pipeline-graph model/converters, and three browser affordances:

- **Dander persistence** — explicit Open/Save against the graph selected by `dander graph serve`.
  Every save carries the last ETag revision; conflicts are visible and never overwrite the file.
- **File export/import** — `GraphToolbar` exports explicitly named Druff graph drafts and imports
  either those drafts or a version-1 `dander.yaml`, via `src/lib/graph-io/graph-file.ts`.
- **Canvas ⇄ source toggle** — `GraphEditor` owns `viewMode` and renders either `PipelineCanvas` or
  the read-only `SourceView`.

## Files

- `GraphEditor.tsx` — container: owns `viewMode`, mounts persistence, renders the toolbar above the
  active view, and passes the opened revision to the separate graph-operations feature.
- `GraphToolbar.tsx` — Dander Open/Save, draft export, graph/manifest import, status, and view toggle.
- `SourceView.tsx` — read-only Monaco view of the live canvas encoded as YAML/JSON.
- `useGraphPersistence.ts` — explicit async Open/Save controller with dirty/conflict state.

## Single serialization path

Every conversion from the canvas to text goes through DRUFF-4's
`canvasToGraph → encodeGraph` path (Save, draft export, `SourceView`). Graph drafts come back
through `decodeGraph → graphToCanvas`. A Dander manifest takes the separate, one-way
`projectDanderManifest → graphToCanvas` path because it is a different product contract; it is
never re-encoded as or written back to `dander.yaml`.

## What's out of scope here

- `SourceView` is **read-only** — editing YAML/JSON back into the canvas is a future ticket.
- The Dander manifest projection does not read connector/model file contents and cannot write back
  or deploy changes.
- Dander exposes exactly one operator-selected graph file. Multi-file browsing is intentionally
  deferred until the product has a real graph registry convention.
- Saving normalizes YAML formatting/comments. Model fields are preserved; byte formatting is not.
- Execution controls live in `src/features/graph-operations` and can only start an already-deployed,
  operator-bound job. Terraform deployment remains out of scope.
