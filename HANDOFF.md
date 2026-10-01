# Morning Handoff

## Finished

- Added a hosted Choose → Configure → Review → Run → Results journey with one primary action and existing technical controls under advanced details.
- Bound unsaved change previews to the draft, graph address and revision; running requires the reviewed content hash to match the saved graph.
- Added recorded outcome explanations, missing-measurement handling and explicit retained-raw date repair with date/revision invalidation and safe retry keys.
- Preserved loopback editing, OIDC/capability gates, graph conflicts, logs, cancellation and replay; corrected the existing font variable and toolbar overflow.
- Documented the experimental repair boundary and added a read-only production-client observation test for an already-completed native repair.

## Try It

In hosted mode, browse a graph, edit its source/output configuration, choose **Preview changes**, then **Save reviewed changes** and **Run reviewed graph**. Expand **Repair selected output dates** for an eligible saved graph. Existing operator configuration still supplies connections and deployed environments.

For real HTTP contract checks, start an ephemeral Dander Control API and use `DANDER_CONTROL_URL=... DANDER_EXPECTED_VERSION=... pnpm test:current-dander`. For an accepted native repair, use the explicit project, graph and run ID variables documented in README with `pnpm test:repair-observation`.

## Checks

- Passed 685 unit/component tests, nine artifact checks, TypeScript, ESLint, Prettier and static build against the verified published RC33 wheel; independent contract regeneration reports no drift.
- Passed all 11 Playwright journeys, including reviewed save/run, date invalidation, repair submission and existing conflict/retry behavior. Browser OIDC/API responses are synthetic.
- Passed real HTTP acceptance against published RC34 Control: exact hashes, canvas round trip, unsaved preview/save, stale rejection and truthful unsupported execution. Final RC34 regeneration/drift, 29 contract tests, 18 journey/API tests, TypeScript and focused lint passed; its bundle is unchanged.
- Visually inspected the synthetic browser screenshot; font and horizontal overflow defects are corrected. A focused test also confirms late explanations cannot replace newer run status.
- PR #25 initially found three fixed high Caddy dependency findings. Pinned x/crypto 0.55.0 and gRPC 1.83.2; CI `36870826744` passed both architecture scans, reproducibility, runtime checks and frontend/secret checks.

## Decisions

- Dander remains the only semantic/execution authority; no provider client or new auth infrastructure was added.
- Missing result documents display Unknown instead of interpreting default counters as measured zeros.
- Date repair rebuilds output partitions from retained raw data; it is explicitly experimental and does not recover historical source records.

## Remaining

- Candidate version is `0.2.0-rc.1`, paired with published RC34 Control and the unchanged contract digest in README. This does not promote the RC20 public beta.
- Observe the separately authorized native repair once its accepted run ID is available; no provider workload was launched by Druff tests.
- Complete protected PR #25, exact-main checks and candidate image publication with the final RC34 pin.

## Review First

- `src/features/hosted-control/useGraphChangePreview.ts` and `DateRepairPanel.tsx`
- `src/features/hosted-control/control-api.ts` and `integration/`
- `tickets/DRUFF-32-guided-pipeline-journey.md`
