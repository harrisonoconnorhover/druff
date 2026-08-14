import {
  CapabilitiesResponseSchema,
  ControlBootstrapDescriptorSchema,
} from "@/lib/dander-contracts/runtime";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
  DANDER_CONTRACT_PACKAGE_VERSION,
} from "@/generated/dander-contracts/metadata";
import type { CapabilitiesResponse } from "@/generated/dander-contracts/types/capabilities";
import type { ControlBootstrapDescriptor } from "@/generated/dander-contracts/types/control-bootstrap";

export const DRUFF_CONTRACT_VERSION = "1.0.0" as const;

export class IncompatibleDanderContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncompatibleDanderContractError";
  }
}

function parseVersion(value: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function compareVersions(left: [number, number, number], right: [number, number, number]): number {
  for (let index = 0; index < left.length; index += 1) {
    const difference = left[index]! - right[index]!;
    if (difference !== 0) return difference;
  }
  return 0;
}

function maximumVersion(value: string): [number, number, number] | null {
  const exact = parseVersion(value);
  if (exact) return exact;
  const major = /^(\d+)\.x$/.exec(value);
  if (major) return [Number(major[1]), Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
  const minor = /^(\d+)\.(\d+)\.x$/.exec(value);
  return minor ? [Number(minor[1]), Number(minor[2]), Number.MAX_SAFE_INTEGER] : null;
}

type ContractEnvelope = Pick<CapabilitiesResponse, "compatibility" | "contract">;

function assertCompatibleContract<T extends ContractEnvelope>(value: T): T {
  const minimum = parseVersion(value.compatibility.minimum_druff_contract);
  const maximum = maximumVersion(value.compatibility.maximum_druff_contract);
  const current = parseVersion(DRUFF_CONTRACT_VERSION)!;

  if (!minimum || !maximum) {
    throw new IncompatibleDanderContractError(
      "Dander advertised an unreadable Druff contract range. Upgrade Dander or Druff so their generated control contracts match.",
    );
  }
  if (compareVersions(current, minimum) < 0 || compareVersions(current, maximum) > 0) {
    throw new IncompatibleDanderContractError(
      `Dander requires Druff contract ${value.compatibility.minimum_druff_contract} through ${value.compatibility.maximum_druff_contract}, but this Druff build uses ${DRUFF_CONTRACT_VERSION}. Upgrade the incompatible application.`,
    );
  }
  if (
    value.contract.id !== DANDER_CONTRACT_BUNDLE_ID ||
    value.contract.sha256 !== DANDER_CONTRACT_BUNDLE_SHA256
  ) {
    throw new IncompatibleDanderContractError(
      `Dander's control contract does not match this Druff build. Use Dander ${DANDER_CONTRACT_PACKAGE_VERSION} with this build, or upgrade Druff for the advertised bundle.`,
    );
  }
  return value;
}

/** Parse and verify Dander's generated capability identity before a hosted editor uses it. */
export function assertCompatibleCapabilities(input: unknown): CapabilitiesResponse {
  return assertCompatibleContract(CapabilitiesResponseSchema.parse(input));
}

/** Parse and verify the public hosted-control descriptor before any OIDC request is allowed. */
export function assertCompatibleControlBootstrap(input: unknown): ControlBootstrapDescriptor {
  return assertCompatibleContract(ControlBootstrapDescriptorSchema.parse(input));
}
