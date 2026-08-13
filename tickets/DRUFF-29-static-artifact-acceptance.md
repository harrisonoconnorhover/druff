---
id: DRUFF-29
title: Harden the static artifact and control-plane journey
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-25, DRUFF-26, DRUFF-27, DRUFF-28]
created: 2026-08-13
---

## Context

Druff needs one immutable cross-cloud static artifact and complete local acceptance before any
provider Terraform or live endpoint.

## Acceptance Criteria

- [ ] Build a deterministic multi-platform/static bundle with digest manifest, SBOM, provenance,
      non-root/read-only behavior, security headers, and no embedded secrets/source.
- [ ] Copy/promote the exact digest without rebuilding.
- [ ] Playwright covers login/test identity, compatibility, graph CRUD/conflict, catalogs,
      validation, preview, run/status/logs/cancel/replay, and reopen after service restart.
- [ ] Static export is retained and no Next.js server/runtime dependency appears.
- [ ] Full CI, artifact/secret scans, and independent completion review pass.

## Design

Provider bootstrap is separately generated public data bound to the same artifact; cloud deployment
and live proof remain Dander-owned later phases.

## Implementation Notes

_Pending._

## Review Log

_Pending._
