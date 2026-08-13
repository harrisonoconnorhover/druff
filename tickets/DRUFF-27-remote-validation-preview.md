---
id: DRUFF-27
title: Add remote validation catalogs and deployment preview
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-26]
created: 2026-08-13
---

## Context

Extend the current presentation surfaces to normalized hosted Dander operations without copying
validation or provider behavior into Druff.

## Acceptance Criteria

- [ ] Inspect installed connectors, curated plugins, operations, and compatibility via generated DTOs.
- [ ] Submit validation and attribute structured node/edge issues inline.
- [ ] Request and render bounded sanitized deployment previews and affected-resource summaries.
- [ ] Display explicit unsupported-capability diagnostics without raw provider payloads.
- [ ] Preserve advisory local validation and test every generated boundary.

## Design

Dander remains authoritative for validation and preview. Druff never receives Terraform state,
binary plans, secrets, SQL, row data, or unbounded provider output.

## Implementation Notes

_Pending._

## Review Log

_Pending._
