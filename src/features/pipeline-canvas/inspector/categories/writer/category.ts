import { WriterConfigEditor } from "@/features/pipeline-canvas/inspector/categories/writer/WriterConfigEditor";
import type { ConfigCategory } from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * Registration for the Write config category (DRUFF-17) at the DRUFF-11 config-category seam — the
 * one entry this ticket appends to `CONFIG_CATEGORIES` (`configCategories.ts`).
 *
 * `matches`: any node whose canvas `kind` is `write` — the write-node analog of DRUFF-13's
 * `kind === "trigger"`. No other registered category's predicate keys off `kind === "write"`
 * (connector/HTTP/custom-code all key off `source`/`transform`), so this category's position in
 * `CONFIG_CATEGORIES` is cosmetic.
 */
export const WRITER_CONFIG_CATEGORY: ConfigCategory = {
  id: "writer",
  label: "Write config",
  matches: (node) => node.data.kind === "write",
  Editor: WriterConfigEditor,
};
