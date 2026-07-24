"use client";

import { useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  moveListItem,
  readWriterConfig,
  validateWriter,
  writeWriterConfig,
  PARTITIONING_GRANULARITIES,
  WRITE_MODES,
  type WriterView,
} from "@/features/pipeline-canvas/inspector/categories/writer/writerConfig";
import type { ConfigCategoryEditorProps } from "@/features/pipeline-canvas/inspector/configCategories";
import type { PartitioningGranularity, WriteMode } from "@/lib/pipeline-graph";

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

/**
 * The Write config category editor (DRUFF-17): write mode, destination (project/dataset/table +
 * ordered business-key columns), cursor field, partitioning, and ordered clustering columns —
 * grounded 1:1 in Dander's `WriterConfig` (see `writerConfig.ts`). Bound to the DRUFF-11
 * config-category seam (`config`-bearing `node` in, `onConfigChange(config)` out).
 *
 * Holds the whole {@link WriterView} as local state seeded from `readWriterConfig` on mount — same
 * rationale as `TriggerConfigEditor`/`HttpRequestConfigEditor`: a half-typed dataset name or a
 * freshly-added, still-blank `business_key`/clustering row must survive between keystrokes, and
 * inline validation (`validateWriter`) needs to see the in-progress edit, not only the last value
 * that made it back through `onConfigChange`. `NodeInspector` mounts a fresh instance per node
 * (`key={node.id}`), so selection changes reset this local state automatically.
 *
 * Every edit recomputes the full config via `writeWriterConfig(node.data.config, next)` and calls
 * `onConfigChange` immediately, so the store never lags what's on screen and the merge is always
 * against the *live* `config` prop (preserving sibling keys the way `httpRequestToConfig` does).
 */
export function WriterConfigEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const [view, setView] = useState<WriterView>(() => readWriterConfig(node.data.config));
  const errors = validateWriter(view);
  const descriptor = WRITE_MODES.find((mode) => mode.mode === view.writeMode) ?? WRITE_MODES[0];

  function commit(next: WriterView): void {
    setView(next);
    onConfigChange(writeWriterConfig(node.data.config, next));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-write-mode">Write mode</Label>
        <select
          id="writer-write-mode"
          value={view.writeMode}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            commit({ ...view, writeMode: event.target.value as WriteMode })
          }
          className={selectClassName}
        >
          {WRITE_MODES.map((mode) => (
            <option key={mode.mode} value={mode.mode}>
              {mode.label}
            </option>
          ))}
        </select>
        {descriptor.help && <p className="text-xs text-muted-foreground">{descriptor.help}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-project">Project</Label>
        <Input
          id="writer-project"
          placeholder="my-gcp-project"
          value={view.project}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            commit({ ...view, project: event.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-dataset">Dataset *</Label>
        <Input
          id="writer-dataset"
          placeholder="analytics"
          aria-invalid={Boolean(errors.dataset)}
          value={view.dataset}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            commit({ ...view, dataset: event.target.value })
          }
        />
        {errors.dataset && <p className="text-xs text-destructive">{errors.dataset}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-table">Table *</Label>
        <Input
          id="writer-table"
          placeholder="dim_customer"
          aria-invalid={Boolean(errors.table)}
          value={view.table}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            commit({ ...view, table: event.target.value })
          }
        />
        {errors.table && <p className="text-xs text-destructive">{errors.table}</p>}
      </div>

      <ColumnListField
        label="Business key"
        required={descriptor.requiresBusinessKey}
        addLabel="Add business key column"
        rowAriaLabel="Business key column"
        items={view.businessKey}
        error={errors.businessKey}
        onChange={(businessKey) => commit({ ...view, businessKey })}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-cursor-field">Cursor field{descriptor.requiresCursor && " *"}</Label>
        <Input
          id="writer-cursor-field"
          placeholder="updated_at"
          aria-invalid={Boolean(errors.cursorField)}
          value={view.cursorField}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            commit({ ...view, cursorField: event.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Watermark/cursor column, required for incremental writes.
        </p>
        {errors.cursorField && <p className="text-xs text-destructive">{errors.cursorField}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="writer-partitioning-enabled"
            checked={view.partitioningEnabled}
            onCheckedChange={(checked) =>
              commit({ ...view, partitioningEnabled: checked === true })
            }
          />
          <Label htmlFor="writer-partitioning-enabled">Enable partitioning</Label>
        </div>

        {view.partitioningEnabled && (
          <div className="flex flex-col gap-3 pl-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="writer-partition-ingestion-time"
                checked={view.partitionIngestionTime}
                onCheckedChange={(checked) =>
                  commit({ ...view, partitionIngestionTime: checked === true })
                }
              />
              <Label htmlFor="writer-partition-ingestion-time">
                Use BigQuery ingestion-time partitioning
              </Label>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="writer-partition-field">Partition field</Label>
              <Input
                id="writer-partition-field"
                placeholder="created_at"
                disabled={view.partitionIngestionTime}
                value={view.partitionField}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  commit({ ...view, partitionField: event.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="writer-granularity">Granularity</Label>
              <select
                id="writer-granularity"
                value={view.granularity}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  commit({
                    ...view,
                    granularity: event.target.value as PartitioningGranularity,
                  })
                }
                className={selectClassName}
              >
                {PARTITIONING_GRANULARITIES.map((granularity) => (
                  <option key={granularity} value={granularity}>
                    {granularity}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="writer-require-partition-filter"
                checked={view.requirePartitionFilter}
                onCheckedChange={(checked) =>
                  commit({ ...view, requirePartitionFilter: checked === true })
                }
              />
              <Label htmlFor="writer-require-partition-filter">Require partition filter</Label>
            </div>
          </div>
        )}
      </div>

      <ColumnListField
        label="Clustering"
        addLabel="Add clustering column"
        rowAriaLabel="Clustering column"
        items={view.clustering}
        error={errors.clustering}
        onChange={(clustering) => commit({ ...view, clustering })}
      />
    </div>
  );
}

type ColumnListFieldProps = {
  label: string;
  required?: boolean;
  addLabel: string;
  rowAriaLabel: string;
  items: string[];
  error?: string;
  onChange: (items: string[]) => void;
};

/** An ordered add/edit/remove/reorder list of column-name rows, backing both `business_key` and
 *  `clustering` (both are Dander lists whose order is semantically meaningful) — reuses the row
 *  pattern already established by `TriggerConfigEditor`'s `depends_on` list and
 *  `HttpRequestConfigEditor`'s header reorder buttons, via the shared {@link moveListItem} helper. */
function ColumnListField({
  label,
  required,
  addLabel,
  rowAriaLabel,
  items,
  error,
  onChange,
}: ColumnListFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && " *"}
      </Label>
      {items.length === 0 && <p className="text-xs text-muted-foreground">None yet.</p>}
      {items.map((item, index) => (
        // Index as key: same rationale as `HttpRequestConfigEditor`'s header rows — no identity
        // beyond position, reordering is an explicit move, not a drag.
        <div key={index} className="flex items-center gap-1.5">
          <Input
            aria-label={`${rowAriaLabel} ${index + 1}`}
            value={item}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(items.map((existing, i) => (i === index ? event.target.value : existing)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${rowAriaLabel.toLowerCase()} up`}
            disabled={index === 0}
            onClick={() => onChange(moveListItem(items, index, "up"))}
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${rowAriaLabel.toLowerCase()} down`}
            disabled={index === items.length - 1}
            onClick={() => onChange(moveListItem(items, index, "down"))}
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${rowAriaLabel.toLowerCase()}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus />
        {addLabel}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
