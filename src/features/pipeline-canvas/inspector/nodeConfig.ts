/**
 * Pure mapping between a node's `config` record (the shape stored on `PipelineNodeData` and
 * written back through the graph store) and the ordered rows the generic `NodeConfigEditor`
 * renders/edits. Kept free of React and the store so the non-trivial parts — blank-key dropping
 * and duplicate-key resolution — are unit-testable without rendering anything (DRUFF-3 AC5).
 */
export type ConfigEntry = {
  key: string;
  value: string;
};

/**
 * Expands a node's `config` into editable rows, one per own-enumerable entry, in the object's own
 * key order. `undefined` (a node with no config yet) yields no rows rather than throwing, since
 * `config` is optional on `PipelineNodeData`.
 */
export function configToEntries(config: Record<string, unknown> | undefined): ConfigEntry[] {
  return Object.entries(config ?? {}).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : String(value),
  }));
}

/**
 * Collapses edited rows back into a `config` record. Rows whose key is blank (empty or
 * whitespace-only) are dropped — a row the user has added but not yet named isn't a real config
 * entry. When two rows share a (trimmed) key, the **last** row wins, matching plain-object
 * assignment semantics (`config[key] = value` in row order) and giving a deterministic result
 * rather than throwing or silently picking the first. Surviving keys keep the object-key order of
 * their first occurrence, so editing a row's value (or renaming it to a still-unique key) doesn't
 * reshuffle the resulting entries on the next round trip through `configToEntries`.
 */
export function entriesToConfig(entries: ConfigEntry[]): Record<string, string> {
  const config: Record<string, string> = {};
  for (const { key, value } of entries) {
    const trimmedKey = key.trim();
    if (trimmedKey === "") continue;
    config[trimmedKey] = value;
  }
  return config;
}
