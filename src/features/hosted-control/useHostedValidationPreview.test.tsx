import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import previewFixture from "@/generated/dander-contracts/bundle/fixtures/deployment-preview.json";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";
import { HostedControlOperationError } from "@/features/hosted-control/control-api";
import {
  useHostedValidationPreview,
  type HostedValidationPreviewClient,
} from "@/features/hosted-control/useHostedValidationPreview";
import { CapabilitiesResponseSchema } from "@/lib/dander-contracts";
import { SEED_GRAPH, useGraphStore } from "@/lib/graph-store";

const ADDRESS = { project: "demo-project", graph: "alpha-graph" };
const REVISION = '"opaque-etag"';
const CONTENT_SHA = "a".repeat(64);
const CAPABILITIES = CapabilitiesResponseSchema.parse({
  ...capabilitiesFixture,
  contract: {
    id: DANDER_CONTRACT_BUNDLE_ID,
    sha256: DANDER_CONTRACT_BUNDLE_SHA256,
  },
  operations: ["graph.read", "graph.validate", "deployment.preview"],
});

beforeEach(() => {
  useGraphStore
    .getState()
    .setGraph(SEED_GRAPH.nodes, SEED_GRAPH.edges, SEED_GRAPH.name, SEED_GRAPH.trigger);
});

describe("useHostedValidationPreview", () => {
  it("attributes Dander issues inline and clears them as soon as the graph becomes dirty", async () => {
    const firstNodeId = useGraphStore.getState().nodes[0]!.id;
    const client: HostedValidationPreviewClient = {
      validate: vi.fn(async () => ({
        valid: false,
        graph_name: SEED_GRAPH.name,
        content_sha256: CONTENT_SHA,
        issues: [
          { location: "nodes.0.config", message: "Fix this node.", type: "value_error" },
          { location: "graph.trigger", message: "Fix the trigger.", type: "value_error" },
        ],
      })),
      preview: vi.fn(async () => previewFixture),
    };
    const { result, rerender } = renderHook(
      ({ clean }) =>
        useHostedValidationPreview({
          client,
          capabilities: CAPABILITIES,
          address: ADDRESS,
          revision: REVISION,
          contentSha256: CONTENT_SHA,
          graphIsClean: clean,
        }),
      { initialProps: { clean: true } },
    );

    await act(async () => result.current.validate());
    expect(result.current.remoteViolations.byNodeId[firstNodeId]).toEqual([
      expect.objectContaining({ kind: "dander-validation", message: "Fix this node." }),
    ]);
    expect(result.current.generalIssues).toEqual([
      expect.objectContaining({ location: "graph.trigger" }),
    ]);

    rerender({ clean: false });
    expect(result.current.validation).toBeNull();
    expect(result.current.remoteViolations).toEqual({ byNodeId: {}, byEdgeId: {} });
  });

  it("discards a validation response when the exact public identity changes in flight", async () => {
    let resolveValidation!: (value: {
      valid: boolean;
      graph_name: string;
      content_sha256: string;
      issues: never[];
    }) => void;
    const pending = new Promise<{
      valid: boolean;
      graph_name: string;
      content_sha256: string;
      issues: never[];
    }>((resolve) => {
      resolveValidation = resolve;
    });
    const client: HostedValidationPreviewClient = {
      validate: vi.fn(async () => pending),
      preview: vi.fn(async () => previewFixture),
    };
    const { result, rerender } = renderHook(
      ({ revision }) =>
        useHostedValidationPreview({
          client,
          capabilities: CAPABILITIES,
          address: ADDRESS,
          revision,
          contentSha256: CONTENT_SHA,
          graphIsClean: true,
        }),
      { initialProps: { revision: REVISION } },
    );

    let validating!: Promise<void>;
    act(() => {
      validating = result.current.validate();
    });
    rerender({ revision: '"new-etag"' });
    resolveValidation({
      valid: true,
      graph_name: SEED_GRAPH.name,
      content_sha256: CONTENT_SHA,
      issues: [],
    });
    await act(async () => validating);

    expect(result.current.validation).toBeNull();
    expect(result.current.pending).toBeNull();
  });

  it("maps revision conflicts to reload and never interprets the preview revision as an ETag", async () => {
    const client: HostedValidationPreviewClient = {
      validate: vi.fn(async () => {
        throw new HostedControlOperationError("The revision changed. Correlation ID: corr-1.", {
          conflict: true,
        });
      }),
      preview: vi.fn(async () => ({ ...previewFixture, revision: "provider/native-revision" })),
    };
    const { result } = renderHook(() =>
      useHostedValidationPreview({
        client,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        contentSha256: CONTENT_SHA,
        graphIsClean: true,
      }),
    );

    await act(async () => result.current.validate());
    expect(result.current.conflict).toBe(true);
    expect(result.current.error).toMatch(/reload/i);

    await act(async () => result.current.previewDeployment());
    expect(result.current.preview?.revision).toBe("provider/native-revision");
    expect(client.preview).toHaveBeenCalledWith(ADDRESS, REVISION);
  });

  it("rejects validation for a different canonical content hash", async () => {
    const client: HostedValidationPreviewClient = {
      validate: vi.fn(async () => ({
        valid: true,
        graph_name: SEED_GRAPH.name,
        content_sha256: "b".repeat(64),
        issues: [],
      })),
      preview: vi.fn(async () => previewFixture),
    };
    const { result } = renderHook(() =>
      useHostedValidationPreview({
        client,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        contentSha256: CONTENT_SHA,
        graphIsClean: true,
      }),
    );

    await act(async () => result.current.validate());
    expect(result.current.validation).toBeNull();
    expect(result.current.error).toMatch(/different graph revision/i);
  });
});
