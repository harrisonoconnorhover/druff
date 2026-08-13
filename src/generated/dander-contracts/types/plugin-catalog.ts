/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
