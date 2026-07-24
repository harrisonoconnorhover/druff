"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Editor, loader } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";
import type { CodeLanguage } from "@/features/pipeline-canvas/inspector/categories/customCodeConfig";

/** Props for {@link MonacoCodeEditor}. */
export type MonacoCodeEditorProps = {
  language: CodeLanguage;
  value: string;
  onChange: (value: string) => void;
};

let monacoLoaderConfigured = false;

/**
 * Points `@monaco-editor/react`'s underlying AMD loader at the app's own origin (`/monaco/vs`,
 * populated at dev/build time by `scripts/copy-monaco-assets.mjs` from the pinned `monaco-editor`
 * dependency) instead of its default jsDelivr CDN loader — this ticket's AC5 ("no disallowed
 * external host at runtime") and `steering/01-security.md` rule 4 (a pinned dependency's assets,
 * served same-origin, rather than a third party phoned at runtime).
 *
 * Guarded by a module-scope flag rather than left as a bare module-scope call
 * (`steering/languages/typescript.md`: no side effects at module scope), and — separately —
 * because `@monaco-editor/loader` throws if `config()` runs again after `init()` has already been
 * called once anywhere in the app; `NodeInspector` remounts a fresh `MonacoCodeEditor` per selected
 * node, so this must tolerate being invoked many times across the app's lifetime while only ever
 * configuring the loader once, before the very first `init()`.
 */
function ensureMonacoLoaderConfigured(): void {
  if (monacoLoaderConfigured) return;
  loader.config({ paths: { vs: "/monaco/vs" } });
  monacoLoaderConfigured = true;
}

type LoadStatus = "loading" | "ready" | "error";

/**
 * Same-origin Monaco code widget (DRUFF-14): a thin wrapper over `@monaco-editor/react`'s
 * `<Editor>`, used purely as a syntax-highlighting text box for the resolved language. Consistent
 * with the "Druff never executes user code" non-goal, it only edits and stores an opaque code
 * string — no parsing for evaluation, no execution, no "run preview."
 *
 * Drives `loader.init()` itself (rather than relying on `<Editor>`'s own internal loading) so a
 * failed/blocked load — `/monaco/vs` missing, offline, a CSP blocking the script — degrades to a
 * plain controlled `<textarea aria-label>` instead of leaving the node unauthorable (AC5's
 * "graceful degradation"). While the load is in flight, a lightweight placeholder renders in
 * `<Editor>`'s place so the panel doesn't jump once Monaco becomes ready.
 *
 * Rendered by `CustomCodeConfigEditor` via a `next/dynamic(..., { ssr: false })` import — Monaco
 * touches `window`/`document` at load time and has no server-side rendering story, so this
 * component (and its `@monaco-editor/react` import) must never be evaluated during SSR.
 */
export function MonacoCodeEditor({ language, value, onChange }: MonacoCodeEditorProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    ensureMonacoLoaderConfigured();
    loader
      .init()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "error") {
    return (
      <Textarea
        aria-label={`${language} code`}
        spellCheck={false}
        className="min-h-40 font-mono text-xs"
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      />
    );
  }

  if (status === "loading") {
    return (
      <div
        role="status"
        className="flex min-h-40 items-center justify-center rounded-lg border border-input text-xs text-muted-foreground"
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <Editor
        height="240px"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{ minimap: { enabled: false }, fontSize: 12, automaticLayout: true }}
      />
    </div>
  );
}
