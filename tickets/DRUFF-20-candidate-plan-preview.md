---
id: DRUFF-20
title: Build a source-free candidate and preview its Terraform plan
status: done
component: frontend
epic: dander-integration
depends_on: [DRUFF-19]
created: 2026-08-04
---

## Context

A saved graph can already run against its deployed job. The next narrow step is to show what a
real packaged deployment would change without making Druff an apply surface.

## Acceptance Criteria

- [x] Save remains file-only; candidate creation is a separate explicit action.
- [x] The action requires a clean saved ETag and a Dander service explicitly started with complete
      operator-owned deployment inputs.
- [x] Dander builds and pushes a source-free candidate from an immutable project snapshot.
- [x] Druff shows the candidate digest, exact human Terraform plan, and all shared-image jobs.
- [x] The plan is temporary/non-applyable and no apply, scheduler, project chooser, or general cloud
      controls are added.
- [x] Unit and browser tests cover the request boundary and displayed plan.

## Review Log

Final independent review confirmed the action boundary and found one Dander input-parity gap:
operator-managed secret containers outside manifest bindings were not preserved. Dander now accepts
repeatable operator-only `--secret-id` values and unions them with manifest secrets before planning.
