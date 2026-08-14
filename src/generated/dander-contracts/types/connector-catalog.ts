/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
