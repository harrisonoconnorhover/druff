/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Description = string;
export type DisplayName = string;
export type DisplayName1 = string;
export type DataType = string;
export type DisplayName2 = string;
export type Name = string;
export type Required = boolean;
export type Fields = ConnectorField[];
export type Connector = string;
export type Endpoint = string;
export type Id = string;
export type Endpoints = ConnectorEndpoint[];
export type Engine = string;
export type Id1 = string;
export type Distribution = string;
export type Id2 = string;
export type Version = string;
export type Connectors = InstalledConnector[];

export interface ConnectorCatalogResponse {
  connectors?: Connectors;
}
/**
 * This interface was referenced by `ConnectorCatalogResponse`'s JSON-Schema
 * via the `definition` "InstalledConnector".
 */
export interface InstalledConnector {
  description?: Description;
  display_name: DisplayName;
  endpoints?: Endpoints;
  engine: Engine;
  id: Id1;
  plugin: InstalledPluginIdentity;
}
/**
 * This interface was referenced by `ConnectorCatalogResponse`'s JSON-Schema
 * via the `definition` "ConnectorEndpoint".
 */
export interface ConnectorEndpoint {
  display_name: DisplayName1;
  fields?: Fields;
  graph_binding: ConnectorBinding;
  id: Id;
}
/**
 * This interface was referenced by `ConnectorCatalogResponse`'s JSON-Schema
 * via the `definition` "ConnectorField".
 */
export interface ConnectorField {
  data_type: DataType;
  display_name: DisplayName2;
  name: Name;
  required?: Required;
}
/**
 * This interface was referenced by `ConnectorCatalogResponse`'s JSON-Schema
 * via the `definition` "ConnectorBinding".
 */
export interface ConnectorBinding {
  connector: Connector;
  endpoint: Endpoint;
}
/**
 * This interface was referenced by `ConnectorCatalogResponse`'s JSON-Schema
 * via the `definition` "InstalledPluginIdentity".
 */
export interface InstalledPluginIdentity {
  distribution: Distribution;
  id: Id2;
  version: Version;
}
