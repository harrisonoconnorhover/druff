import {
  WriterConfigSchema,
  type PartitioningGranularity,
  type WriteMode,
} from "@/lib/pipeline-graph";

/**
 * Pure, framework-free domain module for the Write config category (DRUFF-17): the write-mode
 * table, config<->view-model mapping, and per-mode requirement validation. Kept free of React and
 * the store so the mapping/edit logic (this ticket's AC5) is unit-testable without rendering
 * anything — mirrors `triggerConfig.ts` (DRUFF-13) and `httpRequestConfig.ts` (DRUFF-12).
 *
 * Grounded 1:1 in Dander's `WriterConfig`/`DestinationSpec`/`PartitioningSpec`
 * (`../dander/src/dander/pipeline/node_config.py`) and `WriteMode`
 * (`../dander/src/dander/writer/base.py`). Every value here (dataset/table/column names, a cursor
 * field) is an ordinary identifier stored as authored text — never parsed, evaluated, or executed
 * client-side (the "Druff never executes user code" non-goal), and never a secret
 * (`steering/01-security.md`).
 */

/** On-disk key this category reads/writes under a write/target node's `config`
 *  (`TargetNodeConfig.writer` in `node_config.py`) — a plain field on the target's own `config`,
 *  not a `Node`-level sibling the way DRUFF-13's `Trigger` is. */
export const WRITER_CONFIG_KEY = "writer";

/** One entry in the config-driven write-mode table: a Dander `WriteMode` plus which fields it
 *  requires non-empty, per `WriterConfig._check_mode_requirements`. Adding/removing a mode is a
 *  one-row change here, not new branching code. */
export type WriteModeDescriptor = {
  mode: WriteMode;
  label: string;
  help: string;
  /** Whether this mode requires at least one non-blank `business_key` column. */
  requiresBusinessKey: boolean;
  /** Whether this mode requires a non-blank `cursor_field` (only `incremental`). */
  requiresCursor: boolean;
};

/**
 * The config-driven mode table backing the mode selector, mirroring Dander's
 * `_check_mode_requirements` verbatim: `business_key` is required for `scd1`/`scd2`/`incremental`
 * but not `snapshot`/`replace`; `cursor_field` is required only for `incremental`.
 */
export const WRITE_MODES: readonly WriteModeDescriptor[] = [
  {
    mode: "scd1",
    label: "SCD1 (overwrite)",
    help: "Merges by business key, overwriting changed rows in place.",
    requiresBusinessKey: true,
    requiresCursor: false,
  },
  {
    mode: "scd2",
    label: "SCD2 (history)",
    help: "Merges by business key, preserving row history via new versioned records.",
    requiresBusinessKey: true,
    requiresCursor: false,
  },
  {
    mode: "snapshot",
    label: "Snapshot (append history)",
    help: "Appends immutable point-in-time snapshots — no business key needed.",
    requiresBusinessKey: false,
    requiresCursor: false,
  },
  {
    mode: "incremental",
    label: "Incremental",
    help: "Appends/merges rows newer than the watermark column tracked by cursor_field.",
    requiresBusinessKey: true,
    requiresCursor: true,
  },
  {
    mode: "replace",
    label: "Replace",
    help: "Replaces every destination row from the graph result — no business key needed.",
    requiresBusinessKey: false,
    requiresCursor: false,
  },
];

/** Ordered, closed set backing the partitioning-granularity picker; `day` (Dander's own default)
 *  is listed second so the select's default option matches Dander's when partitioning is enabled
 *  with no granularity chosen yet — the select itself still defaults its value to `"day"`. */
export const PARTITIONING_GRANULARITIES: readonly PartitioningGranularity[] = [
  "hour",
  "day",
  "month",
  "year",
];

