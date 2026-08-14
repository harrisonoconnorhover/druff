/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
