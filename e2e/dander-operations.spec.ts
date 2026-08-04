import { expect, test } from "@playwright/test";

const ORIGIN = "http://localhost:3000";
const REVISION = '"revision-1"';
const GRAPH = { name: "greenhouse-jobs", nodes: [], edges: [] };
const BINDING = {
  project: "proof-project",
  pipeline_id: "greenhouse_jobs_graph",
  region: "us-central1",
  job_name: "dander-greenhouse-graph",
};

test("validates, runs, and inspects the already-deployed Dander graph", async ({ page }) => {
  let statusReads = 0;
  const operationRevisions: string[] = [];

  await page.route("http://127.0.0.1:8765/v1/graph**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-Match",
      "Access-Control-Expose-Headers": "ETag",
      "Content-Type": "application/json",
    };
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (url.pathname === "/v1/graph") {
      await route.fulfill({
        status: 200,
        headers: { ...headers, ETag: REVISION },
        body: JSON.stringify(GRAPH),
      });
      return;
    }
    if (url.pathname === "/v1/graph/status") {
      statusReads += 1;
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          enabled: true,
          deployment_preview_enabled: true,
          graph_name: GRAPH.name,
          revision: "revision-1",
          binding: BINDING,
          execution:
            statusReads === 1
              ? null
              : {
                  name: "dander-greenhouse-graph-abcde",
                  state: "succeeded",
                  started_at: "2026-08-03T12:00:00Z",
                  completed_at: "2026-08-03T12:01:00Z",
                  succeeded_count: 1,
                  failed_count: 0,
                  log_uri: null,
                },
          run:
            statusReads === 1
              ? null
              : {
                  run_id: "run-1",
                  pipeline_id: BINDING.pipeline_id,
                  source: "greenhouse_job_board",
                  status: "succeeded",
                  stage: "complete",
                  started_at: "2026-08-03T12:00:00Z",
                  finished_at: "2026-08-03T12:01:00Z",
                  endpoints: 1,
                  extracted: 21,
                  affected: 21,
                  models: 0,
                  assertions: 0,
                  assets: 0,
                  failure_stage: null,
                },
        }),
      });
      return;
    }

    operationRevisions.push(request.headers()["if-match"] ?? "missing");
    if (url.pathname === "/v1/graph/validate") {
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          valid: true,
          graph_name: GRAPH.name,
          revision: "revision-1",
          binding: BINDING,
        }),
      });
      return;
    }
    if (url.pathname === "/v1/graph/run") {
      await route.fulfill({
        status: 202,
        headers,
        body: JSON.stringify({
          execution: {
            name: "dander-greenhouse-graph-abcde",
            state: "starting",
            started_at: null,
            completed_at: null,
            succeeded_count: 0,
            failed_count: 0,
            log_uri: null,
          },
        }),
      });
      return;
    }
    if (url.pathname === "/v1/graph/deployment-preview") {
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          revision: "revision-1",
          candidate_image:
            "us-central1-docker.pkg.dev/proof-project/dander/dander@sha256:" + "a".repeat(64),
          plan_sha256: "b".repeat(64),
          plan_summary: "Plan: 0 to add, 1 to change, 0 to destroy.",
          plan_text: "exact human Terraform plan",
          affected_jobs: ["dander-greenhouse-graph", "dander-hubspot-companies"],
        }),
      });
      return;
    }
    await route.fulfill({ status: 404, headers, body: JSON.stringify({ error: "Not found." }) });
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Run deployed job" })).toBeDisabled();
  await page.getByRole("button", { name: "Open from Dander" }).click();
  await page.getByRole("button", { name: "Refresh status" }).click();

  await expect(page.getByText(/greenhouse_jobs_graph → dander-greenhouse-graph/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Validate graph" })).toBeEnabled();
  await page.getByRole("button", { name: "Validate graph" }).click();
  await expect(page.getByText("Graph valid", { exact: true })).toBeVisible();

  await expect(page.getByRole("button", { name: "Build candidate & plan" })).toBeEnabled();
  await page.getByRole("button", { name: "Build candidate & plan" }).click();
  await expect(page.getByText("Candidate image pushed; no infrastructure applied.")).toBeVisible();
  await page.getByText("Review exact Terraform plan").click();
  await expect(page.getByText("exact human Terraform plan")).toBeVisible();
  await expect(page.getByText(/Shared image consumers:.*dander-hubspot-companies/)).toBeVisible();

  await page.getByRole("button", { name: "Run deployed job" }).click();
  await expect(page.getByText(/Cloud Run: starting/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Run deployed job" })).toBeDisabled();

  await page.getByRole("button", { name: "Refresh status" }).click();
  await expect(page.getByText(/Cloud Run: succeeded/)).toBeVisible();
  await expect(page.getByText(/Dander ledger: succeeded\/complete · 21 extracted/)).toBeVisible();
  await expect(page.getByText(/never applies infrastructure or changes a schedule/)).toBeVisible();
  expect(operationRevisions).toEqual([REVISION, REVISION, REVISION]);
});
