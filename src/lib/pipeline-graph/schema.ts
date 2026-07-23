import { z } from "zod";

/**
 * Zod schemas mirroring Dander's on-disk pipeline-graph shape exactly (verified against Dander's
 * `src/dander/pipeline/README.md` and `src/dander/pipeline/graph.py`; see the "Contract with
 * Dander" note in `steering/00-project-overview.md`). This is the one boundary parse for the
 * whole app — any YAML/JSON crossing the Dander contract runs through these schemas, never a bare
 * cast (`steering/languages/typescript.md`: parse, don't cast).
 *
 * Zod does **structural/shape** validation only. Dander's *semantic* checks (`graph_ops`: unique
 * node ids, dangling edges, cycles, field-wiring) are explicitly out of scope here — see this
 * ticket's Design "Out of scope" note; that layer surfaces separately via the "Validation surface"
 * module once it exists.
 */

/**
 * Free-form tag/label bag — Dander's `metadata: dict[str, Any]` convention everywhere it appears
 * (nodes, fields, edges, mappings, joins). Tags/labels only, never a real field value or secret
 * (`steering/01-security.md`).
 */
const metadataSchema = z.record(z.string(), z.unknown()).default({});

/** A single declared field on a node's schema (Dander's `NodeField`). */
export const NodeFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  nullable: z.boolean().default(true),
  description: z.string().nullable().default(null),
  metadata: metadataSchema,
});
export type NodeField = z.infer<typeof NodeFieldSchema>;

/**
 * Dander accepts either `config` or `params` as the on-load key for a node's free-form config
 * (Pydantic's `AliasChoices("config", "params")`), normalizing both to `config`; dumps always
 * emit `config` only. Applied as a `z.preprocess` step, before the object schema runs, so an
 * incoming `params` key is renamed to `config` first. An explicit `config` always wins if both are
 * present, matching Pydantic's alias-choice precedence (first alias in the list checked first).
 */
function withConfigParamsAlias(input: unknown): unknown {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const record = input as Record<string, unknown>;
    if (!("config" in record) && "params" in record) {
      const { params, ...rest } = record;
      return { ...rest, config: params };
    }
  }
  return input;
}

/** A single node in a pipeline graph (Dander's `Node`). */
export const PipelineNodeSchema = z.preprocess(
  withConfigParamsAlias,
  z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    config: z.record(z.string(), z.unknown()).default({}),
    fields: z.array(NodeFieldSchema).default([]),
  }),
);
export type PipelineNode = z.infer<typeof PipelineNodeSchema>;

/** The closed set of transformation kinds a `Transformation` may declare (Dander's `TransformationKind`). */
export const TransformationKindSchema = z.enum(["direct", "expression", "constant"]);
export type TransformationKind = z.infer<typeof TransformationKindSchema>;

/**
 * A declarative transformation attached to a `FieldMapping` (Dander's `Transformation`). Opaque
 * and inert here too: Druff never parses/evaluates `expression`, nor interprets `constant` — both
 * are stored as-authored. Dander's `kind`-vs-payload semantic checks (e.g. `expression` required
 * when `kind === "expression"`) are the *semantic* layer this schema deliberately does not
 * reimplement (see module doc comment).
 */
export const TransformationSchema = z.object({
  kind: TransformationKindSchema.default("direct"),
  expression: z.string().nullable().default(null),
  constant: z.unknown().default(null),
  inputs: z.array(z.string()).default([]),
  metadata: metadataSchema,
});
export type Transformation = z.infer<typeof TransformationSchema>;

/** A single field-to-field lineage mapping on an edge, optionally transformed (Dander's `FieldMapping`). */
export const FieldMappingSchema = z.object({
  source: z.string().nullable().default(null),
  target: z.string(),
  transformation: TransformationSchema.nullable().default(null),
  metadata: metadataSchema,
});
export type FieldMapping = z.infer<typeof FieldMappingSchema>;

/** The closed set of join kinds a `JoinSpec` may declare (Dander's `JoinType`). */
export const JoinTypeSchema = z.enum(["inner", "left", "right", "full"]);
export type JoinType = z.infer<typeof JoinTypeSchema>;

/** One equality key pairing in a `JoinSpec` (Dander's `JoinKeyPair`): `left` names a field on the
 * edge's `from` node, `right` names a field on the edge's `to` node. */
export const JoinKeyPairSchema = z.object({
  left: z.string(),
  right: z.string(),
});
export type JoinKeyPair = z.infer<typeof JoinKeyPairSchema>;

/** A declarative join specification on a connection that combines two sources (Dander's `JoinSpec`). */
export const JoinSpecSchema = z.object({
  type: JoinTypeSchema,
  keys: z.array(JoinKeyPairSchema).min(1),
  metadata: metadataSchema,
});
export type JoinSpec = z.infer<typeof JoinSpecSchema>;

/**
 * An explicit `join: null` (a natural, if non-canonical, way to hand-author "no join") is
 * normalized to an absent `join` key before the object schema parses, so both spellings of "no
 * join" converge on the same `join?: JoinSpec` — an **optional key**, not a required key typed
 * `JoinSpec | undefined`. (A `.transform` on the field itself would produce the latter — value
 * can be `undefined`, but the key would become non-optional in the inferred type, which breaks
 * every graph-literal fixture/test that omits a join-less edge's `join` key entirely.)
 */
function withNullJoinOmitted(input: unknown): unknown {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const record = input as Record<string, unknown>;
    if ("join" in record && record.join === null) {
      const rest = { ...record };
      delete rest.join;
      return rest;
    }
  }
  return input;
}

/**
 * A directed connection between two node ids (Dander's `Edge`). On-disk keys are the reserved
 * words `from`/`to` — unlike Python, `from` is a perfectly legal object-property key in
 * TypeScript, so this schema uses `from`/`to` directly with no separate `source`/`target`
 * renaming (per this ticket's Design: "the module works in on-disk shape throughout").
 *
 * `join` is absent (not `null`) whenever the input omits it, matching Dander's own dump, which
 * omits a join-less edge's `join` key entirely rather than emitting `null` (`_dump_graph_payload`).
 */
export const PipelineEdgeSchema = z.preprocess(
  withNullJoinOmitted,
  z.object({
    from: z.string(),
    to: z.string(),
    metadata: metadataSchema,
    mappings: z.array(FieldMappingSchema).default([]),
    join: JoinSpecSchema.optional(),
  }),
);
export type PipelineEdge = z.infer<typeof PipelineEdgeSchema>;

/** The full pipeline graph: a named collection of nodes and edges (Dander's `PipelineGraph`). */
export const PipelineGraphSchema = z.object({
  name: z.string(),
  nodes: z.array(PipelineNodeSchema).default([]),
  edges: z.array(PipelineEdgeSchema).default([]),
});
export type PipelineGraph = z.infer<typeof PipelineGraphSchema>;
