import {
  PipelineGraphDocumentSchema,
  RawCursorStrategySchema,
  RawDestinationSchema,
  RawFieldMappingSchema,
  RawFieldTestSchema,
  RawJoinKeyPairSchema,
  RawJoinSchema,
  RawNodeFieldSchema,
  RawNodeVisualSchema,
  RawPartitioningSchema,
  RawPipelineEdgeSchema,
  RawPipelineNodeSchema,
  RawPositionSchema,
  RawTransformationSchema,
  RawTriggerSchema,
  RawWriterSchema,
} from "@/lib/dander-contracts/runtime";
import type * as Generated from "@/generated/dander-contracts/types/pipeline-graph";

type JsonObject = Generated.JsonObject;

export type FieldTestKind = Generated.FieldTestDocument["kind"];
export interface FieldTest {
  kind: FieldTestKind;
  values: unknown[];
  to: string | null;
  field: string | null;
  metadata: JsonObject;
}

export interface NodeField {
  name: string;
  type: string;
  cast_to?: string | null;
  nullable: boolean;
  description: string | null;
  tests?: FieldTest[];
  metadata: JsonObject;
  extensions?: Generated.ProviderExtension[];
}

export type CursorKind = Generated.CursorStrategyDocument["kind"];
export interface CursorStrategy {
  field: string;
  kind: CursorKind;
  params: JsonObject;
  metadata: JsonObject;
}

export type Position = Generated.PositionDocument;
export interface NodeVisual {
  position: Position | null;
  color: string | null;
  icon: string | null;
}

export interface PipelineNode {
  id: string;
  type: string;
  name: string;
  config: JsonObject;
  fields: NodeField[];
  trigger?: Trigger;
  cursor?: CursorStrategy;
  visual?: NodeVisual;
}

export type TransformationKind = NonNullable<Generated.TransformationDocument["kind"]>;
export interface Transformation {
  kind: TransformationKind;
  expression: string | null;
  constant: unknown;
  function?: string | null;
  arguments?: JsonObject;
  inputs: string[];
  metadata: JsonObject;
}

export interface FieldMapping {
  source: string | null;
  target: string;
  transformation: Transformation | null;
  metadata: JsonObject;
}

export type JoinType = Generated.JoinDocument["type"];
export type JoinKeyPair = Generated.JoinKeyPairDocument;
export interface JoinSpec {
  type: JoinType;
  keys: JoinKeyPair[];
  metadata: JsonObject;
}

export interface PipelineEdge {
  from: string;
  to: string;
  metadata: JsonObject;
  mappings: FieldMapping[];
  join?: JoinSpec;
}

export type TriggerKind = Generated.TriggerDocument["kind"];
export interface Trigger {
  kind: TriggerKind;
  cron: string | null;
  event: string | null;
  depends_on: string[];
  metadata: JsonObject;
}

export type WriteMode = Generated.WriteMode;
export type PartitioningGranularity = Generated.PartitioningType;
export interface DestinationSpec {
  project: string | null;
  dataset: string;
  table: string;
  business_key: string[];
}

export interface PartitioningSpec {
  field: string | null;
  granularity: PartitioningGranularity;
  require_partition_filter: boolean;
}

export interface WriterConfig {
  write_mode: WriteMode;
  destination: DestinationSpec;
  cursor_field: string | null;
  partitioning: PartitioningSpec | null;
  clustering: string[];
  max_batch_rows?: number;
  schema_evolution?: Generated.SchemaEvolution;
  transport?: Generated.Transport;
}

export interface PipelineGraph {
  name: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  trigger?: Trigger;
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value));
  }
  throw new TypeError("Validated Dander contract unexpectedly contained a non-object value.");
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value === undefined || value === null ? {} : asObject(value);
}

