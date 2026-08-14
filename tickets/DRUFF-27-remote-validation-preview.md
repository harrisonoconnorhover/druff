---
id: DRUFF-27
title: Add remote validation catalogs and deployment preview
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-26]
created: 2026-08-13
---

## Context

Extend the current presentation surfaces to normalized hosted Dander operations without copying
validation or provider behavior into Druff.

## Acceptance Criteria

- [x] Inspect installed connectors, curated plugins, operations, and compatibility via generated DTOs.
- [x] Submit validation and attribute structured node/edge issues inline.
- [x] Request and render bounded sanitized deployment previews and affected-resource summaries.
- [x] Display explicit unsupported-capability diagnostics without raw provider payloads.
- [x] Preserve advisory local validation and test every generated boundary.

## Design

Dander remains authoritative for validation and preview. Druff never receives Terraform state,
binary plans, secrets, SQL, row data, or unbounded provider output.

## Implementation Notes

- Authenticated hosted entry treats generated `GET /v1/capabilities` as authoritative and verifies
  API version, contract identity, and Druff compatibility before exposing the workspace. Its
  role-projected operations separately gate graph editing, deletion, validation, and preview in
  the presentation; Dander remains authoritative for every request.
- Hosted connector, curated-plugin, and operation catalogs use the existing generated DTOs and
  catalog stores. Hosted discovery does not blend in Druff's offline connector fallback.
- Addressed validation and deployment preview carry the exact opaque graph ETag. Validation is
  also bound to the returned canonical-content SHA and graph name; preview DTO revisions remain
  provider-native display data and are never interpreted as HTTP ETags.
- Structured validation paths are attributed to canvas nodes and edges where possible, with an
  explicit general-issue fallback. Deployment preview text and affected-resource counts/lengths
  are bounded before rendering, and structured errors never echo raw response bodies.
- Existing local advisory validation remains merged with remote diagnostics. Capability, catalog,
  response-size, conflict, attribution, stale-result, and hosted browser regressions cover the
  generated boundaries without introducing provider-specific UI.

## Review Log

### 2026-08-14 — pre-implementation adversarial review

The review required verified capabilities—not only schema parsing—to precede hosted operations,
with the role-projected operation list gating create/save/delete as well as validation and preview.
It also corrected the conflict boundary to exact `412 operation_conflict` and prohibited comparing
the deployment-preview DTO's provider-native revision with the graph's public quoted ETag. Results
are instead discarded unless address, exact ETag, canonical-content SHA, and canvas identity remain
current.
