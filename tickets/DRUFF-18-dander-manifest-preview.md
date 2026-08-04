---
id: DRUFF-18
title: Preview hosted Dander manifests on the canvas
status: done
component: frontend
epic: dander-integration
depends_on: [DRUFF-5]
created: 2026-08-03
---

## Context

Dander's deployed pipelines are `dander.yaml` manifest entries, not `PipelineGraph` files. Druff
needs a useful local bridge without claiming write-back or changing Dander's runtime contract.

## Acceptance Criteria

- [x] Importing a version-1 `dander.yaml` draws every hosted pipeline as schedule → source → model
      nodes with deterministic layout.
- [x] The projection omits secret mappings and cloud resource names, changes no Dander file, and is
      visibly labeled as a non-deployable local draft.
- [x] Imported graph names survive source view, export, autosave, and reload.
- [x] Unsupported newer `PipelineGraph` fields fail loudly instead of being silently stripped.
- [x] Unit and Playwright tests cover the projection and browser import path.

## Design

Add a one-way manifest parser/projector beside the existing graph parser. Keep the canvas model and
Dander repository unchanged. Store the active draft name in Zustand so the existing export and
persistence seams remain single-path. Rename exported artifacts as Druff drafts and show a permanent
UI notice explaining that deployment/write-back is not implemented.

## Implementation Notes

Added a one-way manifest schema/projector, deterministic multi-pipeline layout, graph-name state,
explicit draft labeling, and browser coverage. Current Dander writer settings that Druff does not
edit are preserved verbatim during inspector updates. The real Dander manifest was imported in the
running UI; a local Greenhouse node-name edit survived reload.

## Review Log

### 2026-08-03 — MATERIAL FINDING RESOLVED

The second review's material finding was corrected: unsupported current writer fields
(`max_batch_rows`, `schema_evolution`, `transport`) now survive inspector edits, with regression
coverage. No third review pass was requested, per the two-pass limit, and no broader schema
synchronization was added.
