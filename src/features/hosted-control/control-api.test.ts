import { describe, expect, it, vi } from "vitest";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import logsFixture from "@/generated/dander-contracts/bundle/fixtures/log-page.json";
import mutationFixture from "@/generated/dander-contracts/bundle/fixtures/mutation-result.json";
import previewFixture from "@/generated/dander-contracts/bundle/fixtures/deployment-preview.json";
import runFixture from "@/generated/dander-contracts/bundle/fixtures/run-status.json";
import validationFixture from "@/generated/dander-contracts/bundle/fixtures/graph-validation.json";
import {
  HostedControlApiClient,
  HostedControlOperationError,
} from "@/features/hosted-control/control-api";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";

const ADDRESS = { project: "project / one", graph: "graph ? one" };
const REVISION = '"opaque/quoted-etag"';

function capabilities() {
  return {
    ...capabilitiesFixture,
    api_version: "v1",
    contract: {
      id: DANDER_CONTRACT_BUNDLE_ID,
      sha256: DANDER_CONTRACT_BUNDLE_SHA256,
    },
  };
}

function errorResponse(status: number, code: string): Response {
  return Response.json(
    {
      error: {
        code,
        message: "Safe normalized message.",
        correlation_id: "corr-123",
      },
    },
    { status },
  );
}

