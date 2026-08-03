import { z } from "zod";

/**
 * Zod schemas for Dander's canonical `PipelineGraph` contract. Druff keeps the complete parsed
 * model as its backing document and patches only fields the editor owns. Strict boundary objects
 * therefore reject newer graph fields Druff cannot yet preserve instead of silently stripping
 * them. See `steering/00-project-overview.md`.
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

/** Generic data-quality tests declared on a node field (Dander's `FieldTest`). */
export const FieldTestKindSchema = z.enum([
  "not_null",
  "unique",
  "accepted_values",
  "relationships",
]);
export type FieldTestKind = z.infer<typeof FieldTestKindSchema>;

export const FieldTestSchema = z
  .object({
    kind: FieldTestKindSchema,
    values: z.array(z.unknown()).default([]),
    to: z.string().nullable().default(null),
    field: z.string().nullable().default(null),
    metadata: metadataSchema,
  })
  .strict();
export type FieldTest = z.infer<typeof FieldTestSchema>;

/** A single declared field on a node's schema (Dander's `NodeField`). */
export const NodeFieldSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    cast_to: z.string().nullable().optional(),
    nullable: z.boolean().default(true),
    description: z.string().nullable().default(null),
    tests: z.array(FieldTestSchema).optional(),
    metadata: metadataSchema,
  })
  .strict();
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
    let normalized = { ...record };
    if ("params" in normalized) {
      const { params, ...rest } = normalized;
      normalized = "config" in normalized ? rest : { ...rest, config: params };
    }
    for (const key of ["trigger", "cursor", "visual"]) {
      if (normalized[key] === null) delete normalized[key];
    }
    return normalized;
  }
  return input;
}

export const CursorKindSchema = z.enum(["timestamp", "sequence", "opaque_token"]);
export type CursorKind = z.infer<typeof CursorKindSchema>;

export const CursorStrategySchema = z
  .object({
    field: z.string(),
    kind: CursorKindSchema,
    params: z.record(z.string(), z.unknown()).default({}),
    metadata: metadataSchema,
  })
  .strict();
export type CursorStrategy = z.infer<typeof CursorStrategySchema>;

export const PositionSchema = z.object({ x: z.number(), y: z.number() }).strict();
export type Position = z.infer<typeof PositionSchema>;

export const NodeVisualSchema = z
  .object({
    position: PositionSchema.nullable().default(null),
    color: z.string().nullable().default(null),
    icon: z.string().nullable().default(null),
  })
  .strict();
export type NodeVisual = z.infer<typeof NodeVisualSchema>;

/** A single node in a pipeline graph (Dander's `Node`). */
export const PipelineNodeSchema = z.preprocess(
  withConfigParamsAlias,
  z
    .object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      config: z.record(z.string(), z.unknown()).default({}),
      fields: z.array(NodeFieldSchema).default([]),
      trigger: z.lazy(() => TriggerSchema).optional(),
      cursor: CursorStrategySchema.optional(),
      visual: NodeVisualSchema.optional(),
    })
    .strict(),
);
export type PipelineNode = z.infer<typeof PipelineNodeSchema>;

/** The closed set of transformation kinds a `Transformation` may declare (Dander's `TransformationKind`). */
export const TransformationKindSchema = z.enum(["direct", "expression", "constant", "custom_code"]);
export type TransformationKind = z.infer<typeof TransformationKindSchema>;

/**
 * A declarative transformation attached to a `FieldMapping` (Dander's `Transformation`). Opaque
 * and inert here too: Druff never parses/evaluates `expression`, nor interprets `constant` — both
 * are stored as-authored. Dander's `kind`-vs-payload semantic checks (e.g. `expression` required
 * when `kind === "expression"`) are the *semantic* layer this schema deliberately does not
 * reimplement (see module doc comment).
 */
export const TransformationSchema = z
  .object({
    kind: TransformationKindSchema.default("direct"),
    expression: z.string().nullable().default(null),
    constant: z.unknown().default(null),
    function: z.string().nullable().optional(),
    arguments: z.record(z.string(), z.unknown()).optional(),
    inputs: z.array(z.string()).default([]),
    metadata: metadataSchema,
  })
  .strict();
