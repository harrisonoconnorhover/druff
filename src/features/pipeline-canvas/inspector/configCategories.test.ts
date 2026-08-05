import { describe, expect, it } from "vitest";
import type { Node } from "@xyflow/react";
import {
  CONFIG_CATEGORIES,
  GENERIC_CONFIG_CATEGORY,
  resolveConfigCategories,
  type ConfigCategory,
} from "@/features/pipeline-canvas/inspector/configCategories";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture node only — no real/sensitive data, per steering/02-engineering.md.
function fixtureNode(data: Partial<PipelineNodeData> = {}): Node<PipelineNodeData> {
  return {
    id: "n1",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: { name: "Fixture node", type: "source", kind: "source", ...data },
    selected: false,
  };
}

// Bare-bones fixture categories with no real component, so the resolution algorithm is testable
// without rendering anything (AC5).
const FIXTURE_FALLBACK: ConfigCategory = {
  id: "fallback",
  label: "Fallback",
  matches: () => true,
  Editor: () => null,
};
const ALWAYS_MATCHES: ConfigCategory = {
  id: "always",
  label: "Always",
  matches: () => true,
  Editor: () => null,
};
const NEVER_MATCHES: ConfigCategory = {
  id: "never",
  label: "Never",
  matches: () => false,
  Editor: () => null,
};
const MATCHES_KIND_WRITE: ConfigCategory = {
  id: "write-only",
  label: "Write only",
  matches: (node) => node.data.kind === "write",
  Editor: () => null,
};

describe("resolveConfigCategories (algorithm, fixture categories)", () => {
  it("returns every matching category in registration order", () => {
    const node = fixtureNode({ kind: "write" });

    expect(
      resolveConfigCategories(
        node,
        [NEVER_MATCHES, MATCHES_KIND_WRITE, ALWAYS_MATCHES],
        FIXTURE_FALLBACK,
      ),
    ).toEqual([MATCHES_KIND_WRITE, ALWAYS_MATCHES]);
  });

  it("falls back to the fallback category when nothing matches", () => {
    const node = fixtureNode({ kind: "source" });

    expect(
      resolveConfigCategories(node, [NEVER_MATCHES, MATCHES_KIND_WRITE], FIXTURE_FALLBACK),
    ).toEqual([FIXTURE_FALLBACK]);
  });

  it("never returns an empty list", () => {
    const node = fixtureNode();

    expect(resolveConfigCategories(node, [], FIXTURE_FALLBACK)).toHaveLength(1);
  });

  it("preserves registration order across multiple matches, independent of node shape", () => {
    const node = fixtureNode();

    expect(
      resolveConfigCategories(node, [ALWAYS_MATCHES, NEVER_MATCHES], FIXTURE_FALLBACK),
    ).toEqual([ALWAYS_MATCHES]);
  });
});

describe("resolveConfigCategories (real registry)", () => {
  it("resolves a node with a registered connectorId to the connector category", () => {
    const node = fixtureNode({ connectorId: "greenhouse" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual(["connector"]);
  });

  it("falls back to generic for a node with an unknown connectorId (AC2)", () => {
    // Still `kind: "source"` (the fixture default): the node carries a `connectorId`, so
    // DRUFF-12's HTTP category (which excludes any node already carrying one — see
    // `category.ts`'s doc comment) doesn't match either; only the connector category's
    // `getConnector(...) != null` check fails, so this falls all the way through to generic.
    const node = fixtureNode({ connectorId: "not-a-real-connector" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual(["generic"]);
  });

  // DRUFF-17: a write-kind node resolves to the Write config category instead of the generic
  // fallback — the config-driven registration this ticket added. After DRUFF-12/13/14/17, every
  // node kind resolves to a category; see the "unknown connectorId source" test above for the one
  // remaining real generic-fallback case (AC2).
  it("resolves a plain write-kind node with no connectorId to the writer config category (DRUFF-17)", () => {
    const node = fixtureNode({ kind: "write" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual(["writer"]);
  });

  // DRUFF-12/14: a bare source node (no connectorId at all) resolves to *both* the HTTP/API
  // settings category and the custom-code category (DRUFF-14's Python-language match for this same
  // "no dedicated custom-API-connector kind yet" node) instead of the generic fallback — the
  // config-driven registrations these tickets added, co-rendering per DRUFF-11's Design.
  it("resolves a plain source node with no connectorId to HTTP + custom-code (DRUFF-12/14)", () => {
    const node = fixtureNode({ kind: "source" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual(["http-request", "custom-code"]);
  });

  // DRUFF-13: a trigger-kind node resolves to the Trigger config category instead of the generic
  // fallback — the config-driven registration this ticket added.
  it("resolves a trigger-kind node to the trigger config category (DRUFF-13)", () => {
    const node = fixtureNode({ kind: "trigger" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual(["trigger"]);
  });

  // DRUFF-14: a transform-kind node resolves to the custom-code category (SQL) instead of the
  // generic fallback.
  it("resolves a transform-kind node to custom code plus canonical operations", () => {
    const node = fixtureNode({ kind: "transform" });

    expect(resolveConfigCategories(node).map((c) => c.id)).toEqual([
      "custom-code",
      "pipeline-operations",
    ]);
  });

  it("registry default args match the exported CONFIG_CATEGORIES/GENERIC_CONFIG_CATEGORY", () => {
    const node = fixtureNode();

    expect(resolveConfigCategories(node, CONFIG_CATEGORIES, GENERIC_CONFIG_CATEGORY)).toEqual(
      resolveConfigCategories(node),
    );
  });
});
