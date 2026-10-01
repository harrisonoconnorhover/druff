---
id: DRUFF-32
title: Guide graph configuration, reviewed runs and date repair
status: in-review
component: frontend
created: 2026-10-01
---

## Context

The existing editor exposes persistence, validation and run commands in parallel. Connect those
capabilities into a first-success journey using Dander's published transport contracts, without
adding a browser runtime, provider clients or a second planner.

## Acceptance Criteria

- [x] Keep hosted sign-in, capability checks and loopback behavior intact.
- [x] Guide graph selection and configuration to an unsaved change preview, explicit save and run
      of the exact reviewed saved graph; draft or saved-content changes invalidate review, and
      submissions retain the saved graph's exact opaque revision precondition.
- [x] Show recorded run explanations and unknown measurements truthfully; preserve cancellation,
      replay and logs with their existing permissions and idempotency semantics.
- [x] Preview and submit retained-raw date repair with the exact saved revision, date window and
      advertised execution environment; explain its limits and never imply historical recovery.
- [x] Preserve existing editing and advanced controls. Verify new state transitions and API
      contracts, exercise the browser with synthetic OIDC/API fixtures, and exercise the production
      client against Dander's actual Control API. Record native provider proof separately.

## Design

One hosted journey panel composes the existing graph, validation and run hooks. A review is bound
to the graph address, draft content and opaque baseline revision, and survives only an exact save.
Date repair is a deliberate preview/start operation. Outcomes come from Dander's deterministic
explanation endpoint. The loopback editor remains separate.

## Verification

Final published-contract checks passed: 685 unit/component tests; TypeScript, ESLint, Prettier, static build; all
11 Playwright journeys; real HTTP acceptance against an ephemeral published-wheel Dander RC33 Control
API. Browser OIDC/API fixtures are synthetic. The actual HTTP test covers canonical canvas hash
identity, unsaved preview, exact save and stale preview rejection without a provider backend.

Contracts were regenerated from the published RC33 GitHub wheel, with exact wheel/bundle hashes
and independent drift verification. This GitHub candidate does not promote the RC20 PyPI beta.
Native repair success and cleanup remain separate operator qualification;
`pnpm test:repair-observation` reads an accepted run without launching another workload.
