"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import {
  readCustomCode,
  writeCustomCode,
  type CodeLanguage,
  type CustomCodeView,
} from "@/features/pipeline-canvas/inspector/categories/customCodeConfig";
import { ParameterListEditor } from "@/features/pipeline-canvas/inspector/categories/ParameterListEditor";
import type { MonacoCodeEditorProps } from "@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor";

/** Placeholder shown while the `MonacoCodeEditor` chunk itself is still being fetched (the
 *  `next/dynamic` code-split boundary) — distinct from, and earlier than, `MonacoCodeEditor`'s own
 *  internal "loading"/"error" states, which only kick in once this chunk has already loaded. */
function DynamicLoadingPlaceholder(): ReactNode {
  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center rounded-lg border border-input text-xs text-muted-foreground"
    >
      Loading editor…
    </div>
  );
}

// Monaco touches `window`/`document` at load time and has no SSR story, so it's loaded via
// `next/dynamic` with `ssr: false` (this ticket's Design) rather than a plain top-level import —
// the only place in this module that imports `@monaco-editor/react` transitively.
const MonacoCodeEditor = dynamic<MonacoCodeEditorProps>(
  () =>
    import("@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor").then(
      (mod) => mod.MonacoCodeEditor,
    ),
  { ssr: false, loading: DynamicLoadingPlaceholder },
);

/** Props for {@link CustomCodeConfigEditor}. Deliberately narrower than the DRUFF-11
 *  `ConfigCategoryEditorProps` seam (`node`/`onConfigChange`) — this component only needs the
 *  resolved language plus the node's `config`, so it stays testable/reusable independent of that
 *  seam's exact shape; `CustomCodeConfigCategory.tsx` is the thin adapter that binds the two. */
export type CustomCodeConfigEditorProps = {
  language: CodeLanguage;
  config: Record<string, unknown> | undefined;
  onChange: (config: Record<string, unknown>) => void;
};

const LANGUAGE_LABEL: Record<CodeLanguage, string> = { python: "Python", sql: "SQL" };

/**
 * The custom-code config category editor (DRUFF-14): a Monaco-embedded code widget plus an ordered
 * named-parameter list, for a custom-API-connector node (Python) or a transform-layer node (SQL) —
 * see `customCodeConfig.ts` for the language resolution and config<->view mapping this component is
 * a thin, stateful shell around.
 *
 * Holds the edit model (`{ code, parameters }`) as local state seeded once from `config` — the same
 * local-mirror pattern `NodeConfigEditor`/`HttpRequestConfigEditor`/`TriggerConfigEditor` all use
 * (see `NodeConfigEditor`'s doc comment for the full rationale): a freshly-added, not-yet-named
 * parameter row would otherwise vanish on the very next keystroke, since `writeCustomCode` drops a
 * blank-name row on commit. Every edit recomputes the full config via `writeCustomCode` (merged
 * against the *current* `config` prop, so unrelated keys survive) and calls `onChange` immediately
 * — the store never lags what's on screen. `NodeInspector` mounts a fresh instance per selected
 * node (`key={`${node.id}:${category.id}`}`), so this local state resets on node change rather than
 * reacting to `config` prop changes itself.
 *
 * Per the "Druff never executes user code" non-goal: this component (and everything it renders)
 * only edits and stores the code/parameters — no parsing for evaluation, no execution, no preview.
 */
export function CustomCodeConfigEditor({
  language,
  config,
  onChange,
}: CustomCodeConfigEditorProps) {
  const [model, setModel] = useState<CustomCodeView>(() => readCustomCode(config));

  function commit(next: CustomCodeView): void {
    setModel(next);
    onChange(writeCustomCode(config, next));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>{LANGUAGE_LABEL[language]} code</Label>
        <MonacoCodeEditor
          language={language}
          value={model.code}
          onChange={(code) => commit({ ...model, code })}
        />
        <p className="text-xs text-muted-foreground">
          Stored as-authored for Dander to run — never executed, evaluated, or run as a preview in
          Druff.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Parameters</Label>
        <ParameterListEditor
          parameters={model.parameters}
          onChange={(parameters) => commit({ ...model, parameters })}
        />
      </div>
    </div>
  );
}
