import { describe, expect, it, vi } from "vitest";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import previewFixture from "@/generated/dander-contracts/bundle/fixtures/deployment-preview.json";
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
});
