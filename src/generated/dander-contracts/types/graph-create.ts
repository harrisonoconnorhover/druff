/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type From = string;
/**
 * @minItems 1
 */
export type Keys = [JoinKeyPairDocument, ...JoinKeyPairDocument[]];
export type Left = string;
export type Right = string;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "JsonValue".
 */
export type JsonValue = unknown | undefined;
export type Type = "inner" | "left" | "right" | "full";
export type Source = string | null;
export type Target = string;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TransformationDocument".
 */
export type TransformationDocument =
  | DirectTransformation
  | ExpressionTransformation
  | ConstantTransformation
  | CustomCodeTransformation;
export type Constant = null;
export type Expression = null;
export type Function = null;
export type Inputs = string[];
export type Kind = "direct";
export type Constant1 = null;
export type Expression1 = string;
export type Function1 = null;
export type Inputs1 = string[];
export type Kind1 = "expression";
export type Expression2 = null;
export type Function2 = null;
export type Inputs2 = string[];
export type Kind2 = "constant";
export type Constant2 = null;
export type Expression3 = null;
export type Function3 = string;
export type Inputs3 = string[];
export type Kind3 = "custom_code";
export type Mappings = FieldMappingDocument[];
export type To = string;
export type Edges = EdgeDocument[];
export type Name = string;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "GraphNodeDocument".
 */
export type GraphNodeDocument =
  SourceNodeDocument | TransformNodeDocument | TargetNodeDocument | ExtensionNodeDocument;
export type Connector = string | null;
export type Endpoint = string | null;
export type Body = JsonObject | string | null;
/**
 * The closed set of HTTP methods a `RequestSpec` may declare.
 *
 * A `StrEnum` (matching the `TransformationKind`/`JoinType` convention in `graph.py`) so callers
 * get a named, importable type that still serializes to/from its plain string value stably in
 * YAML and JSON. An out-of-set value fails validation with a clear error at the Pydantic
 * boundary. `HEAD`/`OPTIONS` are intentionally omitted (no source currently needs them); extend
 * by adding a member later without touching callers.
 *
 * Attributes:
 *     GET: Retrieve a resource. The default method (a simple GET needs no explicit spec).
 *     POST: Create a resource / submit a query body.
 *     PUT: Replace a resource.
 *     PATCH: Partially update a resource.
 *     DELETE: Remove a resource.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Field = string;
export type Kind4 = "timestamp" | "sequence" | "opaque_token";
export type CastTo = string | null;
export type Description = string | null;
export type Name1 = string;
export type Provider = string;
export type Value = string | number | boolean;
export type Extensions = ProviderExtension[];
export type Name2 = string;
export type Nullable = boolean;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "FieldTestDocument".
 */
export type FieldTestDocument =
  NotNullFieldTest | UniqueFieldTest | AcceptedValuesFieldTest | RelationshipsFieldTest;
export type Field1 = null;
export type Kind5 = "not_null";
export type To1 = null;
/**
 * @maxItems 0
 */
export type Values = [];
export type Field2 = null;
export type Kind6 = "unique";
export type To2 = null;
/**
 * @maxItems 0
 */
export type Values1 = [];
export type Field3 = null;
export type Kind7 = "accepted_values";
export type To3 = null;
/**
 * @minItems 1
 */
export type Values2 = [JsonValue | undefined, ...(JsonValue | undefined)[]];
export type Field4 = string;
export type Kind8 = "relationships";
export type To4 = string;
/**
 * @maxItems 0
 */
export type Values3 = [];
export type Tests = FieldTestDocument[];
export type Type1 = string;
export type Fields = NodeFieldDocument[];
export type Id = string;
export type Name3 = string;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TriggerDocument".
 */
export type TriggerDocument = ScheduleTrigger | DependencyTrigger | ManualTrigger;
export type Cron = string;
/**
 * @maxItems 0
 */
