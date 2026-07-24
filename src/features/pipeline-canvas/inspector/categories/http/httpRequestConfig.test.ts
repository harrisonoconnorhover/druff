import { describe, expect, it } from "vitest";
import {
  configToHttpRequest,
  httpRequestToConfig,
  moveHeader,
  HTTP_METHODS,
  type HttpRequestView,
} from "@/features/pipeline-canvas/inspector/categories/http/httpRequestConfig";

// Fixture reference values only — obviously fake per steering/02-engineering.md ("secret" is a
// literal string label here, never a real credential; the other values are field/secret
// *references*, which are inert placeholders Dander resolves, not secrets themselves).
const DEFAULT_VIEW: HttpRequestView = { method: "GET", endpoint: "", headers: [], body: "" };

describe("HTTP_METHODS", () => {
  it("is the closed set GET/POST/PUT/PATCH/DELETE, GET first", () => {
    expect(HTTP_METHODS).toEqual(["GET", "POST", "PUT", "PATCH", "DELETE"]);
  });
});

describe("configToHttpRequest", () => {
  it("defaults every field for a config with no request/endpoint at all", () => {
    expect(configToHttpRequest(undefined)).toEqual(DEFAULT_VIEW);
    expect(configToHttpRequest({})).toEqual(DEFAULT_VIEW);
  });

  it("reads endpoint from the sibling config key", () => {
    expect(configToHttpRequest({ endpoint: "/candidates" }).endpoint).toBe("/candidates");
  });

  it("ignores a non-string endpoint value defensively", () => {
    expect(configToHttpRequest({ endpoint: 42 }).endpoint).toBe("");
  });

  it("reads a full request spec: method, headers (in map order), body", () => {
    const view = configToHttpRequest({
      endpoint: "/candidates",
      request: {
        method: "POST",
        headers: { Authorization: "secret:demo_key", "Content-Type": "application/json" },
        query_params: { since: "field:updated_since" },
        body: { query: "field:graphql_query" },
      },
    });

    expect(view.method).toBe("POST");
    expect(view.headers).toEqual([
      { key: "Authorization", value: "secret:demo_key" },
      { key: "Content-Type", value: "application/json" },
    ]);
    expect(view.body).toBe(JSON.stringify({ query: "field:graphql_query" }, null, 2));
  });

  it("defaults method to GET for a missing or unrecognized method value", () => {
    expect(configToHttpRequest({ request: {} }).method).toBe("GET");
    expect(configToHttpRequest({ request: { method: "TRACE" } }).method).toBe("GET");
  });

  it("renders a plain string body verbatim (never re-encoded)", () => {
    expect(configToHttpRequest({ request: { body: "query { candidates }" } }).body).toBe(
      "query { candidates }",
    );
  });

  it("renders an absent body as an empty string", () => {
    expect(configToHttpRequest({ request: { method: "GET" } }).body).toBe("");
  });
});

