"use client";

import { useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  configToEntries,
  entriesToConfig,
  type ConfigEntry,
} from "@/features/pipeline-canvas/inspector/nodeConfig";

export type NodeConfigEditorProps = {
  /** The node's current config; `undefined` renders as an empty row list. */
  config: Record<string, unknown> | undefined;
  /** Called with the recomputed config on every row edit/add/remove — never batched. */
  onChange: (config: Record<string, unknown>) => void;
};

/**
 * The generic key/value config boundary (DRUFF-3's `NodeConfigEditor` seam): add/remove rows, edit
 * a row's key or value. This is deliberately the whole of DRUFF-3's config UI — DRUFF-6 swaps in a
 * descriptor-driven form for a known connector kind at this same prop-seam (`config` in,
 * `onChange` out) without the inspector shell around it changing.
 *
 * Holds one piece of local state — the row list — seeded from `config` on mount. That's UI
 * mechanics, not a second copy of node data: a freshly-added row has a blank key that
 * `entriesToConfig` intentionally drops, so it must survive in *something* other than `config`
 * until the user types a key, or it would vanish after the very first keystroke. Every row change
 * still converts the whole list back to a config object and calls `onChange` immediately, so the
 * store is never behind what's on screen. The caller resets this local state by mounting a fresh
 * instance per node (`key={node.id}` in `NodeInspector`) rather than this component reacting to
 * `config` prop changes itself, so an external change to `config` while the same node stays
 * selected can't be clobbered by a stale local list.
 */
export function NodeConfigEditor({ config, onChange }: NodeConfigEditorProps) {
  const [entries, setEntries] = useState<ConfigEntry[]>(() => configToEntries(config));

  function commit(next: ConfigEntry[]): void {
    setEntries(next);
    onChange(entriesToConfig(next, config ?? {}));
  }

  function updateEntry(index: number, patch: Partial<ConfigEntry>): void {
    commit(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground">No config fields yet.</p>
      )}
      {Object.values(config ?? {}).some((value) => typeof value !== "string") && (
        <p className="text-xs text-muted-foreground">
          Non-text config values are preserved but are not editable here.
        </p>
      )}
      {entries.map((entry, index) => (
        // Index as key: rows have no identity beyond position (key is the very thing being
        // edited, sometimes blank), and rows are only appended/removed, not reordered.
        <div key={index} className="flex items-center gap-1.5">
          <Input
            aria-label="Config key"
            placeholder="key"
            value={entry.key}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateEntry(index, { key: event.target.value })
            }
          />
          <Input
            aria-label="Config value"
            placeholder="value"
            value={entry.value}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateEntry(index, { value: event.target.value })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove field"
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
        Add field
      </Button>
    </div>
  );
}