export type DependsOn = [];
export type Event = null;
export type Kind9 = "schedule";
export type Cron1 = null;
/**
 * @minItems 1
 */
export type DependsOn1 = [string, ...string[]];
export type Event1 = null;
export type Kind10 = "dependency";
export type Cron2 = null;
/**
 * @maxItems 0
 */
export type DependsOn2 = [];
export type Event2 = string | null;
export type Kind11 = "manual";
export type Type2 = "source";
export type Color = string | null;
export type Icon = string | null;
export type X = number;
export type Y = number;
/**
 * @minItems 1
 */
export type Keys1 = [ExecutableJoinKeyDocument, ...ExecutableJoinKeyDocument[]];
export type Left1 = string;
export type Right1 = string;
export type LeftInput = string;
export type RightInput = string;
/**
 * BigQuery join kinds supported by an executable transform node.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ExecutableJoinType".
 */
export type ExecutableJoinType = "inner" | "left" | "right" | "full";
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "OperationDocument".
 */
export type OperationDocument =
  TruncateStringOperation | TrimWhitespaceOperation | DefaultValueOperation | FilterRowsOperation;
export type Kind12 = "truncate_string";
export type Field5 = string;
export type MaxLength = number;
export type Kind13 = "trim_whitespace";
export type Field6 = string;
export type Kind14 = "default_value";
export type Default = string | number | boolean;
export type Field7 = string;
export type Kind15 = "filter_rows";
/**
 * @minItems 1
 */
export type Conditions = [FieldConditionDocument, ...FieldConditionDocument[]];
export type Field8 = string;
/**
 * Closed comparison grammar for ``filter_rows``.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ComparisonOperator".
 */
export type ComparisonOperator =
  "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "is_null" | "is_not_null";
export type Value1 = string | number | boolean | (string | number | boolean)[] | null;
/**
 * How a filter's flat condition list combines.
 */
export type MatchLogic = "all" | "any";
export type Operations = OperationDocument[];
export type Fields1 = NodeFieldDocument[];
export type Id1 = string;
export type Name4 = string;
export type Type3 = "transform";
/**
 * @maxItems 4
 */
export type Clustering =
  [] | [string] | [string, string] | [string, string, string] | [string, string, string, string];
export type CursorField = string | null;
export type BusinessKey = string[];
export type Dataset = string;
export type Project = string | null;
export type Table = string;
export type MaxBatchRows = number;
export type Field9 = string | null;
/**
 * The closed set of time-unit partitioning granularities a `PartitioningSpec` may declare.
 *
 * A `StrEnum` (matching the `WriteMode`/`TransformationKind`/`JoinType` convention elsewhere in
 * `dander.pipeline`), so it serializes to/from its plain string value stably in YAML and JSON;
 * an out-of-set value fails validation with a clear `ValidationError`. Scope is deliberately
 * limited to BigQuery time-unit partitioning — integer-range partitioning is a deferred future
 * member (see `steering/02-engineering.md` on avoiding speculative generality).
 *
 * Attributes:
 *     HOUR: Hourly partitions.
 *     DAY: Daily partitions — the common case and BigQuery's default granularity.
 *     MONTH: Monthly partitions.
 *     YEAR: Yearly partitions.
 */
export type PartitioningType = "hour" | "day" | "month" | "year";
export type RequirePartitionFilter = boolean;
/**
 * How a writer handles declared columns absent from an existing target.
 */
export type SchemaEvolution = "strict" | "additive";
export type Transport = "load_job" | "storage_write" | "copy";
/**
 * Supported load strategies.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "WriteMode".
 */
export type WriteMode = "scd1" | "scd2" | "snapshot" | "incremental" | "replace";
export type Fields2 = NodeFieldDocument[];
export type Id2 = string;
export type Name5 = string;
export type Type4 = "target";
export type Fields3 = NodeFieldDocument[];
export type Id3 = string;
export type Name6 = string;
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ExtensionNodeType".
 */