describe("httpRequestToConfig", () => {
  it("omits `request` entirely for a fully-default view (GET, no headers, no body)", () => {
    const config = httpRequestToConfig(DEFAULT_VIEW, undefined);

    expect(config).not.toHaveProperty("request");
  });

  it("drops a previously-set request when edited back down to fully default", () => {
    const existingConfig = {
      request: { method: "POST", headers: {}, query_params: {}, body: null },
    };

    const config = httpRequestToConfig(DEFAULT_VIEW, existingConfig);

    expect(config).not.toHaveProperty("request");
  });

  it("an explicit `body: null` doesn't itself count as 'has a body' (regression)", () => {
    // A request whose only non-default trait, before this edit, was an explicit `body: null` (not
    // a real body) must still be recognized as fully default once method/headers are defaulted —
    // `null` and "absent" mean the same thing on Dander's side, so this must not block the
    // omit-when-default rule the same way a genuine body would.
    const existingConfig = {
      request: { method: "GET", headers: {}, query_params: {}, body: null },
    };

    const config = httpRequestToConfig(DEFAULT_VIEW, existingConfig);

    expect(config).not.toHaveProperty("request");
  });

  it("sets endpoint when non-blank and clears the key when blank", () => {
    expect(httpRequestToConfig({ ...DEFAULT_VIEW, endpoint: "/candidates" }, undefined)).toEqual({
      endpoint: "/candidates",
    });
    expect(httpRequestToConfig(DEFAULT_VIEW, { endpoint: "/candidates" })).not.toHaveProperty(
      "endpoint",
    );
  });

  it("drops a blank-key header row and lets a duplicate key resolve last-wins", () => {
    const view: HttpRequestView = {
      ...DEFAULT_VIEW,
      method: "POST",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "", value: "orphaned" },
        { key: "Content-Type", value: "text/plain" },
      ],
    };

    const config = httpRequestToConfig(view, undefined);

    expect(config.request).toMatchObject({ headers: { "Content-Type": "text/plain" } });
  });

  it("writes headers in the row order given (reorder reflected in written key order)", () => {
    const view: HttpRequestView = {
      ...DEFAULT_VIEW,
      method: "POST",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Authorization", value: "secret:demo_key" },
      ],
    };

    const config = httpRequestToConfig(view, undefined);

    expect(Object.keys((config.request as { headers: Record<string, string> }).headers)).toEqual([
      "Content-Type",
      "Authorization",
    ]);
  });

  it("preserves an un-edited non-string (JSON-object) body verbatim rather than stringifying it", () => {
    const originalBody = { query: "field:graphql_query", variables: { id: "field:id" } };
    const existingConfig = {
      request: { method: "POST", headers: {}, query_params: {}, body: originalBody },
    };
    const view = configToHttpRequest(existingConfig); // seeds view.body from the pretty-printed object

    const config = httpRequestToConfig({ ...view, method: "POST" }, existingConfig);

    expect((config.request as { body: unknown }).body).toBe(originalBody); // same reference, not a re-stringified copy
  });

  it("normalizes an edited object body to a string once its text actually changes", () => {
    const originalBody = { query: "field:graphql_query" };
    const existingConfig = {
      request: { method: "POST", headers: {}, query_params: {}, body: originalBody },
    };
    const view = configToHttpRequest(existingConfig);

    const config = httpRequestToConfig(
      { ...view, method: "POST", body: view.body + "\n// edited" },
      existingConfig,
    );

    expect((config.request as { body: unknown }).body).toBe(view.body + "\n// edited");
  });

  it("preserves query_params and other config keys untouched", () => {
    const existingConfig = {
      harvest_api_key_ref: "secret:demo_source_key",
      request: {
        method: "GET",
        headers: {},
        query_params: { since: "field:updated_since" },
        body: null,
      },
    };
    const view = configToHttpRequest(existingConfig);

    const config = httpRequestToConfig({ ...view, method: "POST" }, existingConfig);

    expect(config.harvest_api_key_ref).toBe("secret:demo_source_key");
    expect((config.request as { query_params: unknown }).query_params).toEqual({
      since: "field:updated_since",
    });
  });

  it("keeps `request` non-default when only query_params (preserved, not edited) is non-empty", () => {
    const existingConfig = {
      request: {
        method: "GET",
        headers: {},
        query_params: { since: "field:updated_since" },
        body: null,
      },
    };
    const view = configToHttpRequest(existingConfig);

    const config = httpRequestToConfig(view, existingConfig); // no edits at all

    expect(config).toHaveProperty("request");
  });

  it("never mutates the existingConfig object passed in", () => {
    const existingConfig = { endpoint: "/candidates" };
    const frozen = JSON.parse(JSON.stringify(existingConfig));

    httpRequestToConfig({ ...DEFAULT_VIEW, endpoint: "/changed" }, existingConfig);

    expect(existingConfig).toEqual(frozen);
  });
});

describe("configToHttpRequest / httpRequestToConfig round trip", () => {
  it("is stable for a fully-populated request spec", () => {
    const config = {
      endpoint: "/candidates",
      request: {
        method: "POST",
        headers: { Authorization: "secret:demo_key", "Content-Type": "application/json" },
        query_params: { since: "field:updated_since" },
        body: "query { candidates }",
      },
    };

    const view = configToHttpRequest(config);
    const rebuilt = httpRequestToConfig(view, config);

    expect(rebuilt).toEqual(config);
  });
});

describe("moveHeader", () => {
  const rows = [
    { key: "a", value: "1" },
    { key: "b", value: "2" },
    { key: "c", value: "3" },
  ];

  it("swaps a row with its previous neighbor on 'up'", () => {
    expect(moveHeader(rows, 1, "up")).toEqual([
      { key: "b", value: "2" },
      { key: "a", value: "1" },
      { key: "c", value: "3" },
    ]);
  });

  it("swaps a row with its next neighbor on 'down'", () => {
    expect(moveHeader(rows, 1, "down")).toEqual([
      { key: "a", value: "1" },
      { key: "c", value: "3" },
      { key: "b", value: "2" },
    ]);
  });

  it("is a no-op moving the first row up or the last row down", () => {
    expect(moveHeader(rows, 0, "up")).toEqual(rows);
    expect(moveHeader(rows, 2, "down")).toEqual(rows);
  });
});
