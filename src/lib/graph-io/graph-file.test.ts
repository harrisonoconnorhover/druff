import { describe, expect, it } from "vitest";
import { encodeGraph } from "@/lib/pipeline-graph";
import { EXAMPLE_GRAPH, EXAMPLE_GRAPH_YAML } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import { formatFromFilename, parseImportedFile } from "@/lib/graph-io/graph-file";

describe("formatFromFilename", () => {
  it.each([
    ["pipeline.yaml", "yaml"],
    ["pipeline.yml", "yaml"],
    ["pipeline.JSON", "json"],
    ["PIPELINE.YAML", "yaml"],
  ] as const)("infers %s -> %s", (filename, expected) => {
    expect(formatFromFilename(filename)).toBe(expected);
  });

  it("returns null for an unrecognized extension", () => {
    expect(formatFromFilename("pipeline.txt")).toBeNull();
  });

  it("returns null for a filename with no extension", () => {
    expect(formatFromFilename("pipeline")).toBeNull();
  });
});

describe("parseImportedFile", () => {
  it("parses a valid YAML file into the expected graph", () => {
    const result = parseImportedFile(EXAMPLE_GRAPH_YAML, "pipeline.yaml");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.kind).toBe("graph-draft");
      expect(result.graph.name).toBe(EXAMPLE_GRAPH.name);
      expect(result.graph.nodes).toHaveLength(EXAMPLE_GRAPH.nodes.length);
    }
  });

  it("parses a valid JSON file (round-tripped via encodeGraph) into the expected graph", () => {
    const json = encodeGraph(EXAMPLE_GRAPH, "json");
    const result = parseImportedFile(json, "pipeline.json");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.graph).toEqual(EXAMPLE_GRAPH);
    }
  });

  it("projects a version-1 dander.yaml manifest into a local canvas draft", () => {
    const result = parseImportedFile(
      `
version: 1
platform:
  region: us-central1
pipelines:
  greenhouse_jobs:
    source: greenhouse_job_board
    models: [stg_greenhouse__jobs]
    schedule: "0 9 * * *"
    time_zone: America/New_York
    paused: false
`,
      "dander.yaml",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.kind).toBe("manifest-preview");
      expect(result.graph.name).toBe("dander-manifest-preview");
      expect(result.graph.nodes.map((node) => node.name)).toEqual([
        "Schedule: 0 9 * * *",
        "Ingest greenhouse_job_board",
        "Build stg_greenhouse__jobs",
      ]);
    }
  });

  it("rejects a graph carrying newer Dander fields Druff cannot safely preserve", () => {
    const result = parseImportedFile(
      `
name: newer-graph
trigger:
  kind: manual
nodes: []
edges: []
`,
      "pipeline.yaml",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/unrecognized/i);
  });

  it("fails loud with an actionable message on malformed YAML syntax", () => {
    const result = parseImportedFile("name: [unclosed", "broken.yaml");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/YAML/i);
    }
  });

  it("fails loud with an actionable message on malformed JSON syntax", () => {
    const result = parseImportedFile("{not json", "broken.json");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/JSON/i);
    }
  });

  it("fails loud on a structurally-invalid graph (fails DRUFF-4's schema)", () => {
    const result = parseImportedFile(
      '{"name": "x", "nodes": "not-an-array", "edges": []}',
      "graph.json",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("fails loud on an unrecognized file extension without attempting to parse", () => {
    const result = parseImportedFile("irrelevant content", "notes.txt");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/extension/i);
    }
  });
});
