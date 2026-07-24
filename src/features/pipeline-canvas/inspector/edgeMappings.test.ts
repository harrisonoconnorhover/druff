import { describe, expect, it } from "vitest";
import {
  addMapping,
  derivedKind,
  moveMapping,
  removeMapping,
  setConstant,
  setExpression,
  setMappingField,
  setTransformationKind,
} from "@/features/pipeline-canvas/inspector/edgeMappings";
import type { FieldMapping } from "@/lib/pipeline-graph/schema";

// Fixture-only mappings — synthetic field/expression tokens, no real/sensitive data
// (steering/02-engineering.md).
const DIRECT_MAPPING: FieldMapping = {
  source: "contact_id",
  target: "customer_id",
  transformation: null,
  metadata: {},
};

const EXPRESSION_MAPPING: FieldMapping = {
  source: null,
  target: "display_name",
  transformation: {
    kind: "expression",
    expression: "UPPER(full_name)",
    constant: null,
    inputs: ["full_name"],
    metadata: { owner: "data-eng" },
  },
  metadata: {},
};

const CONSTANT_MAPPING: FieldMapping = {
  source: null,
  target: "status",
  transformation: {
    kind: "constant",
    expression: null,
    constant: "active",
    inputs: [],
    metadata: {},
  },
  metadata: {},
};

describe("addMapping", () => {
  it("appends a blank, derived, direct mapping", () => {
    const next = addMapping([DIRECT_MAPPING]);

    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({ source: null, target: "", transformation: null, metadata: {} });
    // The original mapping is untouched.
    expect(next[0]).toBe(DIRECT_MAPPING);
  });

  it("works on an empty list", () => {
    expect(addMapping([])).toHaveLength(1);
  });
});

describe("removeMapping", () => {
  it("removes the mapping at the given index", () => {
    const next = removeMapping([DIRECT_MAPPING, EXPRESSION_MAPPING], 0);

    expect(next).toEqual([EXPRESSION_MAPPING]);
  });

  it("is a no-op for an out-of-range index", () => {
    const mappings = [DIRECT_MAPPING];
    expect(removeMapping(mappings, 5)).toBe(mappings);
    expect(removeMapping(mappings, -1)).toBe(mappings);
  });
});

describe("moveMapping", () => {
  const mappings = [DIRECT_MAPPING, EXPRESSION_MAPPING, CONSTANT_MAPPING];

  it("swaps a mapping with its previous neighbor on 'up'", () => {
    const next = moveMapping(mappings, 1, "up");
    expect(next).toEqual([EXPRESSION_MAPPING, DIRECT_MAPPING, CONSTANT_MAPPING]);
  });

  it("swaps a mapping with its next neighbor on 'down'", () => {
    const next = moveMapping(mappings, 1, "down");
    expect(next).toEqual([DIRECT_MAPPING, CONSTANT_MAPPING, EXPRESSION_MAPPING]);
  });

  it("clamps at the start (moving the first mapping up is a no-op)", () => {
    expect(moveMapping(mappings, 0, "up")).toBe(mappings);
  });

  it("clamps at the end (moving the last mapping down is a no-op)", () => {
    expect(moveMapping(mappings, mappings.length - 1, "down")).toBe(mappings);
  });

  it("is a no-op for an out-of-range index", () => {
    expect(moveMapping(mappings, 99, "up")).toBe(mappings);
  });
});

describe("setMappingField", () => {
  it("updates target, leaving source and transformation untouched", () => {
    const next = setMappingField([DIRECT_MAPPING], 0, { target: "new_target" });
    expect(next[0]).toEqual({ ...DIRECT_MAPPING, target: "new_target" });
  });

  it("updates source to a field name", () => {
    const next = setMappingField([EXPRESSION_MAPPING], 0, { source: "full_name" });
    expect(next[0].source).toBe("full_name");
  });

  it("sets source to null (derived)", () => {
    const next = setMappingField([DIRECT_MAPPING], 0, { source: null });
    expect(next[0].source).toBeNull();
  });

  it("is a no-op for an out-of-range index", () => {
    const mappings = [DIRECT_MAPPING];
    expect(setMappingField(mappings, 3, { target: "x" })).toBe(mappings);
  });
});

