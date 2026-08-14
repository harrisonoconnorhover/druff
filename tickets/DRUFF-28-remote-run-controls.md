---
id: DRUFF-28
title: Add normalized remote run controls
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-26]
created: 2026-08-13
---

## Context

Replace the GCP-shaped single-graph operations client with one generated run API while keeping
provider semantics in Dander.

## Acceptance Criteria

- [x] Trigger a run and poll normalized status every 2–5 seconds.
- [x] Retrieve only bounded sanitized log records and support cancel/replay when capabilities allow.
- [x] Use idempotency keys and disable conflicting controls while a mutation is pending.
- [x] Render actionable unsupported/cancellation-acknowledgement diagnostics without provider IDs.
- [x] Tests cover success, failure, polling, bounded logs, cancel, replay, expiry, and unauthorized
      mutations with no real network or secret data.

## Design

One Control API client serves every cloud. React components never import provider types or branch
on provider-native states.

## Implementation Notes

- One generated-contract client handles addressed start, status, one bounded sanitized log page,
  cancel, and replay. Every returned status or mutation result must correlate to the requested run
  before Druff adopts it.
- Start fingerprints the graph address and exact opaque ETag. Cancel and replay fingerprint their
  operation and run ID. Ambiguous network, server, oversized, malformed, or mismatched success
  outcomes retain the same idempotency key for a safe operator retry.
- The controller tracks the normalized run independently of later canvas edits, polls active states
  every two seconds, retries temporary reachability failures, and stops on incompatible responses.
  Polling pauses during a mutation, and log reads and mutations are mutually exclusive so stale
  asynchronous responses cannot overwrite acknowledged run state.
- Role-projected capabilities gate every control. Cancel/replay also require the normalized status
  flags, and logs render only one server-bounded page with strict record and field limits.
- Unit tests cover correlation, idempotency retention, polling/recovery, bounded logs, mutation
  exclusion, capability rejection, and unauthorized/expired sessions. The hosted Playwright journey
  covers start, polling, logs, replay, and persistence through a synthetic service restart.

## Review Log

### 2026-08-14 — pre-implementation adversarial review

The review required route-level response correlation beyond generated shape validation: status
must match the addressed run, cancel/replay must match both operation and run, and accepted replay
must return a bounded resulting run ID. It also classified malformed, oversized, truncated, or
semantically mismatched 2xx mutation responses as ambiguous so a retry keeps the original
idempotency key.

### 2026-08-14 — completion-review correction

The final review found that an in-flight status or log request could cross a cancel/replay mutation
and overwrite newer state. Polling now suspends for every mutation, log reads and mutations are
mutually exclusive in both guards and presented controls, and deferred-response regressions prove
stale polling cannot undo an acknowledged cancellation.
