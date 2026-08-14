# `graph-operations`

Operational seams between Druff and Dander:

- `useGraphOperations.ts` owns validate/run/status request state for the exact ETag opened from
  Dander. Detached, dirty, conflicted, or active graphs cannot run.
- `GraphOperationsBar.tsx` displays the read-only project/pipeline/job binding, latest Cloud Run
  execution, latest Dander run-ledger result, and an exact human Terraform preview.
- `src/lib/dander-operations/graph-operations.ts` is the injected, Zod-validated HTTP seam.
- Hosted mode uses `../hosted-control/useHostedValidationPreview.ts` for addressed validation and
  bounded deployment preview, and `../hosted-control/useHostedRunControls.ts` for provider-neutral
  run start, normalized status polling, one bounded sanitized log page, cancel, and replay.

The browser never chooses a project, region, job, pipeline, or graph path. Dander fixes those at
service startup and invokes `gcloud` with the operator's local identity. Druff does not receive a
credential. Save remains file-only. The separate **Build candidate & plan** action is enabled only
when Dander explicitly opts in; it pushes a source-free candidate, discloses every shared-image
consumer, and displays a temporary non-applyable plan. Druff does not apply it, write `dander.yaml`,
change schedules, or browse arbitrary cloud resources.

Hosted run controls use only generated Control API DTOs and role-projected capabilities. Start is
bound to the attached graph's exact opaque ETag; cancel and replay are bound to the normalized run
ID. Ambiguous mutation outcomes retain their idempotency key, mismatched response identities fail
closed, and the UI never imports provider types or renders provider identifiers or raw payloads.
