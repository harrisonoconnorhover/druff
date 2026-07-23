"use client";

import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ConnectorDescriptor,
  ConnectorFieldDescriptor,
} from "@/features/connector-library/descriptors/types";

export type ConnectorConfigFormProps = {
  descriptor: ConnectorDescriptor;
  /** The node's config, string-keyed (see `NodeInspector`'s coercion at this seam). */
  config: Record<string, string>;
  /** Field-key -> message, from `validateConnectorConfig`; absent key means that field is valid. */
  errors: Record<string, string>;
  /** Called with a single field's key + new value on every keystroke — never batched. */
  onChange: (key: string, value: string) => void;
};

/**
 * The descriptor-driven connector config form (DRUFF-6): one row per `descriptor.fields` entry,
 * generic JSX with per-field *content* coming entirely from the descriptor — no hardcoded
 * per-connector markup. Pure presentational + fully controlled (no local state, no store access),
 * so it can never drift from the store-held `config` it's bound to (mirrors `NodeInspector`'s
 * "driven by the store" rule for the generic `NodeConfigEditor`).
 *
 * Both `text` and `secret` fields render the same plain (unmasked) `Input` — a `secret` field
 * holds a reference/handle to a secret, not the secret value itself, so masking it would be
 * misleading rather than protective (see this ticket's Design "secret-as-reference" trade-off).
 */
export function ConnectorConfigForm({
  descriptor,
  config,
  errors,
  onChange,
}: ConnectorConfigFormProps) {
  return (
    <div className="flex flex-col gap-3">
      {descriptor.fields.map((field) => (
        <ConnectorConfigField
          key={field.key}
          field={field}
          value={config[field.key] ?? ""}
          error={errors[field.key]}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
}

function ConnectorConfigField({
  field,
  value,
  error,
  onChange,
}: {
  field: ConnectorFieldDescriptor;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputId = `connector-field-${field.key}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      <Input
        id={inputId}
        value={value}
        placeholder={field.placeholder}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      {field.type === "secret" && (
        <p className="text-xs text-muted-foreground">
          Reference to a secret Dander resolves at run time — never the secret value itself.
        </p>
      )}
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
