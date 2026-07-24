import {
  configToEntries,
  entriesToConfig,
  type ConfigEntry,
} from "@/features/pipeline-canvas/inspector/nodeConfig";

/**
 * Pure config<->view mapping for the HTTP/API settings category (DRUFF-12), grounded in Dander's
 * `RequestSpec` (`../dander/src/dander/pipeline/request_spec.py`) and the sibling `config.endpoint`
 * key Dander's README documents for a `source` node. Kept free of React and the store so the
 * mapping — the whole of this ticket's AC6 "mapping/edit logic" — is unit-testable without
 * rendering anything, exactly as `nodeConfig.ts` (DRUFF-3) and `validateConnectorConfig.ts`
 * (DRUFF-6) are.
 *
 * `RequestSpec` is inert in Dander (model + serialization only — nothing here or there sends a
 * request, resolves a secret, or renders `body`); this module only reads/writes its shape.
 */

/** Dander's closed `HttpMethod` set (`request_spec.py`'s `HttpMethod` `StrEnum`). */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Ordered, closed set backing the method picker. `GET` (index 0) is Dander's own default — the
 *  sensible choice for a spec that only needs to add headers/params to a simple GET endpoint. */
export const HTTP_METHODS: readonly HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const DEFAULT_METHOD: HttpMethod = "GET";

/**
 * One ordered request-header row. Reuses `nodeConfig.ts`'s generic `ConfigEntry` shape directly —
 * a header is structurally the same "name -> value" row the generic config editor already edits,
 * so its blank-key-drop/duplicate-key-last-wins rules (`entriesToConfig`) apply unchanged here.
 */
export type HeaderEntry = ConfigEntry;

/**
 * The editable view of a source node's HTTP/API settings (this ticket's AC1 shape): request
 * method, base URL / endpoint, an ordered header list, and a body payload. Independent of exactly
 * how `config` happens to nest these on disk (`config.request.*` + sibling `config.endpoint`).
 */
export type HttpRequestView = {
  method: HttpMethod;
  endpoint: string;
  headers: HeaderEntry[];
  /** Opaque string/template — never parsed, evaluated, or rendered as code (AC3). */
  body: string;
};

/**
 * On-disk config keys this category reads/writes. Named constants (not inline string literals) so
 * the exact key spelling is a one-line change if Dander's authoritative source-config key differs
 * from the README's example — see this ticket's Design "Endpoint/base-URL key name" flag.
 */
export const ENDPOINT_CONFIG_KEY = "endpoint";
export const REQUEST_CONFIG_KEY = "request";

/** Narrows `value` to a plain object record (excludes `null`/arrays), the shape `config.request`
 *  and its nested `headers`/`query_params` maps must have to be readable at all. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Narrows `value` to one of Dander's closed `HttpMethod` members; anything else (missing, an
 *  unrecognized string, a non-string) defaults to `GET` at the call site. */
function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === "string" && (HTTP_METHODS as readonly string[]).includes(value);
}

/**
 * Renders a `RequestSpec.body` (a JSON-object template, a raw string template, or absent) as plain
 * textarea text, without ever parsing/evaluating it as code (AC3): pretty-printed JSON for an
 * object/array, verbatim for an already-string body, empty for absent/`null`. Also used by
 * {@link httpRequestToConfig} to detect whether an imported non-string body was left unedited.
 */
function bodyToText(body: unknown): string {
  if (body === undefined || body === null) return "";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    // Pathological input (e.g. a circular structure) can't come from a JSON/YAML-decoded graph in
    // practice, but this keeps the mapping total rather than throwing on a malformed import.
    return String(body);
  }
}

/**
 * Reads a node's HTTP/API settings out of its raw `config` (`config.request` + sibling
 * `config.endpoint`), defaulting every field so a spec-less/pre-DANDER-11 source node (no
 * `request` key at all, a plain GET) still renders a valid, all-defaults view rather than
 * throwing. Never mutates `config`.
 */
export function configToHttpRequest(config: Record<string, unknown> | undefined): HttpRequestView {
  const requestRaw = config?.[REQUEST_CONFIG_KEY];
  const request = isRecord(requestRaw) ? requestRaw : undefined;
  const endpoint = config?.[ENDPOINT_CONFIG_KEY];

  return {
    method: isHttpMethod(request?.method) ? request.method : DEFAULT_METHOD,
    endpoint: typeof endpoint === "string" ? endpoint : "",
    headers: configToEntries(isRecord(request?.headers) ? request.headers : undefined),
    body: bodyToText(request?.body),
  };
}

