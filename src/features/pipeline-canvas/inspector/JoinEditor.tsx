"use client";

import type { ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  JOIN_TYPES,
  addKeyPair,
  createJoinSpec,
  moveKeyPair,
  removeKeyPair,
  setJoinType,
  updateKeyPair,
  validateJoinSpec,
} from "@/features/pipeline-canvas/inspector/joinSpec";
import type { JoinKeyPair, JoinSpec, JoinType, NodeField } from "@/lib/pipeline-graph/schema";

/** Shared native-control styling, matching `MappingRow`'s `CONTROL_CLASS` — a plain `<select>`
 * rather than a shadcn/Radix wrapper, same "native `<select>` fallback" trade-off this ticket's
 * Design calls out (Radix `Select` is portal-based and unreliable under jsdom/RTL; AC6 only
 * requires the *logic* be unit-tested, not pointer/drag interaction). */
const CONTROL_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80";

/** Props for {@link JoinEditor}. */
export type JoinEditorProps = {
  /** The edge's current join, or `undefined` for a join-less edge. */
  join: JoinSpec | undefined;
  /** The source/`from` node's declared fields (DRUFF-7) — the vocabulary the `left` pickers resolve
   * against, per Dander's left=from orientation. */
  leftFields: NodeField[];
  /** The target/`to` node's declared fields (DRUFF-7) — the vocabulary the `right` pickers resolve
   * against, per Dander's right=to orientation. */
  rightFields: NodeField[];
  /** Called with the next `JoinSpec` on every edit, or `undefined` to remove the join entirely
   * (Dander omits `join`, not `null`, for a join-less edge). */
  onChange: (join: JoinSpec | undefined) => void;
};

/**
 * The edge inspector's "Join" category (DRUFF-10): the authoring UI over the selected edge's
 * optional `JoinSpec`. A pure projection of its props, not a copy of them — every edit recomputes
 * the whole spec via `joinSpec.ts`'s pure operations and calls `onChange` straight away, so this
 * component holds **no** local `useState` mirror of the join and can never drift from the store
 * (mirrors `EdgeMappingsEditor`'s no-local-mirror rule).
 *
 * Enforces DRUFF-10 AC4's "a join with zero pairs cannot be saved as a defined join" by
 * construction rather than by blocking a save: `createJoinSpec` seeds one blank pair, and the
 * remove control on a defined join's sole remaining pair is disabled here (not in `joinSpec.ts`,
 * whose `removeKeyPair` is intentionally total) — see this ticket's Design.
 */
export function JoinEditor({ join, leftFields, rightFields, onChange }: JoinEditorProps) {
  if (!join) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(createJoinSpec())}>
        <Plus />
        Add join
      </Button>
    );
  }

  const validation = validateJoinSpec(join);
  const disableRemovePair = join.keys.length <= 1;

  function commit(next: JoinSpec): void {
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-xs font-normal">Type</Label>
        <select
          aria-label="Join type"
          value={join.type}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            commit(setJoinType(join, event.target.value as JoinType))
          }
          className={CONTROL_CLASS}
        >
          {JOIN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {!validation.ok && validation.message && (
        <p className="text-xs text-destructive">{validation.message}</p>
      )}

      <div className="flex flex-col gap-1.5">
        {join.keys.map((pair, index) => (
          <JoinKeyRow
            key={index}
            pair={pair}
            leftFields={leftFields}
            rightFields={rightFields}
            errors={validation.keyErrors[index]}
            isFirst={index === 0}
            isLast={index === join.keys.length - 1}
            disableRemove={disableRemovePair}
            onLeftChange={(left) => commit(updateKeyPair(join, index, { left }))}
            onRightChange={(right) => commit(updateKeyPair(join, index, { right }))}
            onRemove={() => commit(removeKeyPair(join, index))}
            onMove={(direction) =>
              commit(moveKeyPair(join, index, direction === "up" ? index - 1 : index + 1))
            }
          />
        ))}
      </div>

      {disableRemovePair && (
        <p className="text-xs text-muted-foreground">
          A join needs at least one key pair — use &quot;Remove join&quot; to make this connection
          join-less.
        </p>
      )}

      <div className="flex gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => commit(addKeyPair(join))}>
          <Plus />
          Add key pair
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(undefined)}>
          <Trash2 />
          Remove join
        </Button>
      </div>
    </div>
  );
}

/** One `field` picker's option list: every declared field, plus the currently-selected value if
 * it names a field outside that vocabulary — an imported graph, or a field not yet declared on the
 * node (DRUFF-7) — so a stored value is always rendered rather than silently dropped/reset (this
 * ticket's Design "preserve out-of-vocabulary values"). */
function fieldOptions(fields: NodeField[], selected: string): { value: string; label: string }[] {
  const options = fields.map((field) => ({ value: field.name, label: field.name }));
  if (selected !== "" && !fields.some((field) => field.name === selected)) {
    options.push({ value: selected, label: `${selected} (not a declared field)` });
  }
  return options;
}

type JoinKeyRowProps = {
  pair: JoinKeyPair;
  leftFields: NodeField[];
  rightFields: NodeField[];
  errors: { left?: string; right?: string } | undefined;
  isFirst: boolean;
  isLast: boolean;
  disableRemove: boolean;
  onLeftChange: (left: string) => void;
  onRightChange: (right: string) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
};

/** One `JoinKeyPair`'s edit controls: a `left` field select (source/`from` node vocabulary), a
 * `right` field select (target/`to` node vocabulary), reorder up/down, and a remove button —
 * mirrors `MappingRow`'s per-row shape for the sibling "Mappings" category. Not exported: this
 * ticket's Design lists no separate row-component file, so it stays an internal helper of
 * `JoinEditor` (the same "internal sub-editor" pattern `MappingRow.tsx`'s own
 * `ConstantValueEditor` uses). */
function JoinKeyRow({
  pair,
  leftFields,
  rightFields,
  errors,
  isFirst,
  isLast,
  disableRemove,
  onLeftChange,
  onRightChange,
  onRemove,
  onMove,
}: JoinKeyRowProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border p-2">
      <div className="flex items-end gap-1.5">
        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs font-normal">Left (from)</Label>
          <select
            aria-label="Left field"
            aria-invalid={Boolean(errors?.left)}
            value={pair.left}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onLeftChange(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="" disabled>
              Select a field
            </option>
            {fieldOptions(leftFields, pair.left).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {leftFields.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Declare fields on the source node first.
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs font-normal">Right (to)</Label>
          <select
            aria-label="Right field"
            aria-invalid={Boolean(errors?.right)}
            value={pair.right}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onRightChange(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="" disabled>
              Select a field
            </option>
            {fieldOptions(rightFields, pair.right).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {rightFields.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Declare fields on the target node first.
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move key pair up"
          disabled={isFirst}
          onClick={() => onMove("up")}
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move key pair down"
          disabled={isLast}
          onClick={() => onMove("down")}
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove key pair"
          disabled={disableRemove}
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {errors?.left && <p className="text-xs text-destructive">{errors.left}</p>}
      {errors?.right && <p className="text-xs text-destructive">{errors.right}</p>}
    </div>
  );
}
