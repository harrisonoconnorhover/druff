---
id: DRUFF-29
title: Harden the static artifact and control-plane journey
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-25, DRUFF-26, DRUFF-27, DRUFF-28]
created: 2026-08-13
---

## Context

Druff needs one immutable cross-cloud static artifact and complete local acceptance before any
provider Terraform or live endpoint.

## Acceptance Criteria

- [x] Build a deterministic multi-platform/static bundle with digest manifest, SBOM, provenance,
      non-root/read-only behavior, security headers, and no embedded secrets/source.
- [x] Copy/promote the exact digest without rebuilding.
- [x] Playwright covers login/test identity, compatibility, graph CRUD/conflict, catalogs,
      validation, preview, run/status/logs/cancel/replay, and reopen after service restart.
- [x] Static export is retained and no Next.js server/runtime dependency appears.
- [x] Full CI, artifact/secret scans, and independent completion review pass.

## Design

Provider bootstrap is separately generated public data bound to the same artifact; cloud deployment
and live proof remain Dander-owned later phases.

## Implementation Notes

- The static export now carries one sorted per-file SHA-256 manifest and aggregate bundle digest,
  bound to the exact source revision/epoch and the pinned public Dander contract. The source
  revision is also the deterministic Next build ID; generated Monaco assets are cleanly replaced
  and ignored build inputs cannot leak into a later build. One build wrapper resolves provenance
  once for Next and the manifest, uses exact HEAD only from a clean worktree, and records
  `unrecorded` with epoch zero for local dirty sources.
- The final scratch stage contains only a vulnerability-clean Caddy 2.11.4 binary rebuilt from a
  pinned toolchain and dependency set, configuration, and static bundle. It is source-free,
  UID/GID `65532:65532`, and runnable with a read-only root plus disposable `/tmp`. It serves
  extensionless callback/logout routes,
  probes, immutable hashed assets, and one committed CSP/cache/security-header policy exercised by
  both the exact image verifier and the complete hosted Playwright journey.
- Protected CI builds linux/amd64 and linux/arm64 from one clean context and repeats the static build
  from a second clean context with the same revision/epoch. A bounded registry verifier requires one
  exact shared static layer, an associated SPDX SBOM and SLSA statement for each runnable manifest,
  and a byte-identical raw-index promotion preserving runnable and attestation descriptors.
- Both exact runnable manifest digests receive vulnerability and secret scans before the local
  candidate index is promoted. The registry and all image references are disposable CI-local data;
  no public Druff artifact is published by this ticket.
- The hosted browser journey now exercises cancel acknowledgement, terminal cancellation, replay to
  a correlated new run, success, graph persistence, and service restart in addition to the prior
  login, capability, graph, catalog, validation, preview, status, and log path.

## Review Log

### 2026-08-14 — pre-implementation adversarial review

The review required secret/cache exclusions before `COPY . .`, a target-independent build stage,
two isolated deterministic outputs, exact shared-layer proof across both runnable architectures,
and per-manifest SPDX/SLSA association. It also required the committed CSP in the hosted journey,
exact-image callback/probe/cache/header/read-only checks, scans of both runnable digests, and
byte-preserving raw-index promotion with every attestation descriptor retained.

### 2026-08-14 — completion review

The final review found contradictory default provenance when staged sources built with an
`unrecorded` Next ID but the manifest independently claimed HEAD. One shared resolver now supplies
both values, refuses partial explicit metadata, and never attributes a dirty worktree to HEAD. The
focused clean/dirty regression covers the correction. This was the review's only material finding;
the corrected artifact then passed protected PR run `31802260747` at implementation commit
`9a61313f44cf9cfe3a61b66800de4b35871bef27`, including both exact runnable-manifest scans and exact
local-registry promotion.
