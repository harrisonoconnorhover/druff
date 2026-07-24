import { describe, expect, it } from "vitest";
import {
  readTriggerConfig,
  validateTrigger,
  writeTriggerConfig,
  TRIGGER_CONFIG_KEY,
  type TriggerFieldValues,
} from "@/features/pipeline-canvas/inspector/categories/triggerConfig";

// Dummy cron/event fixture strings only — never a real secret/credential (steering/01-security.md).
// A trigger carries none anyway, but fixtures stay scrubbed regardless.

describe("readTriggerConfig", () => {
  it("returns kind: null and empty values for an absent config", () => {
    expect(readTriggerConfig(undefined)).toEqual({
      kind: null,
      values: { cron: "", event: "", depends_on: [] },
    });
  });

  it("returns kind: null for a config with no trigger key", () => {
    expect(readTriggerConfig({ endpoint: "/x" })).toEqual({
      kind: null,
      values: { cron: "", event: "", depends_on: [] },
    });
  });

  it("returns kind: null for a malformed/legacy trigger (missing required kind)", () => {
    expect(readTriggerConfig({ [TRIGGER_CONFIG_KEY]: { cron: "0 * * * *" } })).toEqual({
      kind: null,
      values: { cron: "", event: "", depends_on: [] },
    });
  });

  it("reads a valid schedule trigger", () => {
    expect(
      readTriggerConfig({ [TRIGGER_CONFIG_KEY]: { kind: "schedule", cron: "0 * * * *" } }),
    ).toEqual({
      kind: "schedule",
      values: { cron: "0 * * * *", event: "", depends_on: [] },
    });
  });

  it("reads a valid manual (webhook/event) trigger", () => {
    expect(
      readTriggerConfig({ [TRIGGER_CONFIG_KEY]: { kind: "manual", event: "candidate.created" } }),
    ).toEqual({
      kind: "manual",
      values: { cron: "", event: "candidate.created", depends_on: [] },
    });
  });

  it("reads a valid dependency trigger", () => {
    expect(
      readTriggerConfig({
        [TRIGGER_CONFIG_KEY]: { kind: "dependency", depends_on: ["upstream-a", "upstream-b"] },
      }),
    ).toEqual({
      kind: "dependency",
      values: { cron: "", event: "", depends_on: ["upstream-a", "upstream-b"] },
    });
  });

  it("defaults a manual trigger with no event to an empty string, not null", () => {
    expect(readTriggerConfig({ [TRIGGER_CONFIG_KEY]: { kind: "manual" } })).toEqual({
      kind: "manual",
      values: { cron: "", event: "", depends_on: [] },
    });
  });
});

describe("writeTriggerConfig", () => {
  it("preserves non-trigger config keys untouched", () => {
    const result = writeTriggerConfig({ endpoint: "/x", other: 1 }, "schedule", {
      cron: "0 * * * *",
      event: "",
      depends_on: [],
    });

    expect(result.endpoint).toBe("/x");
    expect(result.other).toBe(1);
  });

  it("writes a clean schedule payload holding only kind + cron", () => {
    const result = writeTriggerConfig(undefined, "schedule", {
      cron: "0 * * * *",
      event: "",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({ kind: "schedule", cron: "0 * * * *" });
  });

  it("writes a clean manual payload holding only kind + event", () => {
    const result = writeTriggerConfig(undefined, "manual", {
      cron: "",
      event: "candidate.created",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({ kind: "manual", event: "candidate.created" });
  });

  it("omits event entirely when blank, rather than writing an empty string", () => {
    const result = writeTriggerConfig(undefined, "manual", {
      cron: "",
      event: "   ",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({ kind: "manual" });
  });

  it("writes a clean dependency payload holding only kind + depends_on, trimmed and blank-dropped", () => {
    const result = writeTriggerConfig(undefined, "dependency", {
      cron: "",
      event: "",
      depends_on: [" upstream-a ", "", "upstream-b"],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({
      kind: "dependency",
      depends_on: ["upstream-a", "upstream-b"],
    });
  });

  it("schedule -> manual drops the stale cron", () => {
    const scheduleConfig = writeTriggerConfig(undefined, "schedule", {
      cron: "0 * * * *",
      event: "",
      depends_on: [],
    });

    const result = writeTriggerConfig(scheduleConfig, "manual", {
      cron: "0 * * * *",
      event: "candidate.created",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({ kind: "manual", event: "candidate.created" });
  });

  it("manual -> schedule drops the stale event", () => {
    const manualConfig = writeTriggerConfig(undefined, "manual", {
      cron: "",
      event: "candidate.created",
      depends_on: [],
    });

    const result = writeTriggerConfig(manualConfig, "schedule", {
      cron: "0 * * * *",
      event: "candidate.created",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({ kind: "schedule", cron: "0 * * * *" });
  });

  it("preserves metadata across a mode switch", () => {
    const withMetadata = {
      [TRIGGER_CONFIG_KEY]: {
        kind: "schedule",
        cron: "0 * * * *",
        // Fixture tag only, not a real value (steering/01-security.md).
        metadata: { team: "data-eng" },
      },
    };

    const result = writeTriggerConfig(withMetadata, "manual", {
      cron: "0 * * * *",
      event: "candidate.created",
      depends_on: [],
    });

    expect(result[TRIGGER_CONFIG_KEY]).toEqual({
      kind: "manual",
      event: "candidate.created",
      metadata: { team: "data-eng" },
    });
  });

  it("re-reads to the same view-model it was written from (round-trip stability)", () => {
    const values: TriggerFieldValues = { cron: "0 * * * *", event: "", depends_on: [] };
    const written = writeTriggerConfig(undefined, "schedule", values);

    expect(readTriggerConfig(written)).toEqual({ kind: "schedule", values });
  });
});

describe("validateTrigger", () => {
  it("errors on an empty cron for schedule mode", () => {
    expect(validateTrigger("schedule", { cron: "", event: "", depends_on: [] })).toHaveProperty(
      "cron",
    );
  });

  it("errors on a whitespace-only cron for schedule mode", () => {
    expect(validateTrigger("schedule", { cron: "   ", event: "", depends_on: [] })).toHaveProperty(
      "cron",
    );
  });

  it("has no error for a valid cron", () => {
    expect(validateTrigger("schedule", { cron: "0 * * * *", event: "", depends_on: [] })).toEqual(
      {},
    );
  });

  it("errors on an empty depends_on list for dependency mode", () => {
    expect(validateTrigger("dependency", { cron: "", event: "", depends_on: [] })).toHaveProperty(
      "depends_on",
    );
  });

  it("errors when depends_on holds only blank entries", () => {
    expect(
      validateTrigger("dependency", { cron: "", event: "", depends_on: ["  ", ""] }),
    ).toHaveProperty("depends_on");
  });

  it("has no error for a non-empty depends_on list", () => {
    expect(
      validateTrigger("dependency", { cron: "", event: "", depends_on: ["upstream-a"] }),
    ).toEqual({});
  });

  it("has no error for manual mode with an empty event (optional field)", () => {
    expect(validateTrigger("manual", { cron: "", event: "", depends_on: [] })).toEqual({});
  });
});
