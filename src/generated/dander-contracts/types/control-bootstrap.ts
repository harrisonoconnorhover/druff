/**
 * Generated from dander-platform==0.9.0rc34 (dander_platform-0.9.0rc34-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl
 * Wheel SHA256: d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
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
