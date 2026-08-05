---
id: DRUFF-21
title: Browse the curated Dander connector catalog
status: done
component: frontend
epic: connector-plugins
depends_on: []
created: 2026-08-05
---

## Context

Dander now separates installed runtime descriptors from a small curated package catalog. Druff
needs a discoverable, display-only path from that catalog to exact setup instructions without
becoming a package installer, manifest editor, or second plugin runtime.

## Acceptance Criteria

- [x] Strictly parse `GET /v1/plugin-catalog`, treating a 404 as an empty optional catalog.
- [x] Load catalog metadata alongside connector discovery without blocking canonical graph access.
- [x] Search and display package pins, Dander compatibility, support, validation, public links,
  and manifest-scoped installation status.
- [x] Copy exact manifest and `dander plugins install` steps without executing or persisting them.
- [x] Preserve the existing connector palette and canonical `PipelineGraph` round trip.
- [x] Pass lint, formatting, typing, unit/component tests, Playwright, and the production build.

## Design

Use a strict Zod boundary and a separate external catalog store. Load it during explicit Dander
Open, independently of runtime connector descriptors. Add one searchable dialog to the palette;
links and copied text are the only actions.

## Implementation Notes

Implemented a strict discovery client and separate external store, loaded independently during
explicit graph Open. Added the palette dialog, exact clipboard instructions, unit/component tests,
and a browser-level catalog workflow. No dependency or graph-schema change was required.

## Review Log

2026-08-05 — PASS — Independent adversarial review found no material contract, compatibility,
security, or scope defects across the paired Dander and Druff implementation and test evidence.
