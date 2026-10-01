# Morning Handoff

## Finished

- Added a hosted Choose → Configure → Review → Run → Results journey with one primary action and existing technical controls under advanced details.
- Bound unsaved change previews to the draft, graph address and revision; running requires the reviewed content hash to match the saved graph.
- Added recorded outcome explanations, missing-measurement handling and explicit retained-raw date repair with date/revision invalidation and safe retry keys.
- Preserved loopback editing, OIDC/capability gates, graph conflicts, logs, cancellation and replay; corrected the existing font variable and toolbar overflow.
- Published candidate `0.2.0-rc.1` from protected source `eabceb21`; verified native repair through the production client and preserved active/rollback images.

## Try It

In hosted mode, browse a graph, edit its source/output configuration, choose **Preview changes**, then **Save reviewed changes** and **Run reviewed graph**. Expand **Repair selected output dates** for an eligible saved graph. Existing operator configuration still supplies connections and deployed environments.

For real HTTP contract checks, start an ephemeral Dander Control API and use `DANDER_CONTROL_URL=... DANDER_EXPECTED_VERSION=... pnpm test:current-dander`. For an accepted native repair, use the explicit project, graph and run ID variables documented in README with `pnpm test:repair-observation`.

Pull `ghcr.io/harrisonoconnorhover/druff:0.2.0-rc.1`, paired with the published RC34 Control wheel in README. Immutable digest: `sha256:6aade12c399a67c604577e4a022af6dff22db7764626dd9a7a4f5cea1a2ceac1`.

## Checks

- PR #25 and exact-main CI `36877515144` passed: 685 unit/component tests, nine artifact checks, published-contract drift, lint/type/format/build, 11 Playwright journeys and container checks. Browser OIDC/API fixtures are synthetic; default guided-panel screenshot was visually checked.
- Real HTTP acceptance against published RC34 passed. Native observer read `run-ec3ecadaeb48d3cca4ccf537`: September 10–12 window, zero extracted, two written, four affected. Dander separately verified unchanged outside rows/raw/watermark, restored Job and complete temporary-resource cleanup.
- Both candidate architectures passed source-free/non-root runtime, routes/headers, reproducibility, SBOM/provenance and high/critical/secret scans. Existing Caddy findings were corrected with x/crypto 0.55.0 and gRPC 1.83.2.
- Copied the verified OCI bytes without rebuilding; anonymous public fetch matched the exact digest. Active/rollback digests stayed unchanged; local release builder/registry were removed.

## Decisions

- Dander remains the only semantic/execution authority; no provider client or new auth infrastructure was added.
- Missing result documents display Unknown instead of interpreting default counters as measured zeros.
- Date repair rebuilds output partitions from retained raw data; it is explicitly experimental and does not recover historical source records.

## Remaining

- This is an integration candidate, not a promotion of Dander's RC20 public beta or other provider profiles.
- Source credentials and deployed environments still require operator setup; historical source recovery is outside this repair capability.

## Review First

- `src/features/hosted-control/useGraphChangePreview.ts` and `DateRepairPanel.tsx`
- `src/features/hosted-control/control-api.ts` and `integration/`
- `tickets/DRUFF-32-guided-pipeline-journey.md`
