---
id: DRUFF-23
title: Define the bounded self-hosted control-plane architecture
status: done
component: docs
epic: self-hosted-control-plane
depends_on: [DRUFF-22]
created: 2026-08-13
---

## Context

Phase D0 records how Druff evolves beyond the current loopback slice without becoming a semantic,
cloud, identity, or execution authority.

## Acceptance Criteria

- [x] Exact Dander/Druff commits, CI, governance, capabilities, and schema drift are recorded.
- [x] Static hosting, generated contracts, OIDC, graph revisions, migration, PRs, costs, and
      non-goals are explicit.
- [x] The paired Dander roadmap answers all ten architecture questions.
- [x] Independent adversarial corrections are incorporated.
- [x] No application code, artifact publication, account registration, or cloud resource changes.

## Design

See `steering/03-control-plane-roadmap.md`.

## Implementation Notes

Druff stays a static generated Dander client. Dander owns trust, semantics, storage, execution,
providers, and deployment.

## Review Log

### 2026-08-13 — PASS

The corrected documentation retains all roadmap invariants and introduces no runtime behavior.
