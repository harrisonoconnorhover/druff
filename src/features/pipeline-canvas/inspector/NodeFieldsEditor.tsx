"use client";

import { useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addField,
  fromRows,
  moveField,
  removeField,
  toRows,
  updateField,
  type FieldRow,
} from "@/features/pipeline-canvas/inspector/nodeFields";
import {
  configToEntries,
  entriesToConfig,
  type ConfigEntry,
} from "@/features/pipeline-canvas/inspector/nodeConfig";
import type { NodeField } from "@/lib/pipeline-graph/schema";

export type NodeFieldsEditorProps = {
  /** The node's current declared field schema; `undefined` renders as an empty row list. */
  fields: NodeField[] | undefined;
  /** Called with the recomputed field list on every add/edit/remove/reorder — never batched. */
  onChange: (fields: NodeField[]) => void;
};

/**
 * The "Fields" category of the node inspector (DRUFF-7): add/edit/remove/reorder a node's declared
 * `NodeField[]`. Same prop-seam and local-row-mirror pattern as `NodeConfigEditor` — see that
 * component's doc comment for why a local row list exists at all (a freshly-added blank row must
 * survive until edited) and why the caller remounts this component per node (`key={node.id}`)
 * rather than it reacting to `fields` prop changes itself.
 *
 * Differs from `NodeConfigEditor` in two ways, both because fields have positional identity that
 * config rows don't (see `nodeFields.ts`'s doc comment): rows carry a stable client-only id (so
 * reordering doesn't mis-associate input focus), and a blank-name row is kept rather than dropped.
 */
export function NodeFieldsEditor({ fields, onChange }: NodeFieldsEditorProps) {
  const [rows, setRows] = useState<FieldRow[]>(() => toRows(fields));

  function commit(next: FieldRow[]): void {
    setRows(next);
    onChange(fromRows(next));
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="text-xs text-muted-foreground">No fields yet.</p>}
      {rows.map((row, index) => (
        <FieldRowEditor
          key={row.id}
          row={row}
          isFirst={index === 0}
          isLast={index === rows.length - 1}
          onUpdate={(patch) => commit(updateField(rows, row.id, patch))}
          onRemove={() => commit(removeField(rows, row.id))}
          onMoveUp={() => commit(moveField(rows, row.id, "up"))}
          onMoveDown={() => commit(moveField(rows, row.id, "down"))}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => commit(addField(rows))}>
        <Plus />
        Add field
      </Button>
    </div>
  );
}

type FieldRowEditorProps = {
  row: FieldRow;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<NodeField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

/** One field's edit controls, plus its reorder/remove buttons and metadata-tags sub-editor. */
function FieldRowEditor({
  row,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: FieldRowEditorProps) {
  const { field } = row;

  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-2">
      <div className="flex items-center gap-1.5">
        <Input
          aria-label="Field name"
          placeholder="name"
          value={field.name}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ name: event.target.value })
          }
        />
        <Input
          aria-label="Field type"
          placeholder="STRING"
          value={field.type}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ type: event.target.value })
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move field up"
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Move field down"
          disabled={isLast}
          onClick={onMoveDown}
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove field"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <Input
        aria-label="Field description"
        placeholder="description (optional)"
        value={field.description ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          // Written as `null`, never `""`, when cleared — Dander/Zod model `description` as
          // `string | null`, and an empty string would round-trip as a different value than a
          // hand-authored `description: null` (see this ticket's Design "Flagged" note).
          onUpdate({ description: event.target.value === "" ? null : event.target.value })
        }
      />

      <Label className="text-xs font-normal">
        <Checkbox
          aria-label="Nullable"
          // A missing/legacy `nullable` (e.g. a field imported without the key) defensively reads
          // as `true`, matching Dander's own default, rather than as unchecked.
          checked={field.nullable ?? true}
          onCheckedChange={(checked) => onUpdate({ nullable: checked === true })}
        />
        Nullable
      </Label>

      <FieldMetadataEditor
        metadata={field.metadata}
        onChange={(metadata) => onUpdate({ metadata })}
      />
    </div>
  );
}

type FieldMetadataEditorProps = {
  metadata: Record<string, unknown> | undefined;
  onChange: (metadata: Record<string, unknown>) => void;
};

/**
 * A field's `metadata` sub-editor: key/value **tag** pairs only, reusing `nodeConfig.ts`'s already-
 * tested `configToEntries`/`entriesToConfig` mapping rather than a second copy (a tag bag is
 * exactly a `Record<string, string>` ⇄ rows mapping). Framed throughout as labels/tags, never a
 * place to store a real field value or sample data (AC4, `steering/01-security.md`) — this is
 * guidance/framing, not a runtime scanner; Druff never executes or inspects the tag values.
 *
 * Holds one piece of local state — the row list — seeded from `metadata` on mount, for the exact
 * same reason `NodeConfigEditor` does (see that component's doc comment): a freshly-added row has
 * a blank key that `entriesToConfig` intentionally drops, so it must survive in *something* other
 * than `metadata` until the user types a key, or it would vanish after the very first render.
 * `FieldRowEditor` (the parent) is keyed by the field's stable `row.id`, so this local state
 * persists correctly across edits of the same field and resets when the row identity changes — no
 * additional `key` plumbing needed here.
 */
function FieldMetadataEditor({ metadata, onChange }: FieldMetadataEditorProps) {
  const [entries, setEntries] = useState<ConfigEntry[]>(() => configToEntries(metadata));

  function commit(next: ConfigEntry[]): void {
    setEntries(next);
    onChange(entriesToConfig(next, metadata ?? {}));
  }

  return (
    <div className="flex flex-col gap-1 border-t pt-1.5">
      <p className="text-xs font-medium text-muted-foreground">Metadata tags</p>
      <p className="text-xs text-muted-foreground">
        Tags/labels only — never a real field value or sample data.
      </p>
      {Object.values(metadata ?? {}).some((value) => typeof value !== "string") && (
        <p className="text-xs text-muted-foreground">
          Non-text metadata is preserved but is not editable here.
        </p>
      )}
      {entries.map((entry, index) => (
        // Index as key: same rationale as `NodeConfigEditor` — tag rows have no identity beyond
        // position and are only appended/removed, not reordered.
        <div key={index} className="flex items-center gap-1.5">
          <Input
            aria-label="Metadata tag key"
            placeholder="e.g. sensitivity"
            value={entry.key}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              commit(entries.map((e, i) => (i === index ? { ...e, key: event.target.value } : e)))
            }
          />
          <Input
            aria-label="Metadata tag value"
            placeholder="pii"
            value={entry.value}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              commit(entries.map((e, i) => (i === index ? { ...e, value: event.target.value } : e)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove metadata tag"
            onClick={() => commit(entries.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => commit([...entries, { key: "", value: "" }])}
      >
        <Plus />
        Add tag
      </Button>
    </div>
  );
}
