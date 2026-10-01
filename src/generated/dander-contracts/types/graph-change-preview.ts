/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type AffectedOutputs = string[];
export type BaselineContentSha256 = string;
export type CandidateContentSha256 = string;
export type Change = "added" | "removed" | "modified";
export type Source = string;
export type Target = string;
export type ConnectionChanges = GraphConnectionChange[];
export type CostUsd = null;
export type Explanation = string;
export type RowsWritten = null;
export type GraphPropertiesChanged = string[];
export type Limitations = string[];
export type AffectsData = boolean;
export type Change1 = "added" | "removed" | "modified" | "layout_only";
export type ChangedProperties = string[];
export type Name = string;
export type NodeId = string;
export type NodeChanges = GraphNodeChange[];
export type Affected = boolean;
export type FieldNames = string[];
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
export type Field = string | null;
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
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "WriteMode".
 */
export type WriteMode = "scd1" | "scd2" | "snapshot" | "incremental" | "replace";
export type Effect = string;
export type Name1 = string;
export type NodeId1 = string;
export type Outputs = GraphOutputImpact[];
export type RunOutputIds = string[];
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
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "PartitioningType".
 */
export type PartitioningType1 = "hour" | "day" | "month" | "year";
/**
 * How a writer handles declared columns absent from an existing target.
 *
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "SchemaEvolution".
 */
export type SchemaEvolution1 = "strict" | "additive";

/**
 * Static changes and potential downstream effects; a run still executes all outputs.
 */
export interface GraphChangePreviewResponse {
  affected_outputs: AffectedOutputs;
  baseline_content_sha256: BaselineContentSha256;
  candidate_content_sha256: CandidateContentSha256;
  connection_changes: ConnectionChanges;
  estimates?: GraphChangeEstimates;
  graph_properties_changed: GraphPropertiesChanged;
  limitations?: Limitations;
  node_changes: NodeChanges;
  outputs: Outputs;
  run_output_ids: RunOutputIds;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "GraphConnectionChange".
 */
export interface GraphConnectionChange {
  change: Change;
  source: Source;
  target: Target;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "GraphChangeEstimates".
 */
export interface GraphChangeEstimates {
  cost_usd?: CostUsd;
  explanation?: Explanation;
  rows_written?: RowsWritten;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "GraphNodeChange".
 */
export interface GraphNodeChange {
  affects_data: AffectsData;
  change: Change1;
  changed_properties?: ChangedProperties;
  name: Name;
  node_id: NodeId;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "GraphOutputImpact".
 */
export interface GraphOutputImpact {
  affected: Affected;
  after: GraphOutputState | null;
  before: GraphOutputState | null;
  effect: Effect;
  name: Name1;
  node_id: NodeId1;
}
/**
 * Only declared output coordinates and field names, never arbitrary node configuration.
 *
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "GraphOutputState".
 */
export interface GraphOutputState {
  field_names: FieldNames;
  writer: WriterDocument | null;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
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
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "DestinationDocument".
 */
export interface DestinationDocument {
  business_key?: BusinessKey;
  dataset: Dataset;
  project?: Project;
  table: Table;
}
/**
 * This interface was referenced by `GraphChangePreviewResponse`'s JSON-Schema
 * via the `definition` "PartitioningDocument".
 */
export interface PartitioningDocument {
  field?: Field;
  granularity?: PartitioningType;
  require_partition_filter?: RequirePartitionFilter;
}