describe("HostedControlApiClient", () => {
  it("requires compatible authenticated capabilities before hosted use", async () => {
    const request = vi.fn(async () => Response.json(capabilities()));
    const client = new HostedControlApiClient(request);

    await expect(client.capabilities()).resolves.toMatchObject({
      api_version: "v1",
      contract: { sha256: DANDER_CONTRACT_BUNDLE_SHA256 },
    });
    expect(request).toHaveBeenCalledWith("/v1/capabilities", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const stale = {
      ...capabilities(),
      contract: { id: DANDER_CONTRACT_BUNDLE_ID, sha256: "0".repeat(64) },
    };
    request.mockResolvedValueOnce(Response.json(stale));
    await expect(client.capabilities()).rejects.toThrow(/does not match this Druff build/i);
  });

  it("uses exact encoded addresses and quoted ETags for validation and preview", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json(validationFixture))
      .mockResolvedValueOnce(Response.json(previewFixture));
    const client = new HostedControlApiClient(request);

    await expect(client.validate(ADDRESS, REVISION)).resolves.toEqual(validationFixture);
    await expect(client.preview(ADDRESS, REVISION)).resolves.toEqual(previewFixture);

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/v1/projects/project%20%2F%20one/graphs/graph%20%3F%20one/validate",
      { method: "POST", headers: { Accept: "application/json", "If-Match": REVISION } },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/v1/projects/project%20%2F%20one/graphs/graph%20%3F%20one/deployment-preview",
      { method: "POST", headers: { Accept: "application/json", "If-Match": REVISION } },
    );
  });

  it("maps only exact 412 operation_conflict to the reload path", async () => {
    const conflict = new HostedControlApiClient(
      vi.fn(async () => errorResponse(412, "operation_conflict")),
    );
    const wrongCode = new HostedControlApiClient(
      vi.fn(async () => errorResponse(412, "graph_conflict")),
    );

    const caught = await conflict.validate(ADDRESS, REVISION).catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(HostedControlOperationError);
    expect((caught as HostedControlOperationError).conflict).toBe(true);
    await expect(wrongCode.preview(ADDRESS, REVISION)).rejects.toMatchObject({ conflict: false });
  });

  it("renders only bounded generated previews and never echoes malformed raw bodies", async () => {
    const oversized = { ...previewFixture, plan_text: "x".repeat(100_001) };
    const oversizedClient = new HostedControlApiClient(vi.fn(async () => Response.json(oversized)));
    await expect(oversizedClient.preview(ADDRESS, REVISION)).rejects.toThrow(
      /cannot safely display/i,
    );

    const raw = "provider-secret-message-that-must-not-render";
    const malformedClient = new HostedControlApiClient(
      vi.fn(async () => new Response(raw, { status: 503 })),
    );
    const failure = await malformedClient
      .validate(ADDRESS, REVISION)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).not.toContain(raw);
  });

  it("uses exact normalized run routes and correlates every response", async () => {
    const cancel = {
      ...mutationFixture,
      operation: "cancel" as const,
      resulting_run_id: null,
      run_id: runFixture.run_id,
      state: "canceling" as const,
    };
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json(runFixture, { status: 202 }))
      .mockResolvedValueOnce(Response.json(runFixture))
      .mockResolvedValueOnce(Response.json(logsFixture))
      .mockResolvedValueOnce(Response.json(cancel))
      .mockResolvedValueOnce(Response.json(mutationFixture));
    const client = new HostedControlApiClient(request);

    await expect(client.startRun(ADDRESS, REVISION)).resolves.toEqual(runFixture);
    await expect(client.getRun(runFixture.run_id)).resolves.toEqual(runFixture);
    await expect(client.logs(runFixture.run_id, 25)).resolves.toEqual(logsFixture);
    await expect(client.cancelRun(runFixture.run_id)).resolves.toEqual(cancel);
    await expect(client.replayRun(runFixture.run_id)).resolves.toEqual(mutationFixture);

    expect(request.mock.calls[0]?.[0]).toBe(
      "/v1/projects/project%20%2F%20one/graphs/graph%20%3F%20one/runs",
    );
    expect(request.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        "If-Match": REVISION,
        "Idempotency-Key": expect.stringMatching(/^druff-/),
      },
    });
    expect(request.mock.calls[1]?.[0]).toBe("/v1/runs/run-synthetic");
    expect(request.mock.calls[2]?.[0]).toBe("/v1/runs/run-synthetic/logs?limit=25");
    expect(request.mock.calls[3]?.[0]).toBe("/v1/runs/run-synthetic/cancel");
    expect(request.mock.calls[4]?.[0]).toBe("/v1/runs/run-synthetic/replay");
  });

  it("retains the start key across lost or malformed success responses", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("lost response"))
      .mockResolvedValueOnce(Response.json({ ...runFixture, run_id: "" }, { status: 202 }))
      .mockResolvedValueOnce(Response.json(runFixture, { status: 202 }));
    const client = new HostedControlApiClient(request);

    await expect(client.startRun(ADDRESS, REVISION)).rejects.toThrow(/lost response/i);
    await expect(client.startRun(ADDRESS, REVISION)).rejects.toMatchObject({ ambiguous: true });
    await expect(client.startRun(ADDRESS, REVISION)).resolves.toEqual(runFixture);

    const keys = request.mock.calls.map(
      (call) => (call[1]?.headers as Record<string, string>)["Idempotency-Key"],
    );
    expect(new Set(keys).size).toBe(1);
  });

  it("rejects mismatched run identities without clearing mutation keys", async () => {
    const wrongCancel = {
      accepted: true,
      operation: "cancel",
      resulting_run_id: null,
      run_id: "another-run",
      state: "canceling",
    };
    const validCancel = { ...wrongCancel, run_id: runFixture.run_id };
    const missingReplayId = { ...mutationFixture, resulting_run_id: null };
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ ...runFixture, run_id: "another-run" }))
      .mockResolvedValueOnce(Response.json(wrongCancel))
      .mockResolvedValueOnce(Response.json(validCancel))
      .mockResolvedValueOnce(Response.json(missingReplayId))
      .mockResolvedValueOnce(Response.json(mutationFixture));
    const client = new HostedControlApiClient(request);

    await expect(client.getRun(runFixture.run_id)).rejects.toThrow(/different run/i);
    await expect(client.cancelRun(runFixture.run_id)).rejects.toMatchObject({ ambiguous: true });
    await expect(client.cancelRun(runFixture.run_id)).resolves.toMatchObject({
      run_id: runFixture.run_id,
      operation: "cancel",
    });
    await expect(client.replayRun(runFixture.run_id)).rejects.toMatchObject({ ambiguous: true });
    await expect(client.replayRun(runFixture.run_id)).resolves.toEqual(mutationFixture);

    const cancelKeys = [request.mock.calls[1], request.mock.calls[2]].map(
      (call) => (call?.[1]?.headers as Record<string, string>)["Idempotency-Key"],
    );
    const replayKeys = [request.mock.calls[3], request.mock.calls[4]].map(
      (call) => (call?.[1]?.headers as Record<string, string>)["Idempotency-Key"],
    );
    expect(new Set(cancelKeys).size).toBe(1);
    expect(new Set(replayKeys).size).toBe(1);
  });

  it("rejects oversized log fields before presentation", async () => {
    const request = vi.fn(async () =>
      Response.json({
        ...logsFixture,
        records: [{ ...logsFixture.records[0], message: "x".repeat(4_097) }],
      }),
    );
    const client = new HostedControlApiClient(request);

    await expect(client.logs(runFixture.run_id, 25)).rejects.toThrow(/cannot safely display/i);
    await expect(client.logs(runFixture.run_id, 101)).rejects.toThrow(/unsafe hosted log-page/i);
  });
});
