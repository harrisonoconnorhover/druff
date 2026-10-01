/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
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
