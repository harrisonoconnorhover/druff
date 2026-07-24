"use client";

import { useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  configToHttpRequest,
  httpRequestToConfig,
  moveHeader,
  HTTP_METHODS,
  type HttpMethod,
  type HttpRequestView,
} from "@/features/pipeline-canvas/inspector/categories/http/httpRequestConfig";
import { validateHttpRequest } from "@/features/pipeline-canvas/inspector/categories/http/httpRequestReferences";
import type { ConfigCategoryEditorProps } from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * The HTTP/API settings category editor (DRUFF-12): method, base URL / endpoint, an ordered
 * add/edit/remove/reorder header list, and a body payload — grounded in Dander's `RequestSpec`
 * (see `httpRequestConfig.ts`). Bound to the DRUFF-11 config-category seam (`config`-bearing
 * `node` in, `onConfigChange(config)` out); mounted/remounted per node by `NodeInspector`'s
 * `key={`${node.id}:${category.id}`}`, so the local state below always starts fresh for a
 * newly-selected node.
 *
 * Holds the **whole edited view** as local state (method/endpoint/headers/body together), seeded
 * from `config` on mount — the same local-mirror pattern `NodeConfigEditor`/`NodeFieldsEditor` use
 * (see `NodeConfigEditor`'s doc comment for the full rationale), rather than re-deriving
 * method/endpoint/body from the `node` prop on every render the way `ConnectorConfigCategory`
 * does. Two reasons that pattern doesn't fit here: (1) a freshly-added header row has a blank key
 * `entriesToConfig` intentionally drops from `config`, so it must survive somewhere other than
 * `config` until named — exactly `NodeConfigEditor`'s reason; (2) unlike a single string field,
 * this view's inline validation (`validateHttpRequest`) needs to see the *in-progress* edit, not
 * only the last value that made it back through `onConfigChange` — so every field lives in the one
 * local `view` this component renders from.
 *
 * Every edit updates `view` and calls `onConfigChange` with the full recomputed config
 * (`httpRequestToConfig`, merged against the node's *current* `config` so connector fields/
 * `query_params`/anything else this category doesn't own survive) — the store never lags what's on
 * screen.
 *
 * The body field is a **plain `<textarea>`**, never a Monaco/code widget and never parsed,
 * evaluated, or rendered as code — reinforcing the "Druff never executes user code" non-goal
 * (AC3); DRUFF-14's Monaco widget remains the only code surface in the inspector.
 */
export function HttpRequestConfigEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const [view, setView] = useState<HttpRequestView>(() => configToHttpRequest(node.data.config));
  const validation = validateHttpRequest(view);

  function commit(next: HttpRequestView): void {
    setView(next);
    onConfigChange(httpRequestToConfig(next, node.data.config));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="http-request-method">Method</Label>
        <select
          id="http-request-method"
          value={view.method}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            commit({ ...view, method: event.target.value as HttpMethod })
          }
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
          )}
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="http-request-endpoint">Base URL / endpoint</Label>
        <Input
          id="http-request-endpoint"
          placeholder="/candidates"
          value={view.endpoint}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            commit({ ...view, endpoint: event.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Headers</Label>
        {view.headers.length === 0 && (
          <p className="text-xs text-muted-foreground">No headers yet.</p>
        )}
        {view.headers.map((entry, index) => (
          // Index as key: same rationale as `NodeConfigEditor` — a header row has no identity
          // beyond position, and reordering is an explicit move, not a drag.
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Input
                aria-label="Header name"
                placeholder="Authorization"
                value={entry.key}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  commit({
                    ...view,
                    headers: view.headers.map((h, i) =>
                      i === index ? { ...h, key: event.target.value } : h,
                    ),
                  })
                }
              />
              <Input
                aria-label="Header value"
                placeholder="secret:my_api_key"
                aria-invalid={Boolean(validation.headerErrors[index])}
                value={entry.value}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  commit({
                    ...view,
                    headers: view.headers.map((h, i) =>
                      i === index ? { ...h, value: event.target.value } : h,
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Move header up"
                disabled={index === 0}
                onClick={() => commit({ ...view, headers: moveHeader(view.headers, index, "up") })}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Move header down"
                disabled={index === view.headers.length - 1}
                onClick={() =>
                  commit({ ...view, headers: moveHeader(view.headers, index, "down") })
                }
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove header"
                onClick={() =>
                  commit({ ...view, headers: view.headers.filter((_, i) => i !== index) })
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            {validation.headerErrors[index] && (
              <p className="text-xs text-destructive">{validation.headerErrors[index]}</p>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => commit({ ...view, headers: [...view.headers, { key: "", value: "" }] })}
        >
          <Plus />
          Add header
        </Button>
        <p className="text-xs text-muted-foreground">
          Header values must be secret or field references (e.g. &quot;secret:&lt;name&gt;&quot;,
          &quot;env:&lt;VAR&gt;&quot;, &quot;field:&lt;name&gt;&quot;) — never a raw credential
          value.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="http-request-body">Body</Label>
        <Textarea
          id="http-request-body"
          placeholder="Optional JSON-object or raw string template"
          value={view.body}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            commit({ ...view, body: event.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Stored as-authored — never executed, evaluated, or rendered as code.
        </p>
        {validation.bodyWarning && (
          <p className="text-xs text-destructive">{validation.bodyWarning}</p>
        )}
      </div>
    </div>
  );
}
