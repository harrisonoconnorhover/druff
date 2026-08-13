---
id: DRUFF-28
title: Add normalized remote run controls
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24, DRUFF-26]
created: 2026-08-13
---

## Context

Replace the GCP-shaped single-graph operations client with one generated run API while keeping
provider semantics in Dander.

## Acceptance Criteria

- [ ] Trigger a run and poll normalized status every 2–5 seconds.
- [ ] Retrieve only bounded sanitized log records and support cancel/replay when capabilities allow.
- [ ] Use idempotency keys and disable conflicting controls while a mutation is pending.
- [ ] Render actionable unsupported/cancellation-acknowledgement diagnostics without provider IDs.
- [ ] Tests cover success, failure, polling, bounded logs, cancel, replay, expiry, and unauthorized
      mutations with no real network or secret data.

## Design

One Control API client serves every cloud. React components never import provider types or branch
on provider-native states.

## Implementation Notes

_Pending._

## Review Log

_Pending._