function arrayOrEmpty(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeFieldTest(value: Generated.FieldTestDocument): FieldTest {
  return {
    kind: value.kind,
    values: value.values ?? [],
    to: value.to ?? null,
    field: value.field ?? null,
    metadata: value.metadata ?? {},
  };
}

function normalizeNodeField(value: Generated.NodeFieldDocument): NodeField {
  return {
    name: value.name,
    type: value.type,
    cast_to: value.cast_to ?? null,
    nullable: value.nullable ?? true,
    description: value.description ?? null,
    tests: (value.tests ?? []).map(normalizeFieldTest),
    metadata: value.metadata ?? {},
    extensions: value.extensions ?? [],
  };
}

function normalizeCursor(value: Generated.CursorStrategyDocument): CursorStrategy {
  return {
    field: value.field,
    kind: value.kind,
    params: value.params ?? {},
    metadata: value.metadata ?? {},
  };
}

function normalizeVisual(value: Generated.NodeVisualDocument): NodeVisual {
  return {
    position: value.position ?? null,
    color: value.color ?? null,
    icon: value.icon ?? null,
  };
}

function normalizeTrigger(value: Generated.TriggerDocument): Trigger {
  return {
    kind: value.kind,
    cron: value.cron ?? null,
    event: value.event ?? null,
    depends_on: value.depends_on ?? [],
    metadata: value.metadata ?? {},
  };
}

function normalizeTransformation(value: Generated.TransformationDocument): Transformation {
  return {
    kind: value.kind ?? "direct",
    expression: value.expression ?? null,
    constant: value.constant ?? null,
    function: value.function ?? null,
    arguments: objectOrEmpty(value.arguments),
    inputs: value.inputs ?? [],
    metadata: value.metadata ?? {},
  };
}

function normalizeMapping(value: Generated.FieldMappingDocument): FieldMapping {
  return {
    source: value.source ?? null,
    target: value.target,
    transformation: value.transformation ? normalizeTransformation(value.transformation) : null,
    metadata: value.metadata ?? {},
  };
}

function normalizeJoin(value: Generated.JoinDocument): JoinSpec {
  return {
    type: value.type,
    keys: value.keys,
    metadata: value.metadata ?? {},
  };
}

function normalizeEdge(value: Generated.EdgeDocument): PipelineEdge {
  return {
    from: value.from,
    to: value.to,
    metadata: value.metadata ?? {},
    mappings: (value.mappings ?? []).map(normalizeMapping),
    ...(value.join ? { join: normalizeJoin(value.join) } : {}),
  };
}

function normalizeRequest(value: unknown): JsonObject {
  const request = asObject(value);
  return {
    method: request.method ?? "GET",
    headers: objectOrEmpty(request.headers),
    query_params: objectOrEmpty(request.query_params),
    body: request.body ?? null,
  };
}

function normalizeOperation(value: unknown): unknown {
  const operation = asObject(value);
  const params = objectOrEmpty(operation.params);
  const normalizedParams =
    operation.kind === "filter_rows"
      ? {
          conditions: arrayOrEmpty(params.conditions).map((condition) => {
            const record = asObject(condition);
            return { ...record, value: record.value ?? null };
          }),
          logic: params.logic ?? "all",
        }
      : { ...params };
  return { ...operation, params: normalizedParams, metadata: objectOrEmpty(operation.metadata) };
}

function normalizeDestinationRecord(value: unknown): DestinationSpec {
  const destination = RawDestinationSchema.parse(value);
  return {
    project: destination.project ?? null,
    dataset: destination.dataset,
    table: destination.table,
    business_key: destination.business_key ?? [],
  };
}

function normalizePartitioningRecord(value: unknown): PartitioningSpec {
  const partitioning = RawPartitioningSchema.parse(value);
  return {
    field: partitioning.field ?? null,
    granularity: partitioning.granularity ?? "day",
    require_partition_filter: partitioning.require_partition_filter ?? false,
  };
}

function normalizeWriterRecord(value: unknown): WriterConfig {
  const writer = RawWriterSchema.parse(value);
  return {
    write_mode: writer.write_mode,
    destination: normalizeDestinationRecord(writer.destination),
    cursor_field: writer.cursor_field ?? null,
    partitioning: writer.partitioning ? normalizePartitioningRecord(writer.partitioning) : null,
    clustering: writer.clustering ?? [],
    max_batch_rows: writer.max_batch_rows ?? 10_000,
    schema_evolution: writer.schema_evolution ?? "strict",
    transport: writer.transport ?? "load_job",
  };
}

function normalizeNodeConfig(type: string, value: unknown): JsonObject {
  const config = objectOrEmpty(value);
  if (type === "source") {
    const normalized: JsonObject = {
      ...config,
      connector: config.connector ?? null,
      endpoint: config.endpoint ?? null,
    };
    if (config.request === undefined || config.request === null) delete normalized.request;
    else normalized.request = normalizeRequest(config.request);
    return normalized;
  }
  if (type === "transform") {
    return {
      ...config,
      join: config.join ?? null,
      operations: arrayOrEmpty(config.operations).map(normalizeOperation),
    };
  }
  if (type === "target") {
    const normalized: JsonObject = { ...config };
    if (config.writer === undefined || config.writer === null) delete normalized.writer;
    else normalized.writer = normalizeWriterRecord(config.writer);
    return normalized;
  }
  return { ...config };
}

function normalizeNode(value: Generated.GraphNodeDocument): PipelineNode {
  const config = value.config ?? value.params ?? {};
  return {
    id: value.id,
    type: value.type,
    name: value.name,
    config: normalizeNodeConfig(value.type, config),
    fields: (value.fields ?? []).map(normalizeNodeField),
    ...(value.trigger ? { trigger: normalizeTrigger(value.trigger) } : {}),
    ...(value.cursor ? { cursor: normalizeCursor(value.cursor) } : {}),
    ...(value.visual ? { visual: normalizeVisual(value.visual) } : {}),
  };
}

/**
 * Canonical presentation projection applied only after exact generated validation. It mirrors
 * Dander's documented aliases, default factories, and narrowly scoped null-omission rules without
 * mutating the caller's object or deciding which fields are allowed.
 */
export function normalizePipelineGraph(value: Generated.PipelineGraphDocument): PipelineGraph {
  return {
    name: value.name,
    nodes: (value.nodes ?? []).map(normalizeNode),
    edges: (value.edges ?? []).map(normalizeEdge),
    ...(value.trigger ? { trigger: normalizeTrigger(value.trigger) } : {}),
  };
}

export const FieldTestSchema = RawFieldTestSchema.transform(normalizeFieldTest);
export const NodeFieldSchema = RawNodeFieldSchema.transform(normalizeNodeField);
export const CursorStrategySchema = RawCursorStrategySchema.transform(normalizeCursor);
export const PositionSchema = RawPositionSchema;
export const NodeVisualSchema = RawNodeVisualSchema.transform(normalizeVisual);
export const PipelineNodeSchema = RawPipelineNodeSchema.transform(normalizeNode);
export const TransformationSchema = RawTransformationSchema.transform(normalizeTransformation);
export const FieldMappingSchema = RawFieldMappingSchema.transform(normalizeMapping);
export const JoinKeyPairSchema = RawJoinKeyPairSchema;
export const JoinSpecSchema = RawJoinSchema.transform(normalizeJoin);
export const PipelineEdgeSchema = RawPipelineEdgeSchema.transform(normalizeEdge);
export const TriggerSchema = RawTriggerSchema.transform(normalizeTrigger);
export const DestinationSpecSchema = RawDestinationSchema.transform(normalizeDestinationRecord);
export const PartitioningSpecSchema = RawPartitioningSchema.transform(normalizePartitioningRecord);
export const WriterConfigSchema = RawWriterSchema.transform(normalizeWriterRecord);
export const PipelineGraphSchema = PipelineGraphDocumentSchema.transform(normalizePipelineGraph);
