/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type ApiAudience = string;
export type ApiUrl = string;
export type MaximumDruffContract = string;
export type MinimumDruffContract = string;
export type Id = "io.dander.control.contracts/v1";
export type Sha256 = string;
export type Issuer = string;
export type LogoutUri = string;
export type PublicClientId = string;
export type RedirectUri = string;
export type SchemaVersion = 1;

/**
 * Secret-free discovery data for one hosted Druff deployment.
 */
export interface ControlBootstrapDescriptor {
  api_audience: ApiAudience;
  api_url: ApiUrl;
  compatibility: CompatibilityRange;
  contract: ContractIdentity;
  issuer: Issuer;
  logout_uri: LogoutUri;
  public_client_id: PublicClientId;
  redirect_uri: RedirectUri;
  schema_version?: SchemaVersion;
}
/**
 * This interface was referenced by `ControlBootstrapDescriptor`'s JSON-Schema
 * via the `definition` "CompatibilityRange".
 */
export interface CompatibilityRange {
  maximum_druff_contract: MaximumDruffContract;
  minimum_druff_contract: MinimumDruffContract;
}
/**
 * This interface was referenced by `ControlBootstrapDescriptor`'s JSON-Schema
 * via the `definition` "ContractIdentity".
 */
export interface ContractIdentity {
  id: Id;
  sha256: Sha256;
}
