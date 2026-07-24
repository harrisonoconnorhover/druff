import { describe, expect, it } from "vitest";
import {
  isFieldReference,
  isReference,
  isSecretReference,
  looksLikeRawCredentialShape,
  validateHttpRequest,
  SENSITIVE_HEADER_NAMES,
} from "@/features/pipeline-canvas/inspector/categories/http/httpRequestReferences";
import type { HttpRequestView } from "@/features/pipeline-canvas/inspector/categories/http/httpRequestConfig";

// All tokens below are synthetic (`secret:demo_key`, `field:candidate_id`, a fabricated `Bearer`
// value, etc.) — no real/sensitive values, per steering/02-engineering.md.

describe("isSecretReference / isFieldReference / isReference (truth table)", () => {
  it.each([
    ["secret:demo_key", true],
    ["env:DEMO_TOKEN", true],
    ["projects/my-project/secrets/demo-key/versions/1", true],
    ["field:updated_since", false],
    ["application/json", false],
    ["", false],
  ])("isSecretReference(%s) === %s", (value, expected) => {
    expect(isSecretReference(value)).toBe(expected);
  });

  it.each([
    ["field:updated_since", true],
    ["{{ candidate_id }}", true],
    ["{{candidate_id}}", true],
    ["secret:demo_key", false],
    ["application/json", false],
  ])("isFieldReference(%s) === %s", (value, expected) => {
    expect(isFieldReference(value)).toBe(expected);
  });

  it.each([
    ["secret:demo_key", true],
    ["field:updated_since", true],
    ["application/json", false],
    ["Bearer fake_demo_token_123", false],
  ])("isReference(%s) === %s", (value, expected) => {
    expect(isReference(value)).toBe(expected);
  });

  it("does not recognize an env reference with an invalid variable name", () => {
    expect(isSecretReference("env:not a valid var")).toBe(false);
  });

  it("does not recognize a malformed Secret Manager resource name", () => {
    expect(isSecretReference("projects//secrets/x/versions/1")).toBe(false);
  });
});

describe("looksLikeRawCredentialShape", () => {
  it("never flags a recognized reference", () => {
    expect(looksLikeRawCredentialShape("secret:demo_key")).toBe(false);
    expect(looksLikeRawCredentialShape("field:updated_since")).toBe(false);
  });

  it("flags an Authorization-style scheme prefix", () => {
    expect(looksLikeRawCredentialShape("Bearer fake_demo_token_123")).toBe(true);
    expect(looksLikeRawCredentialShape("Basic ZmFrZTpjcmVkZW50aWFs")).toBe(true);
  });

  it("flags a PEM block", () => {
    expect(looksLikeRawCredentialShape("-----BEGIN PRIVATE KEY-----")).toBe(true);
  });

  it.each([
    "sk_fake1234567890",
    "sk-fake1234567890",
    "AKIAFAKEEXAMPLE123",
    "ghp_fake1234567890abcd",
    "xoxb-fake-token-123",
  ])("flags a known credential-key prefix (%s)", (value) => {
    expect(looksLikeRawCredentialShape(value)).toBe(true);
  });

  it("flags a long whitespace-free base64/hex-ish run mixing letters and digits", () => {
    expect(looksLikeRawCredentialShape("aZ9bY8cX7dW6eV5fU4gT3hS2iR1jQ0kP")).toBe(true);
  });

  it("does not flag an ordinary benign literal", () => {
    expect(looksLikeRawCredentialShape("application/json")).toBe(false);
    expect(looksLikeRawCredentialShape("since")).toBe(false);
  });

  it("does not flag a long, all-alpha word (no digit mixed in)", () => {
    expect(looksLikeRawCredentialShape("abcdefghijklmnopqrstuvwxyzabcdef")).toBe(false);
  });

  it("does not flag a run containing whitespace", () => {
    expect(looksLikeRawCredentialShape("this is definitely not a credential value at all")).toBe(
      false,
    );
  });

  it("returns false for an empty string", () => {
    expect(looksLikeRawCredentialShape("")).toBe(false);
  });
});

