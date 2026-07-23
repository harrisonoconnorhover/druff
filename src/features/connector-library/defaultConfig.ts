import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * Seeds a fully-keyed, empty `config` for a freshly-dropped connector node — one entry per
 * descriptor field, each `""`. Guarantees every declared field (including `secret` ones) has a
 * stable key to edit from the start, and — deliberately — that no `secret` field ever gets a
 * non-empty default (`01-security.md`: no credential value ever lives in code/fixtures/state).
 * Pure and framework-free so it unit-tests without any store/DOM.
 */
export function defaultConfigForDescriptor(
  descriptor: ConnectorDescriptor,
): Record<string, string> {
  const config: Record<string, string> = {};
  for (const field of descriptor.fields) {
    config[field.key] = "";
  }
  return config;
}
