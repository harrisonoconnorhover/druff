"use client";

import type { ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MappingError } from "@/features/pipeline-canvas/inspector/validateMapping";
import type { FieldMapping, NodeField, TransformationKind } from "@/lib/pipeline-graph/schema";

/** Sentinel `<select>` value for "derived — no source", distinct from any real field name, so the
 * source picker can represent `source: null` as a normal option rather than a disabled/blank one. */
const DERIVED_SOURCE_VALUE = "__derived__";

/** Shared native-control styling, matching `Input`'s look (`src/components/ui/input.tsx`) since a
 * plain `<select>`/text `<input>` is used here rather than a shadcn wrapper — see this ticket's
 * Design "native `<select>`/`<textarea>` vs. Radix `Select`/Monaco" trade-off (Radix `Select` is
 * unreliable under jsdom; a plain-text control keeps the "never evaluate" guarantee trivial). */
const CONTROL_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80";

/** Props for {@link MappingRow}. */
export type MappingRowProps = {
  /** The mapping this row renders/edits. */
  mapping: FieldMapping;
  /** The source/`from` node's declared fields — the vocabulary the source picker resolves against. */
  sourceFields: NodeField[];
  /** The target/`to` node's declared fields — the vocabulary the target picker resolves against. */
  targetFields: NodeField[];
  /** Shape-rule errors for this mapping, from `validateMapping`. */
  errors: MappingError[];
  /** Whether this is the first mapping in the list (disables move-up). */
  isFirst: boolean;
  /** Whether this is the last mapping in the list (disables move-down). */
  isLast: boolean;
  onTargetChange: (target: string) => void;
  onSourceChange: (source: string | null) => void;
  onKindChange: (kind: TransformationKind) => void;
  onExpressionChange: (expression: string) => void;
  onConstantChange: (value: unknown) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
};

/**
 * One `FieldMapping`'s edit controls (DRUFF-9's `EdgeMappingsEditor` renders one per mapping):
 * target/source field pickers, a transformation `kind` selector, the `expression`/`constant`
 * sub-editors shown only for their matching kind, and reorder/remove buttons. Purely
 * presentational — data in via props, edits out via callbacks, no local state and no store access
 * — so it can never drift from the mapping it's bound to (mirrors `ConnectorConfigForm`'s fully-
 * controlled shape) and stays trivial to unit-test in isolation.
 */
export function MappingRow({
  mapping,
  sourceFields,
  targetFields,
  errors,
  isFirst,
  isLast,
  onTargetChange,
  onSourceChange,
  onKindChange,
  onExpressionChange,
  onConstantChange,
  onRemove,
  onMove,
}: MappingRowProps) {
  const kind = mapping.transformation?.kind ?? "direct";
  const messageFor = (field: MappingError["field"]): string | undefined =>
    errors.find((error) => error.field === field)?.message;
  const targetError = messageFor("target");
  const sourceError = messageFor("source");
  const transformationError = messageFor("transformation");
  const expressionError = messageFor("expression");

  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-2">
      <div className="flex items-end gap-1.5">
        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs font-normal">Target</Label>
          {targetFields.length === 0 ? (
            <select aria-label="Target field" disabled className={CONTROL_CLASS}>
              <option>Declare fields on the target node first</option>
            </select>
          ) : (
            <select
              aria-label="Target field"
              aria-invalid={Boolean(targetError)}
              value={mapping.target}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                onTargetChange(event.target.value)
              }
              className={CONTROL_CLASS}
            >
              <option value="" disabled>
                Select a target field
              </option>
              {targetFields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs font-normal">Source</Label>
          <select
            aria-label="Source field"
            value={mapping.source ?? DERIVED_SOURCE_VALUE}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const { value } = event.target;
              onSourceChange(value === DERIVED_SOURCE_VALUE ? null : value);
            }}
            className={CONTROL_CLASS}
          >
            <option value={DERIVED_SOURCE_VALUE}>(derived — no source)</option>
            {sourceFields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move mapping up"
          disabled={isFirst}
          onClick={() => onMove("up")}
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move mapping down"
          disabled={isLast}
          onClick={() => onMove("down")}
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove mapping"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {targetError && <p className="text-xs text-destructive">{targetError}</p>}
      {sourceError && <p className="text-xs text-destructive">{sourceError}</p>}

      <div className="flex flex-col gap-1 border-t pt-1.5">
        <Label className="text-xs font-normal">Transformation</Label>
        <select
          aria-label="Transformation kind"
          value={kind}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onKindChange(event.target.value as TransformationKind)
          }
          className={CONTROL_CLASS}
        >
          <option value="direct">direct</option>
          <option value="expression">expression</option>
          <option value="constant">constant</option>
        </select>

        {transformationError && <p className="text-xs text-destructive">{transformationError}</p>}

        {kind === "expression" && (
          <div className="flex flex-col gap-1">
            <Textarea
              aria-label="Expression"
              aria-invalid={Boolean(expressionError)}
              // Plain text only — never parsed/evaluated in the browser, per the "Druff never
              // executes user code" non-goal. Stored exactly as authored.
              value={mapping.transformation?.expression ?? ""}
              onChange={(event) => onExpressionChange(event.target.value)}
            />
            {expressionError && <p className="text-xs text-destructive">{expressionError}</p>}
          </div>
        )}

        {kind === "constant" && (
          <ConstantValueEditor
            constant={mapping.transformation?.constant ?? null}
            onChange={onConstantChange}
          />
        )}
      </div>
    </div>
  );
}

/** The literal types a `constant` transformation may hold, per this ticket's Design "Constant
 * literal breadth" flag — arrays/objects are out of scope here even though `constant: unknown`
 * would permit them; that's a UI-scope decision, not a model change. */
type ConstantType = "string" | "number" | "boolean" | "null";

function constantTypeOf(value: unknown): ConstantType {
  if (value === null) return "null";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

type ConstantValueEditorProps = {
  constant: unknown;
  onChange: (value: unknown) => void;
};

/**
 * The `constant` transformation's sub-editor (DRUFF-9 AC3): a type selector plus a matching value
 * control, so a real `null` constant is explicit and distinguishable from "not provided" (a
 * `direct` mapping, which carries no transformation at all). The value input's text is coerced to
 * the selected type (`Number`, a true/false toggle, or the raw string) — data coercion only, never
 * evaluation, per the "Druff never executes user code" non-goal.
 */
function ConstantValueEditor({ constant, onChange }: ConstantValueEditorProps) {
  const constantType = constantTypeOf(constant);

  function handleTypeChange(nextType: ConstantType): void {
    if (nextType === "null") onChange(null);
    else if (nextType === "boolean") onChange(false);
    else if (nextType === "number") onChange(0);
    else onChange("");
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Constant type"
        value={constantType}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          handleTypeChange(event.target.value as ConstantType)
        }
        className={CONTROL_CLASS}
      >
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="null">null</option>
      </select>

      {constantType === "string" && (
        <input
          aria-label="Constant value"
          value={typeof constant === "string" ? constant : ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          className={CONTROL_CLASS}
        />
      )}

      {constantType === "number" && (
        <input
          aria-label="Constant value"
          type="number"
          value={typeof constant === "number" ? constant : 0}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const parsed = Number(event.target.value);
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
          className={CONTROL_CLASS}
        />
      )}

      {constantType === "boolean" && (
        <select
          aria-label="Constant value"
          value={String(constant === true)}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onChange(event.target.value === "true")
          }
          className={CONTROL_CLASS}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      )}

      {constantType === "null" && <p className="text-xs text-muted-foreground">null</p>}
    </div>
  );
}
