/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
  | "deployment.preview"
  | "run.start"
  | "run.read"
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
