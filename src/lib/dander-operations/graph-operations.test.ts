import { describe, expect, it, vi } from "vitest";
import {
  DanderApiGraphOperations,
  GraphOperationsError,
} from "@/lib/dander-operations/graph-operations";

const STATUS = {
  enabled: true,
  deployment_preview_enabled: true,
  graph_name: "greenhouse-jobs",
  revision: "revision-1",
  binding: {
    project: "proof-project",
    pipeline_id: "greenhouse_jobs_graph",
    region: "us-central1",
    job_name: "dander-greenhouse-graph",
  },
  execution: {
    name: "dander-greenhouse-graph-abcde",
    state: "succeeded",
    started_at: "2026-08-03T12:00:00Z",
    completed_at: "2026-08-03T12:01:00Z",
    succeeded_count: 1,
    failed_count: 0,
    log_uri: "https://console.cloud.google.com/run/jobs/executions/details/example",
  },
  run: {
    run_id: "run-1",
    pipeline_id: "greenhouse_jobs_graph",
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
};

describe("DanderApiGraphOperations", () => {
  it("reads and validates the compact deployed execution status", async () => {
    const fetchOperations = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(STATUS), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const operations = new DanderApiGraphOperations("http://127.0.0.1:8765/", fetchOperations);

    await expect(operations.status()).resolves.toEqual(STATUS);
    expect(fetchOperations).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/graph/status", {
      method: "GET",
      headers: { Accept: "application/json" },
      targetAddressSpace: "local",
    });
  });

  it("forwards the exact opened revision to validate, run, and preview", async () => {
    const validateResult = {
      valid: true,
      graph_name: STATUS.graph_name,
      revision: STATUS.revision,
      binding: STATUS.binding,
    };
    const runResult = {
      execution: { ...STATUS.execution, state: "starting", completed_at: null },
    };
    const previewResult = {
      revision: "revision-1",
      candidate_image:
        "us-central1-docker.pkg.dev/proof-project/dander/dander@sha256:" + "a".repeat(64),
      plan_sha256: "b".repeat(64),
      plan_summary: "Plan: 0 to add, 1 to change, 0 to destroy.",
      plan_text: "exact human plan",
      affected_jobs: ["dander-greenhouse-graph"],
    };
    const fetchOperations = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(validateResult), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(runResult), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(previewResult), { status: 200 }));
    const operations = new DanderApiGraphOperations("http://127.0.0.1:8765", fetchOperations);

    await expect(operations.validate('"revision-1"')).resolves.toEqual(validateResult);
    await expect(operations.run('"revision-1"')).resolves.toEqual(runResult);
    await expect(operations.previewDeployment('"revision-1"')).resolves.toEqual(previewResult);

    expect(fetchOperations).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8765/v1/graph/validate", {
      method: "POST",
      headers: { Accept: "application/json", "If-Match": '"revision-1"' },
      targetAddressSpace: "local",
    });
    expect(fetchOperations).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8765/v1/graph/run", {
      method: "POST",
      headers: { Accept: "application/json", "If-Match": '"revision-1"' },
      targetAddressSpace: "local",
    });
    expect(fetchOperations).toHaveBeenNthCalledWith(
      3,
      "http://127.0.0.1:8765/v1/graph/deployment-preview",
      {
        method: "POST",
        headers: { Accept: "application/json", "If-Match": '"revision-1"' },
        targetAddressSpace: "local",
      },
    );
  });

  it("surfaces an actionable API error but never echoes an unvalidated body", async () => {
    const fetchOperations = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "A deployed execution is already active." }), {
          status: 409,
        }),
      )
      .mockResolvedValueOnce(new Response("private row contents", { status: 502 }));
    const operations = new DanderApiGraphOperations("http://127.0.0.1:8765", fetchOperations);

    const conflict = await operations.run('"revision-1"').catch((error) => error);
    expect(conflict).toBeInstanceOf(GraphOperationsError);
    expect(conflict).toMatchObject({
      status: 409,
      message: "A deployed execution is already active.",
    });

    const invalid = await operations.status().catch((error) => error);
    expect(invalid).toBeInstanceOf(GraphOperationsError);
    expect(invalid.message).not.toContain("private row contents");
    expect(invalid.message).toContain("502");
  });
});
