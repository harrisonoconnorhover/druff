---
id: DRUFF-26
title: Add remote project and graph management
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-25]
created: 2026-08-13
---

## Context

Adapt the current explicit persistence seam to hosted project/graph addressing without losing
local drafts or conflict safety.

## Acceptance Criteria

- [x] List/create/open/save/delete graphs through the generated Control API client.
- [x] Preserve dirty/saving/conflict/reload behavior with opaque ETags and display portable content
      identity separately.
- [x] Require confirmation for delete and preserve import/export plus detached offline drafts.
- [x] Handle pagination, compatibility, auth, and safe errors without provider branches.
- [x] Unit/component and Playwright tests cover create, save, stale conflict, reload, delete, and
      persistence after a synthetic service restart.

## Design

Reuse the existing `GraphPersistence` seam and canvas/store conversion; do not add a second store
or provider-specific graph format.

## Implementation Notes

- `HostedGraphPersistence` extends the existing persistence seam with generated-contract project,
  page, create, resource, and structured-error boundaries. It never exposes provider payloads.
- Create and delete retain an idempotency key across ambiguous retries; update/delete map only a
  structured `graph_conflict` to the explicit reload path. Delete accepts the bodyless 204 only.
- Hosted UI shows logical address, opaque ETag, and canonical-content SHA separately. Import and
  successful delete retain the canvas as a detached local draft.
- The HTTPS static-export Playwright journey uses synthetic OIDC and a provider-neutral in-memory
  Control API. A durable fake store survives service-instance swaps without committing row data or
  credentials.

## Review Log

### 2026-08-14 — pre-implementation adversarial review

The review caught two narrow boundary errors in the plan. Hosted mode now hides the legacy
localhost operations client/banner until DRUFF-27/28, with a no-loopback-fetch regression. CRUD
status/conflict handling is operation-specific, and create/delete reuse their idempotency keys
after a lost response and synthetic service restart.

### 2026-08-14 — implementation correction

Static callback acceptance showed that generic static hosting can reload the root provider during
callback-to-home navigation, destroying a memory-only token. The verified callback now cleans the
URL and renders the shared workspace in place. A narrowly bound module-memory handoff still clears
on full reload, expiry, 401, logout, loopback, or configuration change.

### 2026-08-14 — completion-review correction

The final review caught that a slow hosted Create could replace edits made while its request was in
flight. Create now attaches the accepted address, ETag, content SHA, and remote baseline while
retaining any newer canvas state as dirty; a deferred-request regression covers the boundary.
