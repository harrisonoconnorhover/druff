import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";
import type { ControlBootstrapDescriptor } from "@/lib/dander-contracts";

export function hostedControlDescriptor(
  origin = "https://druff.example.test",
): ControlBootstrapDescriptor {
  return {
    schema_version: 1,
    api_url: "https://control.example.test",
    issuer: "https://identity.example.test/tenant",
    public_client_id: "druff-public-client",
    api_audience: "https://control.example.test/api",
    redirect_uri: `${origin}/auth/callback`,
    logout_uri: `${origin}/signed-out`,
    contract: {
      id: DANDER_CONTRACT_BUNDLE_ID,
      sha256: DANDER_CONTRACT_BUNDLE_SHA256,
    },
    compatibility: {
      minimum_druff_contract: "1.0.0",
      maximum_druff_contract: "1.x",
    },
  };
}
