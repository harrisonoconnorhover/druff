# `graph-io`

Canonical graph collection/open/save and the canvas ⇄ source view toggle. This is glue between the
canvas store, the pure pipeline-graph model/converters, and three browser affordances:

- **Dander persistence** — loopback mode retains explicit Open/Save against `dander graph serve`.
  Hosted mode lists logical projects and paginated graph summaries, then creates, opens, saves, or
  deletes through Dander's generated Control API contract. Verified capabilities gate the hosted
  workspace and role-projected operations gate its controls. Every addressed operation carries the
  exact opaque ETag; conflicts are visible and never overwrite a graph.
- **File export/import** — `GraphToolbar` exports explicitly named Druff graph drafts and imports
  either those drafts or a version-1 `dander.yaml`, via `src/lib/graph-io/graph-file.ts`.
- **Canvas ⇄ source toggle** — `GraphEditor` owns `viewMode` and renders either `PipelineCanvas` or
  the read-only `SourceView`.

## Files

- `GraphEditor.tsx` — chooses the existing loopback seam or authenticated hosted collection client.
  Legacy deployed-job operations remain loopback-only until their dedicated hosted tickets.
- `GraphToolbar.tsx` / `RemoteGraphDialog.tsx` — hosted browse/create/open/save/reload/confirmed
  delete, local Open/Save, draft import/export, status, identities, and the view toggle.
- `SourceView.tsx` — read-only Monaco view of the live canvas encoded as YAML/JSON.
- `useGraphPersistence.ts` — one async controller for local and hosted persistence, retaining
  dirty/saving/conflict/reload state and detaching imports or deleted graphs safely.
- `../hosted-control/control-api.ts` / `useHostedValidationPreview.ts` — compatible capabilities,
  addressed server validation, bounded deployment preview, and stale-result rejection.

Authenticated hosted entry must first verify Dander's API version, exact contract bundle, supported
Druff range, and `graph.read` capability. The same role-projected capability result gates mutation,
validation, and preview presentation; Dander still enforces authorization server-side. On Open, the
controller also discovers the connected runtime's presentation-only connector, package, and
transform-operation catalogs. Catalog failure never invents support or substitutes the offline
fallback. The operation editor writes the advertised safe subset to canonical transform
`config.operations`; it does not create a Druff-only graph schema or execute transformations in the
browser.

Remote validation stays advisory alongside local validation. Dander issue paths are attributed to
canvas nodes/edges when possible and otherwise shown as general issues. Preview summaries and
affected resources are length/count bounded before rendering. Both operations bind to the current
address, exact ETag, and canonical-content identity; stale results are discarded and structured
conflicts require an explicit reload.

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
- Hosted list responses remain document-free and bounded. Only an explicit Open retrieves a graph;
  opaque pagination cursors are sent back unchanged.
- Saving normalizes YAML formatting/comments. Model fields are preserved; byte formatting is not.
- Execution controls live in `src/features/graph-operations` and can only start an already-deployed,
  operator-bound job. Terraform deployment remains out of scope.
- Provider branches, deleted-record feeds, arbitrary SQL hooks, and browser-side operation
  execution are out of scope. The hosted browser sees only provider-neutral Control API DTOs.