export type ExtensionNodeType = string;
export type Nodes = GraphNodeDocument[];
export type Graph = string;
/**
 * The closed set of HTTP methods a `RequestSpec` may declare.
 *
 * A `StrEnum` (matching the `TransformationKind`/`JoinType` convention in `graph.py`) so callers
 * get a named, importable type that still serializes to/from its plain string value stably in
 * YAML and JSON. An out-of-set value fails validation with a clear error at the Pydantic
 * boundary. `HEAD`/`OPTIONS` are intentionally omitted (no source currently needs them); extend
 * by adding a member later without touching callers.
 *
 * Attributes:
 *     GET: Retrieve a resource. The default method (a simple GET needs no explicit spec).
 *     POST: Create a resource / submit a query body.
 *     PUT: Replace a resource.
 *     PATCH: Partially update a resource.
 *     DELETE: Remove a resource.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "HttpMethod".
 */
export type HttpMethod1 = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
/**
 * How a filter's flat condition list combines.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "MatchLogic".
 */
export type MatchLogic1 = "all" | "any";
/**
 * The closed set of time-unit partitioning granularities a `PartitioningSpec` may declare.
 *
 * A `StrEnum` (matching the `WriteMode`/`TransformationKind`/`JoinType` convention elsewhere in
 * `dander.pipeline`), so it serializes to/from its plain string value stably in YAML and JSON;
 * an out-of-set value fails validation with a clear `ValidationError`. Scope is deliberately
 * limited to BigQuery time-unit partitioning — integer-range partitioning is a deferred future
 * member (see `steering/02-engineering.md` on avoiding speculative generality).
 *
 * Attributes:
 *     HOUR: Hourly partitions.
 *     DAY: Daily partitions — the common case and BigQuery's default granularity.
 *     MONTH: Monthly partitions.
 *     YEAR: Yearly partitions.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "PartitioningType".
 */
export type PartitioningType1 = "hour" | "day" | "month" | "year";
/**
 * How a writer handles declared columns absent from an existing target.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "SchemaEvolution".
 */
export type SchemaEvolution1 = "strict" | "additive";

/**
 * Create one named graph through the hosted project collection route.
 */
export interface GraphCreateRequest {
  document: PipelineGraphDocument;
  graph: Graph;
}
/**
 * Canonical graph transport whose construction reuses Dander semantic validation.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "PipelineGraphDocument".
 */
