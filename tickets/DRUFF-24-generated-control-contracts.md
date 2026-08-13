---
id: DRUFF-24
title: Generate Druff contracts from the Dander artifact
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-23]
created: 2026-08-13
---

## Context

Manual graph and API Zod definitions have drifted from Dander and cannot remain authoritative.

## Acceptance Criteria

- [ ] Consume only a merged, published Dander `io.dander.control.contracts/v1` artifact.
- [ ] Deterministically generate TypeScript types and runtime validators for every required DTO.
- [ ] Replace authoritative handwritten graph/API schemas and fail CI on generation drift.
- [ ] Round-trip Dander canonical fixtures without semantic field loss, including extensions and
      typed node configs.
- [ ] Embed the contract bundle ID/digest and fail actionably on incompatible capabilities.

## Design

Presentation helpers may remain handwritten, but every network/document boundary parses generated
runtime validators. Do not generate from a sibling checkout or duplicate Dander semantics.

## Implementation Notes

_Pending._

## Review Log

_Pending._
