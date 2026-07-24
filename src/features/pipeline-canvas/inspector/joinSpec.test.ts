import { describe, expect, it } from "vitest";
import {
  addKeyPair,
  createJoinSpec,
  moveKeyPair,
  removeKeyPair,
  setJoinType,
  updateKeyPair,
  validateJoinSpec,
} from "@/features/pipeline-canvas/inspector/joinSpec";
import { JoinSpecSchema } from "@/lib/pipeline-graph/schema";
import type { JoinSpec } from "@/lib/pipeline-graph/schema";

// Fixture-only join specs — synthetic field names (e.g. `account_id`), no real/sensitive data
// (steering/02-engineering.md).
const TWO_PAIR_JOIN: JoinSpec = {
  type: "left",
  keys: [
    { left: "account_id", right: "account_id" },
    { left: "region", right: "region_code" },
  ],
  metadata: { note: "fixture" },
};

describe("createJoinSpec", () => {
  it("is valid-by-construction: inner type, one blank pair, empty metadata", () => {
    expect(createJoinSpec()).toEqual({
      type: "inner",
      keys: [{ left: "", right: "" }],
      metadata: {},
    });
  });

  it("parses clean through JoinSpecSchema (AC5 shape guard)", () => {
    expect(() => JoinSpecSchema.parse(createJoinSpec())).not.toThrow();
  });
});

describe("setJoinType", () => {
  it("sets the type, leaving keys/metadata untouched", () => {
    const next = setJoinType(TWO_PAIR_JOIN, "full");
    expect(next).toEqual({ ...TWO_PAIR_JOIN, type: "full" });
  });
});

describe("addKeyPair", () => {
  it("appends a blank pair to the end", () => {
    const next = addKeyPair(TWO_PAIR_JOIN);
    expect(next.keys).toHaveLength(3);
    expect(next.keys[2]).toEqual({ left: "", right: "" });
    // Existing pairs untouched.
    expect(next.keys[0]).toBe(TWO_PAIR_JOIN.keys[0]);
  });

  it("works starting from a single-pair spec", () => {
    expect(addKeyPair(createJoinSpec()).keys).toHaveLength(2);
  });
});

describe("updateKeyPair", () => {
  it("merges a patch into the pair at index, leaving other pairs untouched", () => {
    const next = updateKeyPair(TWO_PAIR_JOIN, 1, { right: "region_id" });
    expect(next.keys[1]).toEqual({ left: "region", right: "region_id" });
    expect(next.keys[0]).toBe(TWO_PAIR_JOIN.keys[0]);
  });

  it("can patch left and right independently", () => {
    const next = updateKeyPair(TWO_PAIR_JOIN, 0, { left: "acct_id" });
    expect(next.keys[0]).toEqual({ left: "acct_id", right: "account_id" });
  });

  it("is a no-op for an out-of-range index", () => {
    expect(updateKeyPair(TWO_PAIR_JOIN, 5, { left: "x" })).toBe(TWO_PAIR_JOIN);
    expect(updateKeyPair(TWO_PAIR_JOIN, -1, { left: "x" })).toBe(TWO_PAIR_JOIN);
  });
});

describe("removeKeyPair", () => {
  it("removes the pair at index", () => {
    const next = removeKeyPair(TWO_PAIR_JOIN, 0);
    expect(next.keys).toEqual([{ left: "region", right: "region_code" }]);
  });

  it("is total: can drive keys down to an empty list", () => {
    const oneLeft = removeKeyPair(TWO_PAIR_JOIN, 0);
    const empty = removeKeyPair(oneLeft, 0);
    expect(empty.keys).toEqual([]);
  });

  it("is a no-op for an out-of-range index", () => {
    expect(removeKeyPair(TWO_PAIR_JOIN, 9)).toBe(TWO_PAIR_JOIN);
    expect(removeKeyPair(TWO_PAIR_JOIN, -1)).toBe(TWO_PAIR_JOIN);
  });
});

describe("moveKeyPair", () => {
  const threePairs: JoinSpec = {
    type: "inner",
    keys: [
      { left: "a", right: "a" },
      { left: "b", right: "b" },
      { left: "c", right: "c" },
    ],
    metadata: {},
  };

  it("moves a pair earlier in the list", () => {
    const next = moveKeyPair(threePairs, 2, 0);
    expect(next.keys.map((k) => k.left)).toEqual(["c", "a", "b"]);
  });

  it("moves a pair later in the list", () => {
    const next = moveKeyPair(threePairs, 0, 2);
    expect(next.keys.map((k) => k.left)).toEqual(["b", "c", "a"]);
  });

  it("supports simple up/down swap semantics via adjacent indices", () => {
    const up = moveKeyPair(threePairs, 1, 0);
    expect(up.keys.map((k) => k.left)).toEqual(["b", "a", "c"]);

    const down = moveKeyPair(threePairs, 1, 2);
    expect(down.keys.map((k) => k.left)).toEqual(["a", "c", "b"]);
  });

  it("is a no-op when from === to", () => {
    expect(moveKeyPair(threePairs, 1, 1)).toBe(threePairs);
  });

  it("clamps at the start (moving before index 0 is a no-op)", () => {
    expect(moveKeyPair(threePairs, 0, -1)).toBe(threePairs);
  });

  it("clamps at the end (moving past the last index is a no-op)", () => {
    expect(moveKeyPair(threePairs, 2, 3)).toBe(threePairs);
  });

  it("is a no-op for an out-of-range from", () => {
    expect(moveKeyPair(threePairs, 9, 0)).toBe(threePairs);
  });
});

describe("validateJoinSpec", () => {
  it("is ok with no keyErrors for a fully-filled spec", () => {
    expect(validateJoinSpec(TWO_PAIR_JOIN)).toEqual({ ok: true, keyErrors: {} });
  });

  it("flags a zero-pair spec as not ok with an actionable message", () => {
    const empty: JoinSpec = { type: "inner", keys: [], metadata: {} };
    const result = validateJoinSpec(empty);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/at least one key pair/i);
  });

  it("surfaces per-pair advisories for blank left/right without gating ok", () => {
    const blank: JoinSpec = {
      type: "inner",
      keys: [
        { left: "", right: "account_id" },
        { left: "region", right: "" },
      ],
      metadata: {},
    };
    const result = validateJoinSpec(blank);
    expect(result.ok).toBe(true);
    expect(result.keyErrors[0]).toEqual({ left: "Choose a field." });
    expect(result.keyErrors[1]).toEqual({ right: "Choose a field." });
  });

  it("a freshly-created join has an advisory on its single blank pair but is still ok", () => {
    const result = validateJoinSpec(createJoinSpec());
    expect(result.ok).toBe(true);
    expect(result.keyErrors[0]).toEqual({ left: "Choose a field.", right: "Choose a field." });
  });
});
