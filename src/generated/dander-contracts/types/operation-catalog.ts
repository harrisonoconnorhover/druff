/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Description = string;
export type DisplayName = string;
export type Kind = "truncate_string" | "trim_whitespace" | "default_value" | "filter_rows";
export type Control = string;
export type DisplayName1 = string;
export type Minimum = number | null;
export type Name = string;
export type Operators = string[];
/**
 * This interface was referenced by `OperationCatalogResponse`'s JSON-Schema
 * via the `definition` "JsonValue".
 */
export type JsonValue = unknown;
export type Options = JsonValue[];
export type Required = boolean;
export type Parameters = OperationParameter[];
export type Operations = OperationDescriptor[];
export type SchemaVersion = 1;

export interface OperationCatalogResponse {
  operations: Operations;
  schema_version?: SchemaVersion;
}
/**
 * This interface was referenced by `OperationCatalogResponse`'s JSON-Schema
 * via the `definition` "OperationDescriptor".
 */
export interface OperationDescriptor {
  description: Description;
  display_name: DisplayName;
  kind: Kind;
  parameters?: Parameters;
}
/**
 * This interface was referenced by `OperationCatalogResponse`'s JSON-Schema
 * via the `definition` "OperationParameter".
 */
export interface OperationParameter {
  control: Control;
  default?: {
    [k: string]: unknown | undefined;
  };
  display_name: DisplayName1;
  minimum?: Minimum;
  name: Name;
  operators?: Operators;
  options?: Options;
  required: Required;
}
