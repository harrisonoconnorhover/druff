import type { NodeField, PipelineEdge, PipelineNode } from "@/lib/pipeline-graph/schema";

/**
 * The four draggable node kinds the palette (DRUFF-2) and `PipelineNode` (canvas rendering) both
 * understand. Canonical definition lives here (the leaf `lib/pipeline-graph` contract layer) per
 * this ticket's Design, rather than in the canvas feature, so the converter and the feature share
 * one source of truth without the feature owning a type the data-layer also depends on.
 */
export type PipelineNodeKind = "source" | "transform" | "write" | "trigger";

/**
 * The React Flow node-data contract for every pipeline node kind: a lossless superset of Dander's
 * on-disk graph-node shape (`name`/`type`/`config`/`fields`) plus `kind`, the one field that is
 * pure UI/derived state and is **never** written back to the graph — see `canvas-convert.ts`.
 *
 * `config`/`fields` stay optional (rather than defaulting to `{}`/`[]` here) so an
 * as-yet-unconfigured node (freshly dropped from the palette, or a pre-DRUFF-4 seed/fixture) stays
 * a valid value without every call site needing to supply empty placeholders.
 */
export type PipelineNodeData = {
  /** Human label; maps 1:1 to the graph node's `name`. */
  name: string;
  /** Authoritative free-form Dander type token (e.g. `source`/`target`); maps 1:1 to the graph
   * node's `type`. Not the same thing as `kind` — see `TYPE_TO_KIND`. */
  type: string;
  /** UI-only visual grouping (which palette icon/accent to render). Derived from `type` via
   * `kindForType` on import; never written to the graph. */
  kind: PipelineNodeKind;
  /**
   * UI-only pre-made-connector identity (DRUFF-6), e.g. `"greenhouse"` — a registry key
   * (`@/features/connector-library`), not a Dander concept. When set, the node is rendered/edited
   * via that connector's descriptor (icon/name on the canvas, a descriptor-driven form in the
   * inspector) instead of the generic kind styling/config editor. Never written to the graph
   * directly: on save, `canvas-convert.ts` maps it to Dander's node `type` (`danderType`); on load,
   * it's re-derived from `type` plus `config.connector`. Absent for a non-connector node.
   */
  connectorId?: string;
  /** Kind-specific config, edited via the inspector's `NodeConfigEditor` (DRUFF-3) / a connector
   * form (DRUFF-6). Maps 1:1 to the graph node's `config`. */
  config?: Record<string, unknown>;
  /** Declared field schema. Maps 1:1 to the graph node's `fields`. */
  fields?: NodeField[];
  /** Complete Dander node loaded at the graph boundary. Save patches editor-owned fields onto
   * this model so triggers, cursors, visuals, and future supported properties are not rebuilt or
   * silently discarded. Not displayed directly. */
  canonical?: PipelineNode;
  /** Canvas position at the last canonical load/save, used to distinguish an untouched fallback
   * layout from a user-authored movement that should create/update `visual.position`. */
  loadedPosition?: { x: number; y: number };
};

/**
 * A legacy/local-draft position sidecar, keyed by node id. Canonical Dander graphs now store
 * positions in `Node.visual.position`; this remains only for old local drafts and one-way manifest
 * previews that do not have canonical graph visuals.
 */
export type GraphLayout = Record<string, { x: number; y: number }>;

/**
 * React Flow edge-`data` contract: the subset the DRUFF-4 converters round-trip to/from a Dander
 * graph edge (`mappings`/`join`/`metadata`). All optional so a bare/seed edge with no data (e.g.
 * `SEED_GRAPH`'s placeholder edges) stays a valid value with no placeholder fields required.
 * Promoted here (rather than left as `canvas-convert.ts`'s private `CanvasEdgeData`) so the store
 * (`graph-store.ts`) and the inspector (DRUFF-8) share the same typed shape the converter already
 * round-trips, instead of both reaching into `unknown`/a locally-duplicated type.
 */
export type PipelineEdgeData = {
  /** Field-to-field lineage mappings (DRUFF-9 fills these in via the inspector). */
  mappings?: PipelineEdge["mappings"];
  /** Optional join specification combining two upstream sources (DRUFF-10 fills this in). */
  join?: PipelineEdge["join"];
  /** Free-form tag/label bag, mirrored from the graph edge's `metadata`. */
  metadata?: PipelineEdge["metadata"];
};

/**
 * Config-driven mapping from Dander's free-form `node.type` token to the canvas's closed `kind`
 * grouping (`steering/02-engineering.md`: config-driven over code-driven — one table to extend
 * rather than branching code). The exact token set is a product decision still being pressured by
 * DRUFF-6 (connectors); flagged in this ticket's Design rather than over-built here. `"target"` is
 * mapped to the UI's `"write"` kind per Dander's own example (`crm_to_warehouse_example` uses
 * `source`/`target`), since Dander has no `"write"` token of its own.
 */
export const TYPE_TO_KIND: Record<string, PipelineNodeKind> = {
  source: "source",
  transform: "transform",
  target: "write",
  trigger: "trigger",
};

/**
 * Fallback `kind` for a `type` token absent from `TYPE_TO_KIND` (e.g. an unrecognized custom
 * connector type) — keeps `graphToCanvas` total (never throws on an unknown token) rather than the
 * import failing outright over a cosmetic grouping.
 */
export const DEFAULT_NODE_KIND: PipelineNodeKind = "transform";

/** Derives a node's canvas `kind` from its graph `type`, per `TYPE_TO_KIND`, falling back to
 * `DEFAULT_NODE_KIND` for an unrecognized token. */
export function kindForType(type: string): PipelineNodeKind {
  return TYPE_TO_KIND[type] ?? DEFAULT_NODE_KIND;
}

/**
 * Inverse of `TYPE_TO_KIND`: the default `type` token a freshly-created node of a given `kind`
 * (dropped from the palette, DRUFF-2) is seeded with. Derived from the same table — rather than a
 * second, hand-maintained reverse map — so the pairing can't drift out of sync with `kindForType`.
 * Falls back to the kind string itself if no table entry maps to it.
 */
export function defaultTypeForKind(kind: PipelineNodeKind): string {
  const entry = Object.entries(TYPE_TO_KIND).find(([, mappedKind]) => mappedKind === kind);
  return entry ? entry[0] : kind;
}
