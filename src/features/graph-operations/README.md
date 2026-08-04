# `graph-operations`

The first narrow operational and deployment-preview loop between Druff and Dander:

- `useGraphOperations.ts` owns validate/run/status request state for the exact ETag opened from
  Dander. Detached, dirty, conflicted, or active graphs cannot run.
- `GraphOperationsBar.tsx` displays the read-only project/pipeline/job binding, latest Cloud Run
  execution, latest Dander run-ledger result, and an exact human Terraform preview.
- `src/lib/dander-operations/graph-operations.ts` is the injected, Zod-validated HTTP seam.

The browser never chooses a project, region, job, pipeline, or graph path. Dander fixes those at
service startup and invokes `gcloud` with the operator's local identity. Druff does not receive a
credential. Save remains file-only. The separate **Build candidate & plan** action is enabled only
when Dander explicitly opts in; it pushes a source-free candidate, discloses every shared-image
consumer, and displays a temporary non-applyable plan. Druff does not apply it, write `dander.yaml`,
change schedules, or browse arbitrary cloud resources.
