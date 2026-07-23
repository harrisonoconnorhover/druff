import { describe, expect, it } from "vitest";
import { configToEntries, entriesToConfig } from "@/features/pipeline-canvas/inspector/nodeConfig";

describe("configToEntries", () => {
  it("returns no rows for undefined config", () => {
    expect(configToEntries(undefined)).toEqual([]);
  });

  it("returns no rows for an empty config", () => {
    expect(configToEntries({})).toEqual([]);
  });

  it("expands a config record into rows in object-key order", () => {
    // Fixture-only values, no real/sensitive data per steering/02-engineering.md.
    const entries = configToEntries({ apiKey: "sk_test", region: "us-east1" });

    expect(entries).toEqual([
      { key: "apiKey", value: "sk_test" },
      { key: "region", value: "us-east1" },
    ]);
  });

  it("stringifies non-string values", () => {
    expect(configToEntries({ retries: 3, enabled: true })).toEqual([
      { key: "retries", value: "3" },
      { key: "enabled", value: "true" },
    ]);
  });
});

describe("entriesToConfig", () => {
  it("round-trips a normal all-string config", () => {
    const config = { apiKey: "sk_test", region: "us-east1" };

    expect(entriesToConfig(configToEntries(config))).toEqual(config);
  });

  it("drops rows with a blank key", () => {
    const entries = [
      { key: "apiKey", value: "sk_test" },
      { key: "", value: "orphaned" },
      { key: "   ", value: "also orphaned" },
    ];

    expect(entriesToConfig(entries)).toEqual({ apiKey: "sk_test" });
  });

  it("trims whitespace around a key before using it", () => {
    expect(entriesToConfig([{ key: "  region  ", value: "us-east1" }])).toEqual({
      region: "us-east1",
    });
  });

  it("resolves duplicate keys with last-row-wins", () => {
    const entries = [
      { key: "region", value: "us-east1" },
      { key: "region", value: "us-west1" },
    ];

    expect(entriesToConfig(entries)).toEqual({ region: "us-west1" });
  });

  it("keeps surviving rows in first-occurrence order across an edit", () => {
    // Start with two rows, then rename the first row's value only (key untouched) — order of the
    // resulting config's keys must not reshuffle.
    const before = entriesToConfig([
      { key: "a", value: "1" },
      { key: "b", value: "2" },
    ]);
    const after = entriesToConfig([
      { key: "a", value: "1-edited" },
      { key: "b", value: "2" },
    ]);

    expect(Object.keys(before)).toEqual(["a", "b"]);
    expect(Object.keys(after)).toEqual(["a", "b"]);
  });
});
