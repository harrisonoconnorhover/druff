import { describe, expect, it } from "vitest";
import {
  validateMapping,
  validateMappings,
} from "@/features/pipeline-canvas/inspector/validateMapping";
import type { FieldMapping } from "@/lib/pipeline-graph/schema";

// Fixture-only mappings — synthetic field/expression tokens, no real/sensitive data
// (steering/02-engineering.md).

describe("validateMapping", () => {
  it("is valid: a direct mapping with a source and a target", () => {
    const mapping: FieldMapping = {
      source: "contact_id",
      target: "customer_id",
      transformation: null,
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([]);
  });

  it("is valid: a derived mapping (no source) with an expression transformation", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "display_name",
      transformation: {
        kind: "expression",
        expression: "UPPER(full_name)",
        constant: null,
        inputs: ["full_name"],
        metadata: {},
      },
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([]);
  });

  it("is valid: a derived mapping with an explicit null constant transformation", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "notes",
      transformation: {
        kind: "constant",
        expression: null,
        constant: null,
        inputs: [],
        metadata: {},
      },
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([]);
  });

  it("flags a missing target", () => {
    const mapping: FieldMapping = {
      source: "contact_id",
      target: "",
      transformation: null,
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([
      { field: "target", message: "Every mapping must write a target field." },
    ]);
  });

  it("flags a whitespace-only target", () => {
    const mapping: FieldMapping = {
      source: "contact_id",
      target: "   ",
      transformation: null,
      metadata: {},
    };
    expect(validateMapping(mapping)).toContainEqual({
      field: "target",
      message: "Every mapping must write a target field.",
    });
  });

  it("flags a derived mapping (no source, no transformation) as needing a transformation", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "customer_id",
      transformation: null,
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([
      {
        field: "source",
        message: "A derived mapping (no source) needs an expression or constant.",
      },
    ]);
  });

  it("flags both expression and constant present on the transformation (mutual exclusion)", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "customer_id",
      transformation: {
        kind: "expression",
        expression: "UPPER(x)",
        constant: "not-actually-null",
        inputs: [],
        metadata: {},
      },
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([
      {
        field: "transformation",
        message: "A transformation is either an expression or a constant, not both.",
      },
    ]);
  });

  it("flags an empty expression when kind is 'expression'", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "customer_id",
      transformation: {
        kind: "expression",
        expression: "",
        constant: null,
        inputs: [],
        metadata: {},
      },
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([
      { field: "expression", message: "Expression can't be empty." },
    ]);
  });

  it("flags a whitespace-only expression when kind is 'expression'", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "customer_id",
      transformation: {
        kind: "expression",
        expression: "   ",
        constant: null,
        inputs: [],
        metadata: {},
      },
      metadata: {},
    };
    expect(validateMapping(mapping)).toContainEqual({
      field: "expression",
      message: "Expression can't be empty.",
    });
  });

  it("does not flag an empty expression when kind is 'constant'", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "customer_id",
      transformation: { kind: "constant", expression: null, constant: 5, inputs: [], metadata: {} },
      metadata: {},
    };
    expect(validateMapping(mapping)).toEqual([]);
  });

  it("accumulates multiple errors for the same mapping", () => {
    const mapping: FieldMapping = {
      source: null,
      target: "",
      transformation: {
        kind: "expression",
        expression: "",
        constant: null,
        inputs: [],
        metadata: {},
      },
      metadata: {},
    };
    const errors = validateMapping(mapping);
    expect(errors).toContainEqual({
      field: "target",
      message: "Every mapping must write a target field.",
    });
    expect(errors).toContainEqual({ field: "expression", message: "Expression can't be empty." });
    expect(errors).toHaveLength(2);
  });
});

describe("validateMappings", () => {
  it("keys errors by index, omitting valid mappings", () => {
    const valid: FieldMapping = {
      source: "contact_id",
      target: "customer_id",
      transformation: null,
      metadata: {},
    };
    const invalid: FieldMapping = { source: null, target: "", transformation: null, metadata: {} };

    const errors = validateMappings([valid, invalid]);

    expect(errors[0]).toBeUndefined();
    expect(errors[1]).toEqual([
      { field: "target", message: "Every mapping must write a target field." },
      {
        field: "source",
        message: "A derived mapping (no source) needs an expression or constant.",
      },
    ]);
  });

  it("returns an empty object when every mapping is valid", () => {
    const valid: FieldMapping = {
      source: "contact_id",
      target: "customer_id",
      transformation: null,
      metadata: {},
    };
    expect(validateMappings([valid])).toEqual({});
  });
});
