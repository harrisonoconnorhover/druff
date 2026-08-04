import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { PipelineGraphSchema, type PipelineGraph } from "@/lib/pipeline-graph/schema";

/** The two on-disk graph formats Dander's own `load_graph_from_*`/`dump_graph_to_*` support. */
export type GraphFormat = "yaml" | "json";

/**
 * Structured, actionable decode error — thrown on malformed YAML/JSON syntax or a shape the
 * pipeline-graph schema rejects, never a bare parser stack trace (`steering/02-engineering.md`:
 * fail loud with actionable context). DRUFF-5's import path catches this specifically to show a
 * toast without crashing the editor.
 */
export class GraphDecodeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GraphDecodeError";
  }
}

/**
 * Serializes a `PipelineGraph` to Dander-canonical YAML/JSON: `from`/`to` edge keys, `config`
 * (never `params`), and a join-less edge's `join` key omitted entirely (never emitted as `null`) —
 * matching Dander's own `dump_graph_to_yaml`/`dump_graph_to_json` shape (`graph.py`'s
 * `_dump_graph_payload`). Re-validates `graph` through `PipelineGraphSchema` first, so a caller
 * can never encode a shape Dander itself wouldn't load back.
 */
export function encodeGraph(graph: PipelineGraph, format: GraphFormat): string {
  const validated = PipelineGraphSchema.parse(graph);
  const payload = toCanonicalPayload(validated);
  return format === "yaml" ? stringifyYaml(payload) : JSON.stringify(payload, null, 2);
}

/**
 * Parses `text` (in the given format) into a validated `PipelineGraph`: syntax parse, then
 * `PipelineGraphSchema`, which applies Dander's documented defaults (`config: {}`, `fields: []`,
 * `nullable: true`, `metadata: {}`, `description: null`, transformation `kind: "direct"`) and the
 * `config`/`params` alias. Throws a `GraphDecodeError` with an actionable message — never a bare
 * parser/Zod stack trace — on malformed YAML/JSON syntax or a structurally-invalid graph.
 */
export function decodeGraph(text: string, format: GraphFormat): PipelineGraph {
  let raw: unknown;
  try {
    raw = format === "yaml" ? parseYaml(text) : JSON.parse(text);
  } catch (cause) {
    throw new GraphDecodeError(
      `Could not parse graph as ${format.toUpperCase()}: ${describeError(cause)}`,
      { cause },
    );
  }

  const result = PipelineGraphSchema.safeParse(raw);
  if (!result.success) {
    throw new GraphDecodeError(
      `Graph does not match the expected pipeline-graph shape: ${result.error.message}`,
      { cause: result.error },
    );
  }
  return result.data;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Builds the on-disk payload dict for a graph, mirroring Dander's `_dump_graph_payload`: every
 * field is emitted as-is *except* a join-less edge (`join === undefined`), whose `join` key is
 * dropped entirely rather than serialized as `null`. No other field — including other legitimate
 * `null`s, like a `constant` `Transformation`'s `constant: null` — is touched.
 */
function toCanonicalPayload(graph: PipelineGraph): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: graph.name,
    nodes: graph.nodes,
    edges: graph.edges.map(({ join, ...rest }) => (join === undefined ? rest : { ...rest, join })),
  };
  if (graph.trigger !== undefined) payload.trigger = graph.trigger;
  return payload;
}
