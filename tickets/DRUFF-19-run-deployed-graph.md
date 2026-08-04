---
id: DRUFF-19
title: Run and inspect one deployed Dander graph
status: done
component: frontend
epic: dander-integration
depends_on: [DRUFF-5]
created: 2026-08-03
---

## Context

Dander now exposes revision-safe validate, run, and status operations for the one graph pipeline an
operator binds when starting the loopback service. Druff needs the first narrow operational loop
without becoming a deployment tool or general GCP control panel.

## Acceptance Criteria

- [x] A clean graph opened from Dander can be validated and its already-deployed Cloud Run job can
      be started manually with the exact open revision.
- [x] Druff displays the fixed project/pipeline/job binding, latest Cloud Run execution, and latest
      Dander run-ledger result.
- [x] Run is disabled for detached, dirty, conflicted, or active graphs, and Dander API errors are
      actionable without exposing response bodies or row data.
- [x] The UI clearly states that execution does not deploy edits, write the manifest, or change a
      schedule.
- [x] Zod boundary tests, hook tests, and a mocked Playwright workflow cover the new logic.
- [x] No new dependency, deployment path, scheduler control, project chooser, or log browser is
      added.

## Design

Add a dedicated operations client beside graph persistence, with strict Zod projections for the
three Dander endpoints. A hook owns request state and receives only the currently opened revision
and clean/attached state. Render a compact operations strip below the existing file toolbar. Keep
the operator-selected cloud binding read-only, use the current ETag for mutating operations, and
leave execution completion to explicit Refresh rather than introducing a background control plane.

## Implementation Notes

Added an injected Zod client, revision-aware hook, and compact operations strip. Status refresh is
explicit: after Open, the operator chooses Refresh before Validate or Run becomes available. This
keeps the UI free of background polling while still displaying the submitted execution immediately.

## Review Log

### 2026-08-03 — PASS

Independent final review found no material correctness, security, or scope issues across the
Dander/Druff operations bridge.