/**
 * The whole editable view-model for a `WriterConfig`, flat like DRUFF-13's `TriggerFieldValues` —
 * every field lives here together so switching write mode never invents/discards a
 * differently-shaped object; only the active mode's requirements change which fields are
 * validated/required (see {@link validateWriter}), never which fields exist.
 *
 * `partitioningEnabled`/`partitionIngestionTime` are two independent booleans because Dander's
 * `partitioning` is genuinely three-valued: absent (no partitioning), present with `field: null`
 * (BigQuery ingestion-time partitioning — a meaningful null), or present with a named column.
 */
export type WriterView = {
  writeMode: WriteMode;
  project: string;
  dataset: string;
  table: string;
  businessKey: string[];
  cursorField: string;
  partitioningEnabled: boolean;
  partitionIngestionTime: boolean;
  partitionField: string;
  granularity: PartitioningGranularity;
  requirePartitionFilter: boolean;
  clustering: string[];
};

const DEFAULT_VIEW: WriterView = {
  writeMode: "scd1",
  project: "",
  dataset: "",
  table: "",
  businessKey: [],
  cursorField: "",
  partitioningEnabled: false,
  partitionIngestionTime: false,
  partitionField: "",
  granularity: "day",
  requirePartitionFilter: false,
  clustering: [],
};

/**
 * Parses a node's `config.writer` into a {@link WriterView}. Returns the graceful all-defaults
 * view (`writeMode: "scd1"`, empty destination, partitioning disabled) when the key is absent or
 * doesn't parse as a `WriterConfig` — a freshly-dropped write node or a legacy/hand-edited config
 * renders a valid, editable default rather than throwing, the same stance `readTriggerConfig`
 * takes. Never mutates `config`.
 */
export function readWriterConfig(config: Record<string, unknown> | undefined): WriterView {
  const parsed = WriterConfigSchema.safeParse(config?.[WRITER_CONFIG_KEY]);
  if (!parsed.success) {
    return { ...DEFAULT_VIEW };
  }

  const writer = parsed.data;
  const partitioning = writer.partitioning;

  return {
    writeMode: writer.write_mode,
    project: writer.destination.project ?? "",
    dataset: writer.destination.dataset,
    table: writer.destination.table,
    businessKey: writer.destination.business_key,
    cursorField: writer.cursor_field ?? "",
    partitioningEnabled: partitioning !== null,
    partitionIngestionTime: partitioning !== null && partitioning.field === null,
    partitionField: partitioning?.field ?? "",
    granularity: partitioning?.granularity ?? "day",
    requirePartitionFilter: partitioning?.require_partition_filter ?? false,
    clustering: writer.clustering,
  };
}

/** Trims a list of column/identifier entries and drops any that are blank after trimming, keeping
 *  order — the same blank-row convention `entriesToConfig`/`writeTriggerConfig`'s `depends_on`
 *  handling already use. */
function cleanEntries(entries: string[]): string[] {
  return entries.map((entry) => entry.trim()).filter((entry) => entry !== "");
}

/**
 * Writes an edited {@link WriterView} back onto a **copy** of `prevConfig`: every non-`writer` key
 * and every writer key this editor does not understand are preserved untouched. The fields Druff
 * does edit are rebuilt from the view (never a stale merge of another mode's fields), while newer
 * Dander settings such as `max_batch_rows`, `schema_evolution`, and `transport` survive any
 * inspector edit verbatim. `write_mode`/`destination` are always emitted (required); `project`,
 * `business_key`, `cursor_field`, `partitioning`, and `clustering` are omitted when blank/disabled.
 * Never mutates `prevConfig`.
 */
