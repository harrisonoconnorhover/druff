"use client";

import { useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  readTriggerConfig,
  writeTriggerConfig,
  validateTrigger,
  TRIGGER_MODES,
  type TriggerFieldDescriptor,
  type TriggerFieldValues,
} from "@/features/pipeline-canvas/inspector/categories/triggerConfig";
import type {
  ConfigCategory,
  ConfigCategoryEditorProps,
} from "@/features/pipeline-canvas/inspector/configCategories";
import type { TriggerKind } from "@/lib/pipeline-graph";

/**
 * The Trigger config category editor (DRUFF-13): a mode selector (schedule / webhook-event /
 * upstream-dependency — Dander's `TriggerKind`) plus the active mode's fields, bound to the DRUFF-11
 * config-category seam (`config`-bearing `node` in, `onConfigChange(config)` out).
 *
 * Uses `Tabs` for the mode selector — no `Select`/`RadioGroup` primitive is vendored yet, and Tabs
 * cleanly pairs each mode with its own field panel (this ticket's Design).
 *
 * Holds the editable field values in local state seeded from `readTriggerConfig` on mount — same
 * rationale as `NodeConfigEditor`/`HttpRequestConfigEditor`: a half-typed cron or an empty new
 * `depends_on` row must survive between keystrokes. Every edit **and** every mode switch
 * immediately recomputes via `writeTriggerConfig` and calls `onConfigChange`, so the store never
 * lags the UI (this ticket's Design "Data flow"). `NodeInspector` mounts a fresh instance per node
 * (`key={node.id}`), so selection changes reset this local state automatically.
 */
function TriggerConfigEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const initial = readTriggerConfig(node.data.config);
  const [kind, setKind] = useState<TriggerKind>(initial.kind ?? TRIGGER_MODES[0].kind);
  const [values, setValues] = useState<TriggerFieldValues>(initial.values);
  const errors = validateTrigger(kind, values);

  function commit(nextKind: TriggerKind, nextValues: TriggerFieldValues): void {
    setKind(nextKind);
    setValues(nextValues);
    onConfigChange(writeTriggerConfig(node.data.config, nextKind, nextValues));
  }

  return (
    <Tabs value={kind} onValueChange={(value) => commit(value as TriggerKind, values)}>
      <TabsList>
        {TRIGGER_MODES.map((mode) => (
          <TabsTrigger key={mode.kind} value={mode.kind}>
            {mode.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TRIGGER_MODES.map((mode) => (
        <TabsContent key={mode.kind} value={mode.kind} className="flex flex-col gap-3 pt-2">
          {mode.help && <p className="text-xs text-muted-foreground">{mode.help}</p>}
          {mode.fields.map((field) => (
            <TriggerFieldControl
              key={field.key}
              field={field}
              values={values}
              error={errors[field.key]}
              onChange={(nextValues) => commit(kind, nextValues)}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

type TriggerFieldControlProps = {
  field: TriggerFieldDescriptor;
  values: TriggerFieldValues;
  error?: string;
  onChange: (values: TriggerFieldValues) => void;
};

/** Renders one field of the active mode: a plain text input for `cron`/`event`, or an add/remove
 *  list for `depends_on` (multi), reusing the row pattern already established by `NodeConfigEditor`
 *  and `HttpRequestConfigEditor`'s header list. Switches on `field.key` explicitly (rather than a
 *  generic computed-property update) so every branch stays fully typed against
 *  `TriggerFieldValues` with no bare `any`. */
function TriggerFieldControl({ field, values, error, onChange }: TriggerFieldControlProps) {
  if (field.multi) {
    return <DependsOnListControl field={field} values={values} error={error} onChange={onChange} />;
  }

  const value = field.key === "cron" ? values.cron : values.event;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const next = event.target.value;
    onChange(field.key === "cron" ? { ...values, cron: next } : { ...values, event: next });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`trigger-${field.key}`}>
        {field.label}
        {field.required && " *"}
      </Label>
      <Input
        id={`trigger-${field.key}`}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        value={value}
        onChange={handleChange}
      />
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** The `depends_on` add/remove list — the one `multi` field today (dependency mode). */
function DependsOnListControl({ field, values, error, onChange }: TriggerFieldControlProps) {
  const items = values.depends_on;

  function updateItems(next: string[]): void {
    onChange({ ...values, depends_on: next });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {field.label}
        {field.required && " *"}
      </Label>
      {items.length === 0 && <p className="text-xs text-muted-foreground">None yet.</p>}
      {items.map((item, index) => (
        // Index as key: same rationale as `NodeConfigEditor`'s rows — no identity beyond position,
        // only appended/removed.
        <div key={index} className="flex items-center gap-1.5">
          <Input
            aria-label={`${field.label} ${index + 1}`}
            placeholder={field.placeholder}
            value={item}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateItems(items.map((existing, i) => (i === index ? event.target.value : existing)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${field.label.toLowerCase()}`}
            onClick={() => updateItems(items.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => updateItems([...items, ""])}>
        <Plus />
        Add dependency
      </Button>
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Registration for {@link TriggerConfigEditor} at the DRUFF-11 config-category seam: matches any
 * node whose canvas `kind` is `trigger`, independent of its free-form `type` string.
 */
export const TRIGGER_CONFIG_CATEGORY: ConfigCategory = {
  id: "trigger",
  label: "Trigger config",
  matches: (node) => node.data.kind === "trigger",
  Editor: TriggerConfigEditor,
};