describe("derivedKind", () => {
  it("reads 'direct' for a null transformation", () => {
    expect(derivedKind(DIRECT_MAPPING)).toBe("direct");
  });

  it("reads the transformation's own kind when present", () => {
    expect(derivedKind(EXPRESSION_MAPPING)).toBe("expression");
    expect(derivedKind(CONSTANT_MAPPING)).toBe("constant");
  });
});

describe("setTransformationKind", () => {
  it("switching to 'direct' clears the transformation to null", () => {
    const next = setTransformationKind([EXPRESSION_MAPPING], 0, "direct");
    expect(next[0].transformation).toBeNull();
  });

  it("switching a direct mapping to 'expression' produces a well-formed, empty expression payload", () => {
    const next = setTransformationKind([DIRECT_MAPPING], 0, "expression");
    expect(next[0].transformation).toEqual({
      kind: "expression",
      expression: "",
      constant: null,
      inputs: [],
      metadata: {},
    });
  });

  it("switching a direct mapping to 'constant' produces a well-formed, null constant payload", () => {
    const next = setTransformationKind([DIRECT_MAPPING], 0, "constant");
    expect(next[0].transformation).toEqual({
      kind: "constant",
      expression: null,
      constant: null,
      inputs: [],
      metadata: {},
    });
  });

  it("switching 'expression' -> 'constant' clears the expression payload but preserves inputs/metadata", () => {
    const next = setTransformationKind([EXPRESSION_MAPPING], 0, "constant");
    expect(next[0].transformation).toEqual({
      kind: "constant",
      expression: null,
      constant: null,
      inputs: ["full_name"],
      metadata: { owner: "data-eng" },
    });
  });

  it("switching 'constant' -> 'expression' clears the constant payload but preserves an explicit null constant's inputs/metadata", () => {
    const withMeta: FieldMapping = {
      ...CONSTANT_MAPPING,
      transformation: {
        kind: "constant",
        expression: null,
        constant: null, // explicit null constant, not "unset"
        inputs: ["a"],
        metadata: { note: "explicit-null" },
      },
    };
    const next = setTransformationKind([withMeta], 0, "expression");
    expect(next[0].transformation).toEqual({
      kind: "expression",
      expression: "",
      constant: null,
      inputs: ["a"],
      metadata: { note: "explicit-null" },
    });
  });

  it("re-selecting the same kind preserves the existing payload verbatim", () => {
    const next = setTransformationKind([EXPRESSION_MAPPING], 0, "expression");
    expect(next[0].transformation).toEqual(EXPRESSION_MAPPING.transformation);
  });

  it("is a no-op for an out-of-range index", () => {
    const mappings = [DIRECT_MAPPING];
    expect(setTransformationKind(mappings, 9, "expression")).toBe(mappings);
  });
});

describe("setExpression", () => {
  it("sets the expression string on a mapping already carrying an expression transformation", () => {
    const next = setExpression([EXPRESSION_MAPPING], 0, "LOWER(full_name)");
    expect(next[0].transformation?.expression).toBe("LOWER(full_name)");
    // Other transformation keys untouched.
    expect(next[0].transformation?.inputs).toEqual(["full_name"]);
  });

  it("is a no-op when the mapping has no transformation yet (direct)", () => {
    const next = setExpression([DIRECT_MAPPING], 0, "SOMETHING()");
    expect(next[0]).toBe(DIRECT_MAPPING);
  });
});

describe("setConstant", () => {
  it("sets the constant literal on a mapping already carrying a constant transformation", () => {
    const next = setConstant([CONSTANT_MAPPING], 0, 42);
    expect(next[0].transformation?.constant).toBe(42);
  });

  it("stores an explicit null constant, distinguishable from 'not provided'", () => {
    const next = setConstant([CONSTANT_MAPPING], 0, null);
    expect(next[0].transformation).not.toBeNull();
    expect(next[0].transformation?.constant).toBeNull();
  });

  it("is a no-op when the mapping has no transformation yet (direct)", () => {
    const next = setConstant([DIRECT_MAPPING], 0, "x");
    expect(next[0]).toBe(DIRECT_MAPPING);
  });
});
