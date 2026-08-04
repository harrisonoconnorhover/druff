# `graph-operations`

The first narrow operational loop between Druff and Dander. It is intentionally separate from
graph persistence and deployment:

- `useGraphOperations.ts` owns validate/run/status request state for the exact ETag opened from
  Dander. Detached, dirty, conflicted, or active graphs cannot run.
- `GraphOperationsBar.tsx` displays the read-only project/pipeline/job binding, latest Cloud Run
  execution, and latest Dander run-ledger result.
- `src/lib/dander-operations/graph-operations.ts` is the injected, Zod-validated HTTP seam.

The browser never chooses a project, region, job, pipeline, or graph path. Dander fixes those at
service startup and invokes `gcloud` with the operator's local identity. Druff does not receive a
credential and does not deploy edits, write `dander.yaml`, change schedules, or browse arbitrary
cloud resources.
