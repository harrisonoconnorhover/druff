import { describe, expect, it } from "vitest";
import {
  resolveCustomCodeLanguage,
  readCustomCode,
  writeCustomCode,
  CUSTOM_CODE_KEY,
  CUSTOM_CODE_PARAMS_KEY,
  type CustomCodeView,
} from "@/features/pipeline-canvas/inspector/categories/customCodeConfig";

// Fixture-only code/param names — no real/sensitive data, per steering/02-engineering.md.

describe("resolveCustomCodeLanguage", () => {
  it("resolves a transform-kind node to sql", () => {
    expect(resolveCustomCodeLanguage({ kind: "transform" })).toBe("sql");
  });

  it("resolves a source-kind node with no connectorId to python (custom API connector)", () => {
    expect(resolveCustomCodeLanguage({ kind: "source" })).toBe("python");
    expect(resolveCustomCodeLanguage({ kind: "source", connectorId: undefined })).toBe("python");
  });

  it("does not resolve a source-kind node that carries a connectorId (pre-made connector)", () => {
    expect(
      resolveCustomCodeLanguage({ kind: "source", connectorId: "greenhouse" }),
    ).toBeUndefined();
  });

  it("does not resolve write or trigger kinds", () => {
    expect(resolveCustomCodeLanguage({ kind: "write" })).toBeUndefined();
    expect(resolveCustomCodeLanguage({ kind: "trigger" })).toBeUndefined();
  });
});

describe("readCustomCode", () => {
  it("defaults to empty code and no parameters for a config-less node", () => {
    expect(readCustomCode(undefined)).toEqual({ code: "", parameters: [] });
    expect(readCustomCode({})).toEqual({ code: "", parameters: [] });
  });

  it("reads code and parameters from config", () => {
    const view = readCustomCode({
      [CUSTOM_CODE_KEY]: "def run(): pass",
      [CUSTOM_CODE_PARAMS_KEY]: [{ name: "api_key" }, { name: "page_size" }],
    });

    expect(view).toEqual({
      code: "def run(): pass",
      parameters: [{ name: "api_key" }, { name: "page_size" }],
    });
  });

  it("coerces a non-string code to the empty-string default rather than throwing", () => {
    expect(readCustomCode({ [CUSTOM_CODE_KEY]: 42 }).code).toBe("");
    expect(readCustomCode({ [CUSTOM_CODE_KEY]: null }).code).toBe("");
  });

  it("normalizes a non-array parameters value to an empty list", () => {
    expect(readCustomCode({ [CUSTOM_CODE_PARAMS_KEY]: "not-an-array" }).parameters).toEqual([]);
    expect(readCustomCode({ [CUSTOM_CODE_PARAMS_KEY]: { name: "x" } }).parameters).toEqual([]);
  });

  it("drops malformed parameter entries (non-object, missing/non-string name)", () => {
    const view = readCustomCode({
      [CUSTOM_CODE_PARAMS_KEY]: [
        { name: "good" },
        "bad-entry",
        {},
        { name: 42 },
        null,
        { name: "also_good" },
      ],
    });

    expect(view.parameters).toEqual([{ name: "good" }, { name: "also_good" }]);
  });
});

describe("writeCustomCode", () => {
  it("writes code and parameters onto an empty config", () => {
    const model: CustomCodeView = { code: "SELECT 1", parameters: [{ name: "window_days" }] };

    expect(writeCustomCode(undefined, model)).toEqual({
      [CUSTOM_CODE_KEY]: "SELECT 1",
      [CUSTOM_CODE_PARAMS_KEY]: [{ name: "window_days" }],
    });
  });

  it("trims parameter names and drops blank ones", () => {
    const model: CustomCodeView = {
      code: "x",
      parameters: [{ name: "  padded  " }, { name: "" }, { name: "   " }],
    };

    expect(writeCustomCode(undefined, model)[CUSTOM_CODE_PARAMS_KEY]).toEqual([{ name: "padded" }]);
  });

  it("dedupes duplicate parameter names last-wins, keeping first-occurrence order", () => {
    const model: CustomCodeView = {
      code: "x",
      parameters: [{ name: "a" }, { name: "b" }, { name: "a" }],
    };

    // Name-only parameters: "last wins" is only observable as de-duplication + order here (there's
    // no second field a later duplicate could override), mirroring entriesToConfig's contract.
    expect(writeCustomCode(undefined, model)[CUSTOM_CODE_PARAMS_KEY]).toEqual([
      { name: "a" },
      { name: "b" },
    ]);
  });

  it("round-trips code and parameters through read -> write unchanged", () => {
    const original = {
      [CUSTOM_CODE_KEY]: "print('hi')",
      [CUSTOM_CODE_PARAMS_KEY]: [{ name: "x" }],
    };

    const view = readCustomCode(original);
    expect(writeCustomCode(undefined, view)).toEqual(original);
  });

  it("omits both keys when code is empty and no parameters survive, keeping an untouched node clean", () => {
    expect(writeCustomCode(undefined, { code: "", parameters: [] })).toEqual({});
    expect(writeCustomCode(undefined, { code: "", parameters: [{ name: "  " }] })).toEqual({});
  });

  it("omits both keys again once a previously-written node is cleared back to blank", () => {
    const existing = { [CUSTOM_CODE_KEY]: "old code", [CUSTOM_CODE_PARAMS_KEY]: [{ name: "x" }] };

    expect(writeCustomCode(existing, { code: "", parameters: [] })).toEqual({});
  });

  it("preserves unrelated existing config keys", () => {
    const existing = { endpoint: "/candidates", unrelated: 123 };
    const model: CustomCodeView = { code: "SELECT 1", parameters: [] };

    expect(writeCustomCode(existing, model)).toEqual({
      endpoint: "/candidates",
      unrelated: 123,
      [CUSTOM_CODE_KEY]: "SELECT 1",
      [CUSTOM_CODE_PARAMS_KEY]: [],
    });
  });

  it("never mutates the config object passed in", () => {
    const existing = { endpoint: "/x" };
    writeCustomCode(existing, { code: "y", parameters: [] });

    expect(existing).toEqual({ endpoint: "/x" });
  });
});
