import type { HttpRequestView } from "@/features/pipeline-canvas/inspector/categories/http/httpRequestConfig";

/**
 * A small, client-side **mirror** of Dander's secret/field-reference grammar and credential-shape
 * heuristics (`../dander/src/dander/pipeline/request_spec.py`), used only to drive inline UX
 * (helper text + a "this must be a reference, not a literal" warning) on the HTTP/API settings
 * category (DRUFF-12 AC4). **Dander remains the enforcing authority** at its Pydantic boundary —
 * this module never blocks a save, and is not a re-implementation of Dander's full validator.
 *
 * Kept in sync with `request_spec.py` by hand; if that module's sensitive-name sets or regexes
 * change, mirror the change here too.
 */

/** Header names (lowercase) that must always carry a reference, never a literal (Dander's Rule A,
 *  `SENSITIVE_HEADER_NAMES`). */
export const SENSITIVE_HEADER_NAMES: ReadonlySet<string> = new Set([
  "authorization",
  "proxy-authorization",
  "x-api-key",
  "api-key",
  "x-auth-token",
  "cookie",
  "set-cookie",
]);

const SECRET_MANAGER_RESOURCE_RE = /^projects\/[^/\s]+\/secrets\/[^/\s]+\/versions\/[^/\s]+$/;
const ENV_REFERENCE_RE = /^env:[A-Za-z_][A-Za-z0-9_]*$/;
const SECRET_REFERENCE_RE = /^secret:\S+$/;
const FIELD_REFERENCE_RE = /^field:\S+$/;
const MUSTACHE_FIELD_REFERENCE_RE = /^\{\{\s*[A-Za-z_][A-Za-z0-9_.]*\s*\}\}$/;

const AUTH_SCHEME_PREFIX_RE = /^(bearer|basic|token)\s+\S+/i;
const KNOWN_CREDENTIAL_PREFIXES = ["sk_", "sk-", "AKIA", "ghp_", "xox"] as const;
const HIGH_ENTROPY_CHARSET_RE = /^[A-Za-z0-9+/_=-]{24,}$/;

/**
 * Whether `value` is a recognized secret reference: `secret:<name>`, `env:<VAR_NAME>`, or a Secret
 * Manager resource name (`projects/.../secrets/.../versions/...`) — mirrors
 * `request_spec.is_secret_reference`. Never resolves the reference; a pure shape check.
 */
export function isSecretReference(value: string): boolean {
  return (
    SECRET_REFERENCE_RE.test(value) ||
    ENV_REFERENCE_RE.test(value) ||
    SECRET_MANAGER_RESOURCE_RE.test(value)
  );
}

/**
 * Whether `value` is a recognized field reference: `field:<field_name>` or mustache
 * `{{ <field_name> }}` — mirrors `request_spec.is_field_reference`.
 */
export function isFieldReference(value: string): boolean {
  return FIELD_REFERENCE_RE.test(value) || MUSTACHE_FIELD_REFERENCE_RE.test(value);
}

/** Whether `value` is any recognized reference — secret or field — mirrors `request_spec.is_reference`. */
export function isReference(value: string): boolean {
  return isSecretReference(value) || isFieldReference(value);
}

/** A long, whitespace-free, alnum-mixed base64/hex-ish run: requires both a digit and a letter so
 *  an ordinary long English word doesn't false-positive (mirrors `_is_high_entropy_run`). */
function isHighEntropyRun(value: string): boolean {
  if (!HIGH_ENTROPY_CHARSET_RE.test(value)) return false;
  return /[0-9]/.test(value) && /[a-zA-Z]/.test(value);
}

/**
 * Best-effort heuristic mirroring `request_spec.looks_like_raw_credential`: does `value` have the
 * shape of an inline raw credential literal? Flags an `Authorization`-style scheme prefix
 * (`Bearer`/`Basic`/`Token`), a PEM block, a known credential-key prefix (Stripe `sk_`/`sk-`, AWS
 * `AKIA`, GitHub `ghp_`, Slack `xox*`), or a long whitespace-free base64/hex-ish run mixing letters
 * and digits. A recognized reference is never flagged (checked first), so e.g. a Secret Manager
 * resource name's numeric path segments can't trip the high-entropy check.
 */
