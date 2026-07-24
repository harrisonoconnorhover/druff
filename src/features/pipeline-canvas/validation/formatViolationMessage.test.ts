import { describe, expect, it } from "vitest";
import { formatViolationMessage } from "@/features/pipeline-canvas/validation/formatViolationMessage";

// Fixture-only ids/field names, no real/sensitive data (steering/01-security.md, 02-engineering.md).
describe("formatViolationMessage", () => {
  it("formats duplicate-node-id with the offending id", () => {
    const message = formatViolationMessage({ kind: "duplicate-node-id", nodeId: "crm_source" });
    expect(message).toBe('Node id "crm_source" is used by more than one node.');
  });

  it("formats dangling-edge naming both endpoints and the missing id", () => {
    const message = formatViolationMessage({
      kind: "dangling-edge",
      edge: { from: "crm_source", to: "ghost_node", edgeIndex: 0 },
      missingId: "ghost_node",
    });
    expect(message).toBe(
      'Edge from "crm_source" to "ghost_node" references missing node "ghost_node".',
    );
  });

  it("formats self-loop naming the node", () => {
    const message = formatViolationMessage({
      kind: "self-loop",
      nodeId: "crm_source",
      edge: { from: "crm_source", to: "crm_source", edgeIndex: 0 },
    });
    expect(message).toBe('Node "crm_source" has an edge that connects to itself.');
  });

  it("formats graph-cycle as an arrow-joined path", () => {
    const message = formatViolationMessage({
      kind: "graph-cycle",
      cycle: ["a", "b", "a"],
    });
    expect(message).toBe("Cycle detected: a → b → a.");
  });

  it("formats duplicate-field-name naming the node and field", () => {
    const message = formatViolationMessage({
      kind: "duplicate-field-name",
      nodeId: "crm_source",
      fieldName: "email",
    });
    expect(message).toBe('Node "crm_source" declares field "email" more than once.');
  });

  it.each([
    ["mapping_source", "mapping source"],
    ["mapping_target", "mapping target"],
    ["transformation_input", "transformation input"],
  ] as const)("formats unknown-field-reference for %s", (referenceKind, label) => {
    const message = formatViolationMessage({
      kind: "unknown-field-reference",
      nodeId: "crm_source",
      fieldName: "email",
      edge: { from: "crm_source", to: "warehouse", edgeIndex: 0 },
      referenceKind,
    });
    expect(message).toBe(`Field "email" is not declared on node "crm_source" (${label}).`);
  });

  it.each([
    ["join_left", "join key, left"],
    ["join_right", "join key, right"],
  ] as const)("formats join-key-field for %s with a 1-based key index", (referenceKind, label) => {
    const message = formatViolationMessage({
      kind: "join-key-field",
      nodeId: "crm_source",
      fieldName: "email",
      edge: { from: "crm_source", to: "warehouse", edgeIndex: 0 },
      referenceKind,
      keyIndex: 0,
    });
    expect(message).toBe(
      `Field "email" is not declared on node "crm_source" (join key #1, ${label}).`,
    );
  });

  it("never includes a sensitive-looking value even when the fixture id/field names resemble one", () => {
    // The Violation type structurally carries no config/metadata/expression payload — this locks
    // that no such field can leak through message formatting even if a caller mistakenly
    // constructed a fixture with a suspicious-looking (but still purely structural) name.
    const message = formatViolationMessage({
      kind: "duplicate-field-name",
      nodeId: "n1",
      fieldName: "ssn",
    });
    expect(message).not.toMatch(/config|metadata|expression|constant/i);
  });
});
