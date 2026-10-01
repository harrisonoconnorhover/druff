/**
 * Generated from dander-platform==0.9.0rc34 (dander_platform-0.9.0rc34-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl
 * Wheel SHA256: d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Environments = string[];
export type EstimatedCostUsd = null;
export type EstimatedRows = null;
export type GraphContentSha256 = string;
export type Limitations = string[];
export type BusinessKey = string[];
export type BusinessKey1 = string[];
export type Dataset = string;
export type Project = string | null;
export type Table = string;
export type Name = string;
export type NodeId = string;
export type PartitionField = string;
export type PartitionType = "DATE" | "TIMESTAMP";
export type Outputs = GraphRepairOutput[];
export type Source = "retained_raw";
export type Summary = string;
export type EndDate = string;
export type StartDate = string;

export interface GraphRepairPreviewResponse {
  environments: Environments;
  estimated_cost_usd?: EstimatedCostUsd;
  estimated_rows?: EstimatedRows;
  graph_content_sha256: GraphContentSha256;
  limitations?: Limitations;
  outputs: Outputs;
  source?: Source;
  summary?: Summary;
  window: GraphRepairWindow;
}
/**
 * This interface was referenced by `GraphRepairPreviewResponse`'s JSON-Schema
 * via the `definition` "GraphRepairOutput".
 */
export interface GraphRepairOutput {
  business_key: BusinessKey;
  destination: DestinationDocument;
  name: Name;
  node_id: NodeId;
  partition_field: PartitionField;
  partition_type: PartitionType;
}
/**
 * This interface was referenced by `GraphRepairPreviewResponse`'s JSON-Schema
 * via the `definition` "DestinationDocument".
 */
export interface DestinationDocument {
  business_key?: BusinessKey1;
  dataset: Dataset;
  project?: Project;
  table: Table;
}
/**
 * UTC calendar dates: start is inclusive and end is exclusive.
 *
 * This interface was referenced by `GraphRepairPreviewResponse`'s JSON-Schema
 * via the `definition` "GraphRepairWindow".
 */
export interface GraphRepairWindow {
  end_date: EndDate;
  start_date: StartDate;
}
