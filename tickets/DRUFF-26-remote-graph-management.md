---
id: DRUFF-26
title: Add remote project and graph management
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-25]
created: 2026-08-13
---

## Context

Adapt the current explicit persistence seam to hosted project/graph addressing without losing
local drafts or conflict safety.

## Acceptance Criteria

- [ ] List/create/open/save/delete graphs through the generated Control API client.
- [ ] Preserve dirty/saving/conflict/reload behavior with opaque ETags and display portable content
      identity separately.
- [ ] Require confirmation for delete and preserve import/export plus detached offline drafts.
- [ ] Handle pagination, compatibility, auth, and safe errors without provider branches.
- [ ] Unit/component and Playwright tests cover create, save, stale conflict, reload, delete, and
      persistence after a synthetic service restart.

## Design

Reuse the existing `GraphPersistence` seam and canvas/store conversion; do not add a second store
or provider-specific graph format.

## Implementation Notes

_Pending._

## Review Log

_Pending._
