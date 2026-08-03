import {
  decodeGraph,
  encodeGraph,
  GraphDecodeError,
  type GraphFormat,
  type PipelineGraph,
} from "@/lib/pipeline-graph";
import { parse as parseYaml } from "yaml";
import {
  DanderProjectManifestSchema,
  projectDanderManifest,
} from "@/lib/dander-project/manifest-preview";
import type { GraphLayout } from "@/lib/pipeline-graph";

/** File-extension → `GraphFormat` mapping (case-insensitive). `.yml` is accepted as a `.yaml`
 * synonym since both are common on disk for the same format. */
const EXTENSION_TO_FORMAT: Record<string, GraphFormat> = {
  yaml: "yaml",
  yml: "yaml",
  json: "json",
};

/** Filenames a browser download uses per format — explicitly not deployable Dander filenames. */
const DOWNLOAD_FILENAMES: Record<GraphFormat, string> = {
  yaml: "pipeline.druff.yaml",
  json: "pipeline.druff.json",
};

const MIME_TYPES: Record<GraphFormat, string> = {
  yaml: "application/yaml",
  json: "application/json",
};

/**
 * Discriminated result of parsing an imported file: either the decoded, schema-valid graph, or an
 * actionable error message (never a bare stack trace) — the shape `GraphToolbar`'s import handler
 * switches on to either hydrate the store or raise a fail-loud toast (`steering/02-engineering.md`).
 */
export type ImportResult =
  | {
      ok: true;
      kind: "graph-draft";
      graph: PipelineGraph;
    }
  | {
      ok: true;
      kind: "manifest-preview";
      graph: PipelineGraph;
      positions: GraphLayout;
      pipelineCount: number;
    }
  | { ok: false; error: string };

/**
 * Infers a `GraphFormat` from a filename's extension (case-insensitive), or `null` if the
 * extension isn't a recognized graph format.
 */
export function formatFromFilename(filename: string): GraphFormat | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? (EXTENSION_TO_FORMAT[extension] ?? null) : null;
}

/**
 * Parses an imported Druff graph draft or version-1 Dander project manifest. Pure — no DOM, no
 * `Blob`/`File`, just `text`/`filename` in and a discriminated result out. Graph drafts use
 * DRUFF-4's decoder; manifests use the one-way hosted-pipeline projector and can never be written
 * back through this module.
 */
export function parseImportedFile(text: string, filename: string): ImportResult {
  const format = formatFromFilename(filename);
  if (!format) {
    return {
      ok: false,
      error: `Unrecognized file extension for "${filename}" — expected .yaml, .yml, or .json.`,
    };
  }

  let raw: unknown;
  try {
    raw = format === "yaml" ? parseYaml(text) : JSON.parse(text);
  } catch (cause) {
    return {
      ok: false,
      error: `Could not parse file as ${format.toUpperCase()}: ${describeError(cause)}`,
    };
  }

  if (isDanderManifestCandidate(raw)) {
    const result = DanderProjectManifestSchema.safeParse(raw);
    if (!result.success) {
      return {
        ok: false,
        error: `Dander manifest cannot be previewed: ${result.error.message}`,
      };
    }
    const preview = projectDanderManifest(result.data);
    return { ok: true, kind: "manifest-preview", ...preview };
  }

  try {
    return { ok: true, kind: "graph-draft", graph: decodeGraph(text, format) };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof GraphDecodeError ? cause.message : describeError(cause),
    };
  }
}

/**
 * Encodes `graph` via DRUFF-4's `encodeGraph` and triggers a browser file download (`Blob` +
 * object-URL anchor). The only DOM/browser-dependent piece of this module — deliberately thin, so
 * the actual serialization logic above stays pure and covered by unit tests instead.
 */
export function exportGraphToFile(graph: PipelineGraph, format: GraphFormat): void {
  const text = encodeGraph(graph, format);
  const blob = new Blob([text], { type: MIME_TYPES[format] });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = DOWNLOAD_FILENAMES[format];
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isDanderManifestCandidate(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "version" in value &&
    "pipelines" in value
  );
}