function view(overrides: Partial<HttpRequestView> = {}): HttpRequestView {
  return { method: "GET", endpoint: "", headers: [], body: "", ...overrides };
}

describe("validateHttpRequest", () => {
  it("has no header errors and no body warning for an empty view", () => {
    const result = validateHttpRequest(view());
    expect(result.headerErrors).toEqual({});
    expect(result.bodyWarning).toBeUndefined();
  });

  it("errors on a sensitive header holding a literal value (Rule A)", () => {
    const result = validateHttpRequest(
      view({ headers: [{ key: "Authorization", value: "Bearer fake_demo_token_123" }] }),
    );

    expect(result.headerErrors[0]).toMatch(/sensitive header/i);
  });

  it("does not error on a sensitive header holding a recognized reference", () => {
    const result = validateHttpRequest(
      view({ headers: [{ key: "Authorization", value: "secret:demo_key" }] }),
    );

    expect(result.headerErrors).toEqual({});
  });

  it("is case-insensitive when matching a sensitive header name", () => {
    const result = validateHttpRequest(
      view({ headers: [{ key: "AUTHORIZATION", value: "Bearer fake_demo_token_123" }] }),
    );

    expect(result.headerErrors[0]).toMatch(/sensitive header/i);
  });

  it("warns (not errors) on a non-sensitive header whose value looks credential-shaped (Rule B)", () => {
    const result = validateHttpRequest(
      view({ headers: [{ key: "X-Custom-Header", value: "sk_fake1234567890" }] }),
    );

    expect(result.headerErrors[0]).toMatch(/looks like an inline credential/i);
  });

  it("does not error on a benign non-sensitive header value", () => {
    const result = validateHttpRequest(
      view({ headers: [{ key: "Content-Type", value: "application/json" }] }),
    );

    expect(result.headerErrors).toEqual({});
  });

  it("skips a header row with a blank key or blank value", () => {
    const result = validateHttpRequest(
      view({
        headers: [
          { key: "", value: "Bearer fake_demo_token_123" },
          { key: "Authorization", value: "" },
        ],
      }),
    );

    expect(result.headerErrors).toEqual({});
  });

  it("indexes header errors by row position, independent of other rows", () => {
    const result = validateHttpRequest(
      view({
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer fake_demo_token_123" },
        ],
      }),
    );

    expect(result.headerErrors).toEqual({ 1: expect.stringMatching(/sensitive header/i) });
  });

  it("warns on a plain-string body that looks credential-shaped", () => {
    const result = validateHttpRequest(view({ body: "sk_fake1234567890" }));

    expect(result.bodyWarning).toMatch(/inline credential/i);
  });

  it("does not warn on a plain-string body that is a recognized reference", () => {
    const result = validateHttpRequest(view({ body: "secret:demo_key" }));

    expect(result.bodyWarning).toBeUndefined();
  });

  it("warns when a credential-shaped literal is nested inside a JSON-object body", () => {
    const result = validateHttpRequest(
      view({ body: JSON.stringify({ auth: { token: "sk_fake1234567890" } }) }),
    );

    expect(result.bodyWarning).toMatch(/inline credential/i);
  });

  it("does not warn on a JSON-object body whose leaves are all references or benign literals", () => {
    const result = validateHttpRequest(
      view({ body: JSON.stringify({ query: "field:graphql_query", format: "json" }) }),
    );

    expect(result.bodyWarning).toBeUndefined();
  });

  it("does not warn on an empty body", () => {
    expect(validateHttpRequest(view({ body: "" })).bodyWarning).toBeUndefined();
    expect(validateHttpRequest(view({ body: "   " })).bodyWarning).toBeUndefined();
  });
});

describe("SENSITIVE_HEADER_NAMES", () => {
  it("matches Dander's documented sensitive header set", () => {
    expect([...SENSITIVE_HEADER_NAMES].sort()).toEqual(
      [
        "authorization",
        "proxy-authorization",
        "x-api-key",
        "api-key",
        "x-auth-token",
        "cookie",
        "set-cookie",
      ].sort(),
    );
  });
});
