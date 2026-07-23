import { describe, expect, it } from "vitest";
import { EXAMPLE_GRAPH, EXAMPLE_GRAPH_YAML } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import { decodeGraph, encodeGraph, GraphDecodeError } from "@/lib/pipeline-graph/serialize";

describe("encodeGraph / decodeGraph", () => {
  it.each(["yaml", "json"] as const)(
    "decode(encode(g)) is the identity for EXAMPLE_GRAPH over %s",
    (format) => {
      const text = encodeGraph(EXAMPLE_GRAPH, format);
      expect(decodeGraph(text, format)).toEqual(EXAMPLE_GRAPH);
    },
  );

  it("emits canonical `from`/`to` edge keys and `config` (never `params`)", () => {
    const payload = JSON.parse(encodeGraph(EXAMPLE_GRAPH, "json"));

    for (const edge of payload.edges) {
      expect(edge).toHaveProperty("from");
      expect(edge).toHaveProperty("to");
      expect(edge).not.toHaveProperty("source");
      expect(edge).not.toHaveProperty("target");
    }
    for (const node of payload.nodes) {
      expect(node).toHaveProperty("config");
      expect(node).not.toHaveProperty("params");
    }
  });

  it("omits a join-less edge's `join` key entirely rather than emitting null", () => {
    const payload = JSON.parse(encodeGraph(EXAMPLE_GRAPH, "json"));
    const joinlessEdge = payload.edges.find((edge: { to: string }) => edge.to === "notify_slack");

    expect(joinlessEdge).not.toHaveProperty("join");
  });

  it("keeps the join key on an edge that has one", () => {
    const payload = JSON.parse(encodeGraph(EXAMPLE_GRAPH, "json"));
    const joinedEdge = payload.edges.find(
      (edge: { to: string }) => edge.to === "warehouse_customers",
    );

    expect(joinedEdge.join).toEqual({
      type: "left",
      keys: [{ left: "contact_id", right: "customer_id" }],
      metadata: {},
    });
  });

  it("decodes the `params` alias and Dander's documented defaults from hand-authored YAML", () => {
    expect(decodeGraph(EXAMPLE_GRAPH_YAML, "yaml")).toEqual(EXAMPLE_GRAPH);
  });

  it("throws a GraphDecodeError with an actionable message on malformed YAML syntax", () => {
    expect(() => decodeGraph("name: [unterminated", "yaml")).toThrow(GraphDecodeError);
  });

  it("throws a GraphDecodeError with an actionable message on malformed JSON syntax", () => {
    expect(() => decodeGraph("{not valid json", "json")).toThrow(GraphDecodeError);
  });

  it("throws a GraphDecodeError when the parsed shape doesn't match the schema", () => {
    expect(() => decodeGraph(JSON.stringify({ nodes: "nope" }), "json")).toThrow(GraphDecodeError);
  });
});
