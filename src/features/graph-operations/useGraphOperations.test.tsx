import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGraphOperations } from "@/features/graph-operations/useGraphOperations";
import type {
  GraphOperationsClient,
  GraphOperationsStatus,
} from "@/lib/dander-operations/graph-operations";

const STATUS: Extract<GraphOperationsStatus, { enabled: true }> = {
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
  execution: null,
  run: null,
};

function client(): GraphOperationsClient {
  return {
    status: vi.fn(async () => STATUS),
    validate: vi.fn(async () => ({
      valid: true as const,
      graph_name: STATUS.graph_name,
      revision: STATUS.revision,
      binding: STATUS.binding,
    })),
    run: vi.fn(async () => ({
      execution: {
        name: "dander-greenhouse-graph-abcde",
        state: "starting" as const,
        started_at: null,
        completed_at: null,
        succeeded_count: 0,
        failed_count: 0,
        log_uri: null,
      },
    })),
    previewDeployment: vi.fn(async (revision: string) => ({
      revision,
      candidate_image:
        "us-central1-docker.pkg.dev/proof-project/dander/dander@sha256:" + "a".repeat(64),
      plan_sha256: "b".repeat(64),
      plan_summary: "Plan: 0 to add, 1 to change, 0 to destroy.",
      plan_text: "exact human plan",
      affected_jobs: ["dander-greenhouse-graph"],
    })),
  };
}

describe("useGraphOperations", () => {
  it("loads status for the opened revision, validates it, and starts the fixed job", async () => {
    const operations = client();
    const { result } = renderHook(() =>
      useGraphOperations({
        revision: '"revision-1"',
        graphIsClean: true,
        client: operations,
      }),
    );

    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.status).toEqual(STATUS));
    expect(result.current.canValidate).toBe(true);
    expect(result.current.canRun).toBe(true);
    expect(result.current.canPreviewDeployment).toBe(true);

    await act(async () => result.current.validate());
    expect(operations.validate).toHaveBeenCalledWith('"revision-1"');
    expect(result.current.validation).toBe("valid");

    await act(async () => result.current.run());
    expect(operations.run).toHaveBeenCalledWith('"revision-1"');
    expect(result.current.status?.enabled && result.current.status.execution?.state).toBe(
      "starting",
    );
    expect(result.current.canRun).toBe(false);

    await act(async () => result.current.previewDeployment());
    expect(operations.previewDeployment).toHaveBeenCalledWith('"revision-1"');
    expect(result.current.deploymentPreview?.plan_text).toBe("exact human plan");
  });

  it("cannot validate or run a detached or dirty graph", async () => {
    const operations = client();
    const initialProps: { revision: string | null; clean: boolean } = {
      revision: null,
      clean: true,
    };
    const { result, rerender } = renderHook(
      ({ revision, clean }: { revision: string | null; clean: boolean }) =>
        useGraphOperations({ revision, graphIsClean: clean, client: operations }),
      { initialProps },
    );

    expect(result.current.canValidate).toBe(false);
    expect(result.current.canRun).toBe(false);
    expect(result.current.canPreviewDeployment).toBe(false);

    rerender({ revision: '"revision-1"', clean: false });
    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.status).toEqual(STATUS));
    expect(result.current.canValidate).toBe(false);
    expect(result.current.canRun).toBe(false);
    expect(result.current.canPreviewDeployment).toBe(false);

    await act(async () => result.current.run());
    expect(operations.run).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/open and save/i);
  });

  it("keeps Run disabled while Dander reports an active execution", async () => {
    const operations = client();
    vi.mocked(operations.status).mockResolvedValue({
      ...STATUS,
      execution: {
        name: "dander-greenhouse-graph-active",
        state: "running",
        started_at: "2026-08-03T12:00:00Z",
        completed_at: null,
        succeeded_count: 0,
        failed_count: 0,
        log_uri: null,
      },
    });
    const { result } = renderHook(() =>
      useGraphOperations({
        revision: '"revision-1"',
        graphIsClean: true,
        client: operations,
      }),
    );

    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.status?.enabled).toBe(true));
    expect(result.current.canRun).toBe(false);
  });
});
