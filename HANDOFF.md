# Morning Handoff

## Finished

- Added a separate **Build candidate & plan** action for a clean, saved Dander graph revision.
- Displayed the immutable candidate digest, concise plan summary, all shared-image jobs, and exact human Terraform plan.
- Hid stale preview results as soon as the graph becomes dirty or its revision changes.
- Kept Save file-only and kept deployment, apply, scheduling, project selection, and cloud inputs out of Druff.
- Exercised the complete action against the retained Dander project without deploying the candidate.

## Try It

```bash
dander graph serve --file /path/to/graphs/greenhouse_jobs.yaml \
  --config /path/to/dander.yaml --pipeline greenhouse_jobs_graph \
  --project YOUR_PROJECT --enable-deployment-preview \
  --failure-alert-email YOUR_ALERT_EMAIL --billing-account YOUR_BILLING_ACCOUNT
npm run dev
```

Open from Dander, Refresh status, then choose **Build candidate & plan**.

## Checks

- ESLint, TypeScript, and Prettier checks passed.
- `npm test` passed: 49 files and 556 tests.
- All 7 Playwright workflows passed in Chromium; the production Next.js build passed.
- Live UI proof displayed `0 add, 5 change, 0 destroy` and all five shared-image jobs.
- Druff performed no apply, deployment, schedule, state, dataset, IAM, or secret mutation.

## Decisions

- The Dander server owns cloud authority; Druff sends only the saved graph revision.
- Candidate planning is explicit and separate from both Save and Run deployed job.
- The returned plan is human-readable and non-applyable; Druff never receives Terraform state or plan binaries.

## Remaining

- Push and open focused Dander and Druff PRs only after explicit approval.
- Let protected CI repeat unit, browser, Linux build, and security checks.
- Treat any candidate deployment as a separate, explicitly approved action.

## Review First

- `src/features/graph-operations/GraphOperationsBar.tsx`
- `src/features/graph-operations/useGraphOperations.ts`
- `e2e/dander-operations.spec.ts`
