/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Compatible = boolean;
export type DanderSpecifier = string;
export type Description = string;
export type DisplayName = string;
export type Distribution = string;
export type DocumentationUrl = string;
export type Id = string;
export type Installed = boolean;
export type InstalledVersion = string | null;
export type PypiUrl = string;
export type RepositoryUrl = string;
export type SupportStatus = string;
export type ValidationStatus = string;
export type Version = string;
export type Connectors = PluginCatalogRecord[];
export type DanderVersion = string;
export type SchemaVersion = 1;

export interface PluginCatalogResponse {
  connectors?: Connectors;
  dander_version: DanderVersion;
  schema_version?: SchemaVersion;
}
/**
 * This interface was referenced by `PluginCatalogResponse`'s JSON-Schema
 * via the `definition` "PluginCatalogRecord".
 */
export interface PluginCatalogRecord {
  compatible: Compatible;
  dander_specifier: DanderSpecifier;
  description: Description;
  display_name: DisplayName;
  distribution: Distribution;
  documentation_url: DocumentationUrl;
  id: Id;
  installed: Installed;
  installed_version?: InstalledVersion;
  pypi_url: PypiUrl;
  repository_url: RepositoryUrl;
  support_status: SupportStatus;
  validation_status: ValidationStatus;
  version: Version;
}
