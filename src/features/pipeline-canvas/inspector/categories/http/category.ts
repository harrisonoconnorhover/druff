import { HttpRequestConfigEditor } from "@/features/pipeline-canvas/inspector/categories/http/HttpRequestConfigEditor";
import type { ConfigCategory } from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * Registration for the HTTP/API settings category (DRUFF-12) at the DRUFF-11 config-category seam
 * — the one entry this ticket appends to `CONFIG_CATEGORIES` (`configCategories.ts`).
 *
 * `matches`: a `source`-kind node that carries **no** `connectorId` at all — not merely "no
 * *registered*" connector. A pre-made connector node (e.g. Greenhouse, DRUFF-6) is also
 * `kind === "source"` and already renders its own descriptor form via `CONNECTOR_CONFIG_CATEGORY`;
 * excluding *any* `connectorId` (even one that fails to resolve, e.g. stale/unknown) keeps that
 * node's fallback exactly what it was before this category existed — the generic key/value editor
 * — rather than swapping it for the raw HTTP form. This is DRUFF-11's own "Precedence between the
 * connector category and DRUFF-12's HTTP category" flag, which calls for excluding "nodes that
 * already carry a connectorId" (not "an unresolvable one"). A future dedicated custom-API-connector
 * *kind* would extend this predicate; the current node model has no such kind yet (also flagged in
 * this ticket's Design), so `source` is the closest fit.
 */
export const HTTP_REQUEST_CONFIG_CATEGORY: ConfigCategory = {
  id: "http-request",
  label: "HTTP / API settings",
  matches: (node) => node.data.kind === "source" && node.data.connectorId == null,
  Editor: HttpRequestConfigEditor,
};
