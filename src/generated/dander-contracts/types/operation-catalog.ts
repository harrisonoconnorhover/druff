/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
