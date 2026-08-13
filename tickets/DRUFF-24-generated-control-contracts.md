---
id: DRUFF-24
title: Generate Druff contracts from the Dander artifact
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-23]
created: 2026-08-13
---

## Context

Manual graph and API Zod definitions have drifted from Dander and cannot remain authoritative.

## Acceptance Criteria

- [x] Consume only a merged, published Dander `io.dander.control.contracts/v1` artifact.
- [x] Deterministically generate TypeScript types and runtime validators for every required DTO.
- [x] Replace authoritative handwritten graph/API schemas and fail CI on generation drift.
- [x] Round-trip Dander canonical fixtures without semantic field loss, including extensions and
      typed node configs.
- [x] Embed the contract bundle ID/digest and fail actionably on incompatible capabilities.

## Design

Presentation helpers may remain handwritten, but every network/document boundary parses generated
runtime validators. Do not generate from a sibling checkout or duplicate Dander semantics.

The consumer pins the public `dander-platform==0.9.0rc18` wheel and verifies its wheel digest,
manifest inventory, per-file hashes, and whole-bundle digest before generation. Ajv Draft 2020-12
standalone validators enforce the exact published schemas without coercion or mutation; generated
TypeScript types come from the same files. A small post-validation graph projection applies
Dander's alias/default/omission rules for the editor without deciding which fields are allowed.

Current local/GCP status, validation, and run payloads do not match the normalized published DTOs.
They remain explicitly isolated in the legacy loopback client until Dander exposes the D2 hosted
endpoints; deployment preview and both catalogs already match and now use generated validators.

## Implementation Notes

- Pinned wheel SHA256: `4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c`.
- Pinned bundle SHA256: `344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed`.
- CI runs `pnpm contracts:check`; the generator compares fresh temporary output byte-for-byte.
- Published fixtures cover every root DTO plus extensions, typed configs, triggers, cursors,
  visuals, four transformation kinds, four operations, five write modes, and `copy` transport.

## Review Log

### 2026-08-13 — pre-implementation adversarial review

Corrected the plan to keep generated validation pure, canonicalize only after validation, and
retain unmatched local/GCP response schemas instead of accidentally beginning D2.

### 2026-08-13 — completion adversarial review

Found one remaining handwritten `/v1/connectors` boundary. Replaced it with the generated connector
catalog validator and generated types, retained only binding checks and UI projection logic, and
proved unknown-field rejection plus non-mutating optional-field presentation defaults.