export type Transformation = z.infer<typeof TransformationSchema>;

/** A single field-to-field lineage mapping on an edge, optionally transformed (Dander's `FieldMapping`). */
export const FieldMappingSchema = z
  .object({
    source: z.string().nullable().default(null),
    target: z.string(),
    transformation: TransformationSchema.nullable().default(null),
    metadata: metadataSchema,
  })
  .strict();
export type FieldMapping = z.infer<typeof FieldMappingSchema>;

/** The closed set of join kinds a `JoinSpec` may declare (Dander's `JoinType`). */
export const JoinTypeSchema = z.enum(["inner", "left", "right", "full"]);
export type JoinType = z.infer<typeof JoinTypeSchema>;

/** One equality key pairing in a `JoinSpec` (Dander's `JoinKeyPair`): `left` names a field on the
 * edge's `from` node, `right` names a field on the edge's `to` node. */
export const JoinKeyPairSchema = z.object({ left: z.string(), right: z.string() }).strict();
export type JoinKeyPair = z.infer<typeof JoinKeyPairSchema>;

/** A declarative join specification on a connection that combines two sources (Dander's `JoinSpec`). */
export const JoinSpecSchema = z
  .object({
    type: JoinTypeSchema,
    keys: z.array(JoinKeyPairSchema).min(1),
    metadata: metadataSchema,
  })
  .strict();
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
  z
    .object({
      from: z.string(),
      to: z.string(),
      metadata: metadataSchema,
      mappings: z.array(FieldMappingSchema).default([]),
      join: JoinSpecSchema.optional(),
    })
    .strict(),
);
export type PipelineEdge = z.infer<typeof PipelineEdgeSchema>;

/** The closed set of trigger kinds Dander's `Trigger` may declare (Dander's `TriggerKind`):
 *  `schedule` (cron-driven), `manual` (manual / external-event driven — this is the Trigger config
 *  category's "webhook/event" mode, DRUFF-13), and `dependency` (runs after named upstream ids). */
export const TriggerKindSchema = z.enum(["schedule", "dependency", "manual"]);
export type TriggerKind = z.infer<typeof TriggerKindSchema>;

/**
 * A pipeline trigger (Dander's `Trigger`, `graph.py`): a `kind` discriminator plus kind-specific
 * payload fields. Structural shape only, mirroring this file's documented stance — Dander's
 * *semantic* cross-kind payload rule (`Trigger._check_kind_payload`: a `schedule` trigger must
 * carry `cron`, a `dependency` trigger must carry `depends_on`, etc.) is out of scope here and
 * lives in `triggerConfig.ts`'s `validateTrigger` (DRUFF-13), not in this schema. Every payload
 * field is optional/defaulted so a trigger of any kind parses without throwing regardless of which
 * other kind's fields happen to be present or absent.
 *
 * Opaque and inert throughout Druff: `cron` is stored as an authored string and never parsed or
 * scheduled client-side, matching the "Druff never executes user code" non-goal.
 */
export const TriggerSchema = z
  .object({
    kind: TriggerKindSchema,
    /** Opaque cron expression (`schedule` kind). Never evaluated in the browser. */
    cron: z.string().nullable().default(null),
    /** Optional opaque external-event name (`manual` kind). */
    event: z.string().nullable().default(null),
    /** Upstream node ids by name only (`dependency` kind). */
    depends_on: z.array(z.string()).default([]),
    metadata: metadataSchema,
  })
  .strict();
export type Trigger = z.infer<typeof TriggerSchema>;

/** The closed set of write modes Dander's `WriterConfig.write_mode` may declare (Dander's
 *  `WriteMode`, `../dander/src/dander/writer/base.py`): `scd1`/`scd2` (slowly-changing-dimension
 *  merges), `snapshot` (full replace), `incremental` (append/merge driven by `cursor_field`). */
export const WriteModeSchema = z.enum(["scd1", "scd2", "snapshot", "incremental"]);
export type WriteMode = z.infer<typeof WriteModeSchema>;