export function looksLikeRawCredentialShape(value: string): boolean {
  if (!value || isReference(value)) return false;
  if (AUTH_SCHEME_PREFIX_RE.test(value)) return true;
  if (value.includes("-----BEGIN")) return true;
  if (KNOWN_CREDENTIAL_PREFIXES.some((prefix) => value.startsWith(prefix))) return true;
  return !value.includes(" ") && isHighEntropyRun(value);
}

/** Result of {@link validateHttpRequest}: per-row header errors (Rule A, sensitive name + literal
 *  value — blocking-style, but this module never actually blocks a save) and an optional body
 *  tripwire warning (Rule-B-lite). */
export type HttpRequestValidation = {
  /** Header row index -> message, for a sensitive-named header holding a non-reference literal. */
  headerErrors: Record<number, string>;
  /** Present when the body looks like it contains an inline credential literal. */
  bodyWarning?: string;
};

const SENSITIVE_HEADER_MESSAGE =
  'This is a sensitive header and must be a secret or field reference (e.g. "secret:<name>", ' +
  '"env:<VAR>", "field:<name>"), not a literal value.';
const CREDENTIAL_SHAPED_MESSAGE =
  "This value looks like an inline credential; use a secret or field reference instead of a " +
  "literal value.";
const BODY_CREDENTIAL_WARNING =
  "The body looks like it may contain an inline credential; use a secret or field reference " +
  "instead of a literal value.";

/**
 * Recursively checks every string leaf of a parsed JSON body for a credential-shaped literal —
 * mirrors `request_spec._check_body_leaves`. This is a **static shape read** of already-decoded
 * JSON data for the reference-heuristic only; it never renders, evaluates, or executes the body
 * template (AC3) — the same non-goal `bodyToText`/`httpRequestToConfig` already honor.
 */
function hasCredentialShapedLeaf(node: unknown): boolean {
  if (typeof node === "string") {
    return !isReference(node) && looksLikeRawCredentialShape(node);
  }
  if (Array.isArray(node)) {
    return node.some(hasCredentialShapedLeaf);
  }
  if (node !== null && typeof node === "object") {
    return Object.values(node as Record<string, unknown>).some(hasCredentialShapedLeaf);
  }
  return false;
}

/** Rule-B-lite tripwire for the body field: recurses into a JSON-object/array template's string
 *  leaves when the text parses as JSON, otherwise treats the whole text as one candidate string
 *  (the GraphQL/plain-string-template case `request_spec` also allows for `body`). */
function checkBodyForCredentialShape(body: string): boolean {
  const trimmed = body.trim();
  if (trimmed === "") return false;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return hasCredentialShapedLeaf(parsed);
  } catch {
    return !isReference(trimmed) && looksLikeRawCredentialShape(trimmed);
  }
}

/**
 * Applies a Rule-A mirror (a sensitive-named header whose value is not a recognized reference ->
 * inline error) and a Rule-B-lite tripwire (a credential-shaped literal anywhere -> warning) to an
 * {@link HttpRequestView}, for inline UX only. A blank-key or blank-value header row is skipped
 * (nothing to validate yet); Dander's Pydantic boundary is the actual enforcement point.
 */
export function validateHttpRequest(view: HttpRequestView): HttpRequestValidation {
  const headerErrors: Record<number, string> = {};

  view.headers.forEach((entry, index) => {
    const name = entry.key.trim().toLowerCase();
    const value = entry.value;
    if (name === "" || value.trim() === "") return;
    if (isReference(value)) return;

    if (SENSITIVE_HEADER_NAMES.has(name)) {
      headerErrors[index] = SENSITIVE_HEADER_MESSAGE;
    } else if (looksLikeRawCredentialShape(value)) {
      headerErrors[index] = CREDENTIAL_SHAPED_MESSAGE;
    }
  });

  const bodyWarning = checkBodyForCredentialShape(view.body) ? BODY_CREDENTIAL_WARNING : undefined;

  return { headerErrors, bodyWarning };
}