export function writeWriterConfig(
  prevConfig: Record<string, unknown> | undefined,
  view: WriterView,
): Record<string, unknown> {
  const nextConfig: Record<string, unknown> = { ...(prevConfig ?? {}) };
  const previousWriter = isPlainRecord(prevConfig?.[WRITER_CONFIG_KEY])
    ? prevConfig[WRITER_CONFIG_KEY]
    : {};
  const preservedWriterFields = { ...previousWriter };
  for (const editableKey of [
    "write_mode",
    "destination",
    "cursor_field",
    "partitioning",
    "clustering",
  ]) {
    delete preservedWriterFields[editableKey];
  }

  const destination: Record<string, unknown> = {
    dataset: view.dataset.trim(),
    table: view.table.trim(),
  };
  const project = view.project.trim();
  if (project !== "") {
    destination.project = project;
  }
  const businessKey = cleanEntries(view.businessKey);
  if (businessKey.length > 0) {
    destination.business_key = businessKey;
  }

  const writer: Record<string, unknown> = {
    ...preservedWriterFields,
    write_mode: view.writeMode,
    destination,
  };

  const cursorField = view.cursorField.trim();
  if (cursorField !== "") {
    writer.cursor_field = cursorField;
  }

  if (view.partitioningEnabled) {
    writer.partitioning = {
      field: view.partitionIngestionTime ? null : view.partitionField.trim(),
      granularity: view.granularity,
      require_partition_filter: view.requirePartitionFilter,
    };
  }

  const clustering = cleanEntries(view.clustering);
  if (clustering.length > 0) {
    writer.clustering = clustering;
  }

  nextConfig[WRITER_CONFIG_KEY] = writer;
  return nextConfig;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Looks up a mode's descriptor in {@link WRITE_MODES}; falls back to `scd1`'s descriptor for an
 *  unrecognized mode value (defensive — `WriterView.writeMode` is always one of the closed set in
 *  practice since the select only offers these options). */
function descriptorFor(mode: WriteMode): WriteModeDescriptor {
  return WRITE_MODES.find((descriptor) => descriptor.mode === mode) ?? WRITE_MODES[0];
}

const MAX_CLUSTERING_COLUMNS = 4;

/**
 * Required-field validation mirroring Dander's `WriterConfig._check_mode_requirements` and
 * `DestinationSpec`'s `Field(min_length=1)` on `dataset`/`table`, for inline UX only (AC3) — same
 * empty-object-means-valid convention as `validateTrigger`/`validateConnectorConfig`. This is
 * guidance so the form fails loud early; Dander's Pydantic validators remain the enforcing
 * boundary. Messages name the constraint, never echo a stored value (`steering/01-security.md`).
 */
export function validateWriter(view: WriterView): Record<string, string> {
  const errors: Record<string, string> = {};
  const descriptor = descriptorFor(view.writeMode);

  if (view.dataset.trim() === "") {
    errors.dataset = "Dataset is required.";
  }
  if (view.table.trim() === "") {
    errors.table = "Table is required.";
  }
  if (descriptor.requiresBusinessKey && cleanEntries(view.businessKey).length === 0) {
    errors.businessKey = `At least one business key column is required for ${descriptor.label}.`;
  }
  if (descriptor.requiresCursor && view.cursorField.trim() === "") {
    errors.cursorField = "Cursor field is required for incremental writes.";
  }

  const clustering = cleanEntries(view.clustering);
  if (clustering.length > MAX_CLUSTERING_COLUMNS) {
    errors.clustering = `Clustering is limited to ${MAX_CLUSTERING_COLUMNS} columns.`;
  } else if (new Set(clustering).size !== clustering.length) {
    errors.clustering = "Clustering columns must not contain duplicates.";
  }

  return errors;
}

/**
 * Swaps the entry at `index` with its neighbor in `direction`, clamping at both ends — mirrors
 * `httpRequestConfig.ts`'s `moveHeader`, generalized to a plain `string[]` so it backs the reorder
 * control for both `business_key` and `clustering` (both are Dander lists whose column order is
 * semantically meaningful, unlike a header row's key/value pair).
 */
export function moveListItem(items: string[], index: number, direction: "up" | "down"): string[] {
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= items.length) return items;

  const next = [...items];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  return next;
}