export interface PipelineGraphDocument {
  edges?: Edges;
  name: Name;
  nodes?: Nodes;
  trigger?: TriggerDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "EdgeDocument".
 */
export interface EdgeDocument {
  from: From;
  join?: JoinDocument | null;
  mappings?: Mappings;
  metadata?: JsonObject;
  to: To;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "JoinDocument".
 */
export interface JoinDocument {
  keys: Keys;
  metadata?: JsonObject;
  type: Type;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "JoinKeyPairDocument".
 */
export interface JoinKeyPairDocument {
  left: Left;
  right: Right;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "JsonObject".
 */
export interface JsonObject {
  [k: string]: JsonValue | undefined;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "FieldMappingDocument".
 */
export interface FieldMappingDocument {
  metadata?: JsonObject;
  source?: Source;
  target: Target;
  transformation?: TransformationDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "DirectTransformation".
 */
export interface DirectTransformation {
  arguments?: EmptyObject;
  constant?: Constant;
  expression?: Expression;
  function?: Function;
  inputs?: Inputs;
  kind?: Kind;
  metadata?: JsonObject;
}
/**
 * A JSON object that must contain no properties.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "EmptyObject".
 */
export interface EmptyObject {}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ExpressionTransformation".
 */
export interface ExpressionTransformation {
  arguments?: EmptyObject;
  constant?: Constant1;
  expression: Expression1;
  function?: Function1;
  inputs?: Inputs1;
  kind: Kind1;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ConstantTransformation".
 */
export interface ConstantTransformation {
  arguments?: EmptyObject;
  constant: JsonValue | undefined;
  expression?: Expression2;
  function?: Function2;
  inputs?: Inputs2;
  kind: Kind2;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "CustomCodeTransformation".
 */
export interface CustomCodeTransformation {
  arguments?: JsonObject;
  constant?: Constant2;
  expression?: Expression3;
  function: Function3;
  inputs?: Inputs3;
  kind: Kind3;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "SourceNodeDocument".
 */
export interface SourceNodeDocument {
  config?: SourceNodeConfigDocument;
  cursor?: CursorStrategyDocument | null;
  fields?: Fields;
  id: Id;
  name: Name3;
  /**
   * @deprecated
   */
  params?: SourceNodeConfigDocument | null;
  trigger?: TriggerDocument | null;
  type: Type2;
  visual?: NodeVisualDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "SourceNodeConfigDocument".
 */
export interface SourceNodeConfigDocument {
  connector?: Connector;
  endpoint?: Endpoint;
  request?: RequestSpecDocument | null;
  [k: string]: JsonValue | undefined;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "RequestSpecDocument".
 */
export interface RequestSpecDocument {
  body?: Body;
  headers?: Headers;
  method?: HttpMethod;
  query_params?: QueryParams;
}
export interface Headers {
  [k: string]: string | undefined;
}
export interface QueryParams {
  [k: string]: string | undefined;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "CursorStrategyDocument".
 */
export interface CursorStrategyDocument {
  field: Field;
  kind: Kind4;
  metadata?: JsonObject;
  params?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "NodeFieldDocument".
 */
export interface NodeFieldDocument {
  cast_to?: CastTo;
  description?: Description;
  extensions?: Extensions;
  metadata?: JsonObject;
  name: Name2;
  nullable?: Nullable;
  tests?: Tests;
  type: Type1;
}
/**
 * One deterministic provider-specific schema annotation, never a credential.
 *
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ProviderExtension".
 */
export interface ProviderExtension {
  name: Name1;
  provider: Provider;
  value: Value;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "NotNullFieldTest".
 */
export interface NotNullFieldTest {
  field?: Field1;
  kind: Kind5;
  metadata?: JsonObject;
  to?: To1;
  values?: Values;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "UniqueFieldTest".
 */
export interface UniqueFieldTest {
  field?: Field2;
  kind: Kind6;
  metadata?: JsonObject;
  to?: To2;
  values?: Values1;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "AcceptedValuesFieldTest".
 */
export interface AcceptedValuesFieldTest {
  field?: Field3;
  kind: Kind7;
  metadata?: JsonObject;
  to?: To3;
  values: Values2;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "RelationshipsFieldTest".
 */
export interface RelationshipsFieldTest {
  field: Field4;
  kind: Kind8;
  metadata?: JsonObject;
  to: To4;
  values?: Values3;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ScheduleTrigger".
 */
export interface ScheduleTrigger {
  cron: Cron;
  depends_on?: DependsOn;
  event?: Event;
  kind: Kind9;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "DependencyTrigger".
 */
export interface DependencyTrigger {
  cron?: Cron1;
  depends_on: DependsOn1;
  event?: Event1;
  kind: Kind10;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ManualTrigger".
 */
export interface ManualTrigger {
  cron?: Cron2;
  depends_on?: DependsOn2;
  event?: Event2;
  kind: Kind11;
  metadata?: JsonObject;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "NodeVisualDocument".
 */
export interface NodeVisualDocument {
  color?: Color;
  icon?: Icon;
  position?: PositionDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "PositionDocument".
 */
export interface PositionDocument {
  x: X;
  y: Y;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TransformNodeDocument".
 */
export interface TransformNodeDocument {
  config?: TransformNodeConfigDocument;
  cursor?: CursorStrategyDocument | null;
  fields?: Fields1;
  id: Id1;
  name: Name4;
  /**
   * @deprecated
   */
  params?: TransformNodeConfigDocument | null;
  trigger?: TriggerDocument | null;
  type: Type3;
  visual?: NodeVisualDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TransformNodeConfigDocument".
 */
export interface TransformNodeConfigDocument {
  join?: TransformJoinDocument | null;
  operations?: Operations;
  [k: string]: JsonValue | undefined;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TransformJoinDocument".
 */
export interface TransformJoinDocument {
  keys: Keys1;
  left_input: LeftInput;
  right_input: RightInput;
  type: ExecutableJoinType;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ExecutableJoinKeyDocument".
 */
export interface ExecutableJoinKeyDocument {
  left: Left1;
  right: Right1;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TruncateStringOperation".
 */
export interface TruncateStringOperation {
  kind: Kind12;
  metadata?: JsonObject;
  params: TruncateStringParamsDocument;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TruncateStringParamsDocument".
 */
export interface TruncateStringParamsDocument {
  field: Field5;
  max_length: MaxLength;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TrimWhitespaceOperation".
 */
export interface TrimWhitespaceOperation {
  kind: Kind13;
  metadata?: JsonObject;
  params: TrimWhitespaceParamsDocument;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TrimWhitespaceParamsDocument".
 */
export interface TrimWhitespaceParamsDocument {
  field: Field6;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "DefaultValueOperation".
 */
export interface DefaultValueOperation {
  kind: Kind14;
  metadata?: JsonObject;
  params: DefaultValueParamsDocument;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "DefaultValueParamsDocument".
 */
export interface DefaultValueParamsDocument {
  default: Default;
  field: Field7;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "FilterRowsOperation".
 */
export interface FilterRowsOperation {
  kind: Kind15;
  metadata?: JsonObject;
  params: FilterRowsParamsDocument;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "FilterRowsParamsDocument".
 */
export interface FilterRowsParamsDocument {
  conditions: Conditions;
  logic?: MatchLogic;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "FieldConditionDocument".
 */
export interface FieldConditionDocument {
  field: Field8;
  op: ComparisonOperator;
  value?: Value1;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TargetNodeDocument".
 */
export interface TargetNodeDocument {
  config?: TargetNodeConfigDocument;
  cursor?: CursorStrategyDocument | null;
  fields?: Fields2;
  id: Id2;
  name: Name5;
  /**
   * @deprecated
   */
  params?: TargetNodeConfigDocument | null;
  trigger?: TriggerDocument | null;
  type: Type4;
  visual?: NodeVisualDocument | null;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "TargetNodeConfigDocument".
 */
export interface TargetNodeConfigDocument {
  writer?: WriterDocument | null;
  [k: string]: JsonValue | undefined;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "WriterDocument".
 */
export interface WriterDocument {
  clustering?: Clustering;
  cursor_field?: CursorField;
  destination: DestinationDocument;
  max_batch_rows?: MaxBatchRows;
  partitioning?: PartitioningDocument | null;
  schema_evolution?: SchemaEvolution;
  transport?: Transport;
  write_mode: WriteMode;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "DestinationDocument".
 */
export interface DestinationDocument {
  business_key?: BusinessKey;
  dataset: Dataset;
  project?: Project;
  table: Table;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "PartitioningDocument".
 */
export interface PartitioningDocument {
  field?: Field9;
  granularity?: PartitioningType;
  require_partition_filter?: RequirePartitionFilter;
}
/**
 * This interface was referenced by `GraphCreateRequest`'s JSON-Schema
 * via the `definition` "ExtensionNodeDocument".
 */
export interface ExtensionNodeDocument {
  config?: JsonObject;
  cursor?: CursorStrategyDocument | null;
  fields?: Fields3;
  id: Id3;
  name: Name6;
  /**
   * @deprecated
   */
  params?: JsonObject | null;
  trigger?: TriggerDocument | null;
  type: ExtensionNodeType;
  visual?: NodeVisualDocument | null;
}
