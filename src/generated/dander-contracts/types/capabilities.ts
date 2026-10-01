/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type ApiVersion = "v1";
export type MaximumDruffContract = string;
export type MinimumDruffContract = string;
export type Id = "io.dander.control.contracts/v1";
export type Sha256 = string;
export type DanderVersion = string;
export type MaxGraphBytes = number;
export type MaxLogRecords = number;
export type MaxPageSize = number;
export type Operations = (
  | "graph.read"
  | "graph.edit"
  | "graph.delete"
  | "graph.validate"
  | "graph.change-preview"
  | "graph.repair-preview"
  | "deployment.preview"
  | "run.start"
  | "run.read"
  | "run.explain"
  | "run.repair"
  | "run.logs"
  | "run.cancel"
  | "run.replay"
)[];

export interface CapabilitiesResponse {
  api_version?: ApiVersion;
  compatibility: CompatibilityRange;
  contract: ContractIdentity;
  dander_version: DanderVersion;
  limits: ControlLimits;
  operations: Operations;
}
/**
 * This interface was referenced by `CapabilitiesResponse`'s JSON-Schema
 * via the `definition` "CompatibilityRange".
 */
export interface CompatibilityRange {
  maximum_druff_contract: MaximumDruffContract;
  minimum_druff_contract: MinimumDruffContract;
}
/**
 * This interface was referenced by `CapabilitiesResponse`'s JSON-Schema
 * via the `definition` "ContractIdentity".
 */
export interface ContractIdentity {
  id: Id;
  sha256: Sha256;
}
/**
 * This interface was referenced by `CapabilitiesResponse`'s JSON-Schema
 * via the `definition` "ControlLimits".
 */
export interface ControlLimits {
  max_graph_bytes: MaxGraphBytes;
  max_log_records: MaxLogRecords;
  max_page_size: MaxPageSize;
}
