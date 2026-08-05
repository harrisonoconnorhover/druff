"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DanderApiConnectorDiscovery,
  type ConnectorDiscovery,
} from "@/features/connector-library/discovery";
import {
  DanderApiPluginCatalogDiscovery,
  type PluginCatalogDiscovery,
} from "@/features/connector-library/catalog";
import { clearPluginCatalog, setPluginCatalog } from "@/features/connector-library/catalog-store";
import {
  clearDiscoveredConnectors,
  setDiscoveredConnectors,
} from "@/features/connector-library/registry";
import { useGraphStore, type GraphState } from "@/lib/graph-store";
import { canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph";
import {
  DanderApiGraphPersistence,
  GraphPersistenceError,
  type GraphPersistence,
} from "@/lib/persistence/graph-persistence";

export type GraphPersistenceStatus =
  "disconnected" | "loading" | "clean" | "dirty" | "saving" | "conflict" | "error";

export type GraphPersistenceControls = {
  status: GraphPersistenceStatus;
  error: string | null;
  revision: string | null;
  attached: boolean;
  open: () => Promise<void>;
  save: () => Promise<void>;
  detach: () => void;
};

export type UseGraphPersistenceOptions = {
  /** Injectable seam for tests; defaults to Dander's localhost single-file graph API. */
  persistence?: GraphPersistence;
  /** Optional connector-catalog seam. Injected graph-only tests omit discovery entirely. */
  connectorDiscovery?: ConnectorDiscovery;
  /** Optional curated-package catalog seam; it never installs packages or writes the manifest. */
  pluginCatalogDiscovery?: PluginCatalogDiscovery;
};

/**
 * Explicit Open/Save controller for a canonical Dander graph. There is intentionally no server
 * autosave: every write carries the revision returned by Open/Save and a stale revision becomes a
 * visible conflict rather than an overwrite. Local file imports detach from the server document.
 */
export function useGraphPersistence(
  options: UseGraphPersistenceOptions = {},
): GraphPersistenceControls {
  const persistenceRef = useRef<GraphPersistence | null>(null);
  if (persistenceRef.current === null) {
    persistenceRef.current = options.persistence ?? new DanderApiGraphPersistence();
  }
  const connectorDiscoveryRef = useRef<ConnectorDiscovery | null | undefined>(undefined);
  if (connectorDiscoveryRef.current === undefined) {
    connectorDiscoveryRef.current =
      options.connectorDiscovery ??
      (options.persistence === undefined ? new DanderApiConnectorDiscovery() : null);
  }
  const pluginCatalogDiscoveryRef = useRef<PluginCatalogDiscovery | null | undefined>(undefined);
  if (pluginCatalogDiscoveryRef.current === undefined) {
    pluginCatalogDiscoveryRef.current =
      options.pluginCatalogDiscovery ??
      (options.persistence === undefined ? new DanderApiPluginCatalogDiscovery() : null);
  }

  const revisionRef = useRef<string | null>(null);
  const baselineRef = useRef<string | null>(null);
  const lastSemanticRef = useRef<string | null>(null);
  const attachedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const changeVersionRef = useRef(0);
  const [status, setStatus] = useState<GraphPersistenceStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<string | null>(null);

  useEffect(
    () =>
      useGraphStore.subscribe((state) => {
        if (!attachedRef.current || applyingRemoteRef.current) return;
        const semanticGraph = serializeGraphState(state);
        if (semanticGraph === lastSemanticRef.current) return;
        lastSemanticRef.current = semanticGraph;
        changeVersionRef.current += 1;
        setStatus(semanticGraph === baselineRef.current ? "clean" : "dirty");
        setError(null);
      }),
    [],
  );

  const open = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const connectorDiscovery = connectorDiscoveryRef.current;
      const pluginCatalogDiscovery = pluginCatalogDiscoveryRef.current;
      await Promise.all([
        (async () => {
          if (connectorDiscovery == null) return;
          try {
            setDiscoveredConnectors(await connectorDiscovery.load());
          } catch {
            // Connector discovery must never prevent canonical graph access. Unknown connectors
            // load as ordinary source nodes and retain their complete config on the next save.
            clearDiscoveredConnectors();
          }
        })(),
        (async () => {
          if (pluginCatalogDiscovery == null) return;
          try {
            setPluginCatalog(await pluginCatalogDiscovery.load());
          } catch {
            // Catalog browsing is optional and cannot become a graph open/save dependency.
            clearPluginCatalog();
          }
        })(),
      ]);
      const document = await persistenceRef.current!.load();
      const restored = graphToCanvas(document.graph);
      applyingRemoteRef.current = true;
      useGraphStore
        .getState()
        .setGraph(restored.nodes, restored.edges, document.graph.name, document.graph.trigger);
      applyingRemoteRef.current = false;
      revisionRef.current = document.revision;
      setRevision(document.revision);
      attachedRef.current = true;
      changeVersionRef.current = 0;
      baselineRef.current = serializeGraphState(useGraphStore.getState());
      lastSemanticRef.current = baselineRef.current;
      setStatus("clean");
    } catch (cause) {
      applyingRemoteRef.current = false;
      attachedRef.current = false;
      revisionRef.current = null;
      setRevision(null);
      baselineRef.current = null;
      lastSemanticRef.current = null;
      setStatus("error");
      setError(describeError(cause));
    }
  }, []);

  const save = useCallback(async () => {
    const revision = revisionRef.current;
    if (!attachedRef.current || revision === null) {
      setStatus("error");
      setError("Open a graph from Dander before saving.");
      return;
    }

    const state = useGraphStore.getState();
    const graph = canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger);
    const savedChangeVersion = changeVersionRef.current;
    setStatus("saving");
    setError(null);

    try {
      const document = await persistenceRef.current!.save(graph, revision);
      revisionRef.current = document.revision;
      setRevision(document.revision);
      baselineRef.current = JSON.stringify(document.graph);
      if (changeVersionRef.current === savedChangeVersion) {
        const restored = graphToCanvas(document.graph);
        applyingRemoteRef.current = true;
        useGraphStore
          .getState()
          .setGraph(restored.nodes, restored.edges, document.graph.name, document.graph.trigger);
        applyingRemoteRef.current = false;
        baselineRef.current = serializeGraphState(useGraphStore.getState());
        lastSemanticRef.current = baselineRef.current;
        setStatus("clean");
      } else {
        // An edit arrived while the request was in flight. The server saved the captured graph;
        // keep the newer canvas edit dirty against the returned revision instead of clobbering it.
        const current = serializeGraphState(useGraphStore.getState());
        lastSemanticRef.current = current;
        setStatus(current === baselineRef.current ? "clean" : "dirty");
      }
    } catch (cause) {
      applyingRemoteRef.current = false;
      setStatus(cause instanceof GraphPersistenceError && cause.conflict ? "conflict" : "error");
      setError(describeError(cause));
    }
  }, []);

  const detach = useCallback(() => {
    attachedRef.current = false;
    revisionRef.current = null;
    setRevision(null);
    baselineRef.current = null;
    lastSemanticRef.current = null;
    changeVersionRef.current = 0;
    setStatus("disconnected");
    setError(null);
  }, []);

  return { status, error, revision, attached: revision !== null, open, save, detach };
}

function describeError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Could not reach Dander. Start `dander graph serve --file <graph.yaml>` and try again.";
  }
  return error instanceof Error ? error.message : "Dander graph request failed.";
}

function serializeGraphState(state: GraphState): string {
  return JSON.stringify(
    canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger),
  );
}
