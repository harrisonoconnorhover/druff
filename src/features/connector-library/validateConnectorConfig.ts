import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * Pure, framework-free required-field validator for a connector's `config` against its descriptor
 * — the "actionable, not a crash" validation `ConnectorConfigForm` renders (AC4). A field whose
 * value is missing or blank (whitespace-only) after trimming is reported; every other field is
 * silently valid. An empty result means the config is fully valid, so callers can treat
 * `Object.keys(errors).length === 0` as the pass/fail signal without a separate boolean.
 */
export function validateConnectorConfig(
  descriptor: ConnectorDescriptor,
  config: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of descriptor.fields) {
    if (!field.required) continue;
    const value = config[field.key];
    if (value === undefined || value.trim() === "") {
      errors[field.key] = `${field.label} is required.`;
    }
  }
  return errors;
}
