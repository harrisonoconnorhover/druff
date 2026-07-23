import { describe, expect, it } from "vitest";
import { createNode } from "@/features/pipeline-canvas/nodes/createNode";
import {
  NODE_KINDS,
  PIPELINE_NODE_KINDS,
  isPipelineNodeKind,
} from "@/features/pipeline-canvas/nodes/nodeKinds";
import { defaultTypeForKind } from "@/lib/pipeline-graph";
import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";
import { defaultConfigForDescriptor } from "@/features/connector-library/defaultConfig";

describe("createNode", () => {
  it.each(PIPELINE_NODE_KINDS)("builds a well-formed %s node", (kind) => {
    const position = { x: 123, y: 45 };

    const node = createNode(kind, position, "test-id");

    expect(node).toEqual({
      id: "test-id",
      type: "pipelineNode",
      position,
      data: { name: NODE_KINDS[kind].defaultLabel, type: defaultTypeForKind(kind), kind },
    });
  });

  it("does not mutate the given position object", () => {
    const position = { x: 1, y: 2 };

    createNode("source", position, "id");

    expect(position).toEqual({ x: 1, y: 2 });
  });

  it("seeds connectorId + default config when a known connectorId is given", () => {
    const node = createNode("source", { x: 0, y: 0 }, "id", "greenhouse");

    expect(node.data.connectorId).toBe("greenhouse");
    expect(node.data.config).toEqual(defaultConfigForDescriptor(GREENHOUSE_CONNECTOR));
  });

  it("never seeds a non-empty default for the connector's secret field", () => {
    const node = createNode("source", { x: 0, y: 0 }, "id", "greenhouse");

    expect(node.data.config?.harvest_api_key_ref).toBe("");
  });

  it("ignores an unknown connectorId and falls back to a plain node", () => {
    const node = createNode("source", { x: 0, y: 0 }, "id", "not-a-real-connector");

    expect(node.data.connectorId).toBeUndefined();
    expect(node.data.config).toBeUndefined();
  });
});

describe("isPipelineNodeKind", () => {
  it.each(PIPELINE_NODE_KINDS)("accepts the known kind %s", (kind) => {
    expect(isPipelineNodeKind(kind)).toBe(true);
  });

  it("rejects an unknown string", () => {
    expect(isPipelineNodeKind("bogus")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isPipelineNodeKind(undefined)).toBe(false);
    expect(isPipelineNodeKind(42)).toBe(false);
  });
});