/**
 * Decides what `config.request.body` should become given the edited textarea text and the
 * *original* body value (before this edit). An imported non-string body (a JSON-object/array
 * template) is preserved **verbatim** — never silently normalized to a string — as long as its
 * displayed text hasn't actually changed; once the user edits it, the authored text is stored as
 * Dander's `body: str` variant. An empty/whitespace-only text means "no body" (`undefined`), so
 * clearing the field drops the key entirely rather than writing `body: ""`.
 */
function resolveBody(text: string, originalBody: unknown): unknown {
  const isUneditedNonStringBody =
    originalBody !== undefined &&
    originalBody !== null &&
    typeof originalBody !== "string" &&
    bodyToText(originalBody) === text;
  if (isUneditedNonStringBody) return originalBody;
  return text.trim() === "" ? undefined : text;
}

/** Whether `body` (the resolved value from {@link resolveBody}) counts as "has a body" for the
 *  fully-default check and for deciding whether to write a `body` key at all. `null` and
 *  `undefined` are both treated as "no body" — Dander's `RequestSpec.body` defaults to `None`, so
 *  an explicit `body: null` and an absent `body` key mean the same thing on load; collapsing both
 *  to "omit the key" keeps this category's own writes consistent regardless of which spelling an
 *  imported graph happened to use. */
function hasMeaningfulBody(body: unknown): boolean {
  return body !== undefined && body !== null;
}

/**
 * Writes an edited {@link HttpRequestView} back onto a **copy** of `existingConfig`, preserving
 * every key this category doesn't own: connector fields, `config.request.query_params` (not yet an
 * editing surface — see this ticket's Design "query_params preserved-but-not-edited" trade-off),
 * and any other config content. Never mutates `existingConfig`.
 *
 * - Header rows go through `entriesToConfig` (blank key dropped, duplicate key last-wins, same as
 *   the generic config editor).
 * - `endpoint` is set when non-blank, cleared (key removed) when blank.
 * - `request` is omitted entirely when it would be fully default — `GET`, no headers, no body, and
 *   no pre-existing `query_params` — matching Dander's own omit-when-absent dump for a spec-less
 *   source node. A previously non-default `request` the user has cleared back to defaults is
 *   dropped, never written as `{}`/`null`.
 */
export function httpRequestToConfig(
  view: HttpRequestView,
  existingConfig: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const nextConfig: Record<string, unknown> = { ...(existingConfig ?? {}) };

  const trimmedEndpoint = view.endpoint.trim();
  if (trimmedEndpoint === "") {
    delete nextConfig[ENDPOINT_CONFIG_KEY];
  } else {
    nextConfig[ENDPOINT_CONFIG_KEY] = trimmedEndpoint;
  }

  const originalRequestRaw = existingConfig?.[REQUEST_CONFIG_KEY];
  const originalRequest = isRecord(originalRequestRaw) ? originalRequestRaw : undefined;

  const headers = entriesToConfig(view.headers);
  const body = resolveBody(view.body, originalRequest?.body);
  const queryParams = isRecord(originalRequest?.query_params)
    ? originalRequest.query_params
    : undefined;

  const hasHeaders = Object.keys(headers).length > 0;
  const hasBody = hasMeaningfulBody(body);
  const hasQueryParams = queryParams !== undefined && Object.keys(queryParams).length > 0;
  const isFullyDefault =
    view.method === DEFAULT_METHOD && !hasHeaders && !hasBody && !hasQueryParams;

  if (isFullyDefault) {
    delete nextConfig[REQUEST_CONFIG_KEY];
    return nextConfig;
  }

  // Spread `originalRequest` first so `query_params` (and any other as-yet-unmodeled RequestSpec
  // key) survives untouched; `method`/`headers`/`body` below are this category's own fields and
  // always overwrite whatever the spread carried for them.
  const nextRequest: Record<string, unknown> = {
    ...(originalRequest ?? {}),
    method: view.method,
    headers,
  };
  if (hasBody) {
    nextRequest.body = body;
  } else {
    delete nextRequest.body;
  }
  nextConfig[REQUEST_CONFIG_KEY] = nextRequest;
  return nextConfig;
}

/**
 * Swaps the header row at `index` with its neighbor in `direction`, clamping at both ends (moving
 * the first row "up" or the last row "down" is a no-op) — mirrors `nodeFields.ts`'s `moveField`,
 * minus the stable-id lookup, since a header row (like a generic config row) has no identity
 * beyond its position.
 */
export function moveHeader(
  headers: HeaderEntry[],
  index: number,
  direction: "up" | "down",
): HeaderEntry[] {
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= headers.length) return headers;

  const next = [...headers];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  return next;
}
