/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
