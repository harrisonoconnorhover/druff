import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * Seeds a fully-keyed `config` for a freshly-dropped connector node. Non-secret fields may carry
 * a descriptor-owned runtime binding default; secret references always start empty.
 * Pure and framework-free so it unit-tests without any store/DOM.
 */
export function defaultConfigForDescriptor(
  descriptor: ConnectorDescriptor,
): Record<string, string> {
  const config: Record<string, string> = {};
  for (const field of descriptor.fields) {
    config[field.key] = field.type === "secret" ? "" : (field.defaultValue ?? "");
  }
  return config;
}