/** The closed set of BigQuery partitioning granularities Dander's `PartitioningSpec.granularity`
 *  may declare, defaulting to `day` (Dander's `PartitioningType`). */
export const PartitioningGranularitySchema = z.enum(["hour", "day", "month", "year"]);
export type PartitioningGranularity = z.infer<typeof PartitioningGranularitySchema>;

/**
 * Where a `WriterConfig` writes (Dander's `DestinationSpec`, `node_config.py`). Structural shape
 * only: `dataset`/`table`'s `Field(min_length=1)` required-non-empty semantics are the Write
 * config category's `validateWriter` (DRUFF-17), not this schema, so a partially-authored
 * destination still parses on read rather than throwing.
 */
export const DestinationSpecSchema = z
  .object({
    project: z.string().nullable().default(null),
    dataset: z.string().default(""),
    table: z.string().default(""),
    /** Ordered business-key column names — required non-empty for scd1/scd2/incremental, not
     *  snapshot (`validateWriter`'s job, not this schema's). */
    business_key: z.array(z.string()).default([]),
  })
  .strict();
export type DestinationSpec = z.infer<typeof DestinationSpecSchema>;

/**
 * BigQuery table partitioning (Dander's `PartitioningSpec`). `field: null` is a **meaningful**
 * value — BigQuery ingestion-time partitioning — distinct from `partitioning` itself being absent
 * (no partitioning at all) on the parent `WriterConfigSchema`.
 */
export const PartitioningSpecSchema = z
  .object({
    field: z.string().nullable().default(null),
    granularity: PartitioningGranularitySchema.default("day"),
    require_partition_filter: z.boolean().default(false),
  })
  .strict();
export type PartitioningSpec = z.infer<typeof PartitioningSpecSchema>;

/**
 * A write/target node's writer config (Dander's `WriterConfig`, `node_config.py`, landed in
 * DANDER-16), stored at `TargetNodeConfig.writer` — i.e. `config.writer` on the node (see this
 * ticket's Design; not a `Node`-level sibling ambiguity, unlike `Trigger`). Structural shape only,
 * mirroring `TriggerSchema`'s stance: Dander's *semantic* `_check_mode_requirements` validator
 * (business_key required for scd1/scd2/incremental, cursor_field required only for incremental,
 * clustering capped at 4 with no duplicates) is out of scope here and lives in the Write config
 * category's `validateWriter` (`writerConfig.ts`, DRUFF-17), kept in sync with `node_config.py` by
 * hand — Dander remains the enforcing boundary. Every field here is an ordinary identifier
 * (dataset/table/column names) — never a secret (`steering/01-security.md`) — and none of it is
 * ever executed or evaluated client-side.
 */
export const WriterConfigSchema = z
  .object({
    write_mode: WriteModeSchema,
    destination: DestinationSpecSchema,
    cursor_field: z.string().nullable().default(null),
    partitioning: PartitioningSpecSchema.nullable().default(null),
    /** Ordered clustering column names — capped at 4, no duplicates (`validateWriter`'s job). */
    clustering: z.array(z.string()).default([]),
    max_batch_rows: z.number().int().positive().max(100_000).optional(),
    schema_evolution: z.enum(["strict", "additive"]).optional(),
    transport: z.enum(["load_job", "storage_write"]).optional(),
  })
  .strict();
export type WriterConfig = z.infer<typeof WriterConfigSchema>;

/** The full pipeline graph: a named collection of nodes and edges (Dander's `PipelineGraph`). */
function withNullGraphTriggerOmitted(input: unknown): unknown {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const record = { ...(input as Record<string, unknown>) };
    if (record.trigger === null) delete record.trigger;
    return record;
  }
  return input;
}

export const PipelineGraphSchema = z.preprocess(
  withNullGraphTriggerOmitted,
  z
    .object({
      name: z.string(),
      nodes: z.array(PipelineNodeSchema).default([]),
      edges: z.array(PipelineEdgeSchema).default([]),
      trigger: TriggerSchema.optional(),
    })
    .strict(),
);
export type PipelineGraph = z.infer<typeof PipelineGraphSchema>;
