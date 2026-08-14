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
import {
  DanderApiOperationCatalogDiscovery,
  type OperationCatalogDiscovery,
} from "@/features/pipeline-operations/catalog";
import {
  clearOperationCatalog,
  setOperationCatalog,
} from "@/features/pipeline-operations/catalog-store";
import { useGraphStore, type GraphState } from "@/lib/graph-store";
import { canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph";
import {
  DanderApiGraphPersistence,
  GraphPersistenceError,
  isManagedGraphPersistence,
  type GraphAddress,
  type GraphSummary,
  type GraphPersistence,
} from "@/lib/persistence/graph-persistence";

export type GraphPersistenceStatus =
  "disconnected" | "loading" | "clean" | "dirty" | "saving" | "deleting" | "conflict" | "error";

export type GraphPersistenceControls = {
  status: GraphPersistenceStatus;
  error: string | null;
  revision: string | null;
  address: GraphAddress | null;
  contentSha256: string | null;
  attached: boolean;
  managed: boolean;
  projects: string[];
  graphs: GraphSummary[];
  nextCursor: string | null;
  browsing: boolean;
  browseError: string | null;
  loadProjects: () => Promise<string[]>;
  loadGraphs: (project: string, append?: boolean) => Promise<void>;
  create: (project: string, graph: string) => Promise<void>;
  open: (address?: GraphAddress) => Promise<void>;
  reload: () => Promise<void>;
  save: () => Promise<void>;
  delete: () => Promise<void>;
  detach: () => void;
};

export type UseGraphPersistenceOptions = {
  /** Injectable seam for tests; defaults to Dander's localhost single-file graph API. */
  persistence?: GraphPersistence;
  /** Optional connector-catalog seam. Injected graph-only tests omit discovery entirely. */
  connectorDiscovery?: ConnectorDiscovery;
  /** Optional curated-package catalog seam; it never installs packages or writes the manifest. */
  pluginCatalogDiscovery?: PluginCatalogDiscovery;
  /** Optional runtime-owned catalog of safe operations the connected Dander can execute. */
  operationCatalogDiscovery?: OperationCatalogDiscovery;
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
  const operationCatalogDiscoveryRef = useRef<OperationCatalogDiscovery | null | undefined>(
    undefined,
  );
  if (operationCatalogDiscoveryRef.current === undefined) {
    operationCatalogDiscoveryRef.current =
      options.operationCatalogDiscovery ??
      (options.persistence === undefined ? new DanderApiOperationCatalogDiscovery() : null);
  }

  const revisionRef = useRef<string | null>(null);
  const addressRef = useRef<GraphAddress | null>(null);
  const contentSha256Ref = useRef<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const baselineRef = useRef<string | null>(null);
  const lastSemanticRef = useRef<string | null>(null);
  const attachedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const changeVersionRef = useRef(0);
  const [status, setStatus] = useState<GraphPersistenceStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [address, setAddress] = useState<GraphAddress | null>(null);
  const [contentSha256, setContentSha256] = useState<string | null>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [graphs, setGraphs] = useState<GraphSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [managed] = useState(() =>
    options.persistence === undefined ? false : isManagedGraphPersistence(options.persistence),
  );

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

  const loadProjects = useCallback(async () => {
    const persistence = persistenceRef.current!;
    if (!isManagedGraphPersistence(persistence)) return [];
    setBrowsing(true);
    setBrowseError(null);
    try {
      const loaded = await persistence.listProjects();
      setProjects(loaded);
      return loaded;
    } catch (cause) {
      setBrowseError(describeError(cause, true));
      return [];
    } finally {
      setBrowsing(false);
    }
  }, []);

  const loadGraphs = useCallback(async (project: string, append = false) => {
    const persistence = persistenceRef.current!;
    if (!isManagedGraphPersistence(persistence)) return;
    const cursor = append ? nextCursorRef.current : null;
    if (append && cursor === null) return;
    setBrowsing(true);
    setBrowseError(null);
    try {
      const page = await persistence.listGraphs(project, cursor);
      setGraphs((current) => (append ? [...current, ...page.items] : page.items));
      nextCursorRef.current = page.nextCursor;
      setNextCursor(page.nextCursor);
    } catch (cause) {
      setBrowseError(describeError(cause, true));
    } finally {
      setBrowsing(false);
    }
  }, []);

  const openDocument = useCallback(async (target?: GraphAddress, discardLocal = false) => {
    const persistence = persistenceRef.current!;
    if (isManagedGraphPersistence(persistence) && !target) {
      setStatus("error");
      setError("Choose a hosted graph to open.");
      return;
    }
    if (
      !discardLocal &&
      attachedRef.current &&
      baselineRef.current !== null &&
      serializeGraphState(useGraphStore.getState()) !== baselineRef.current
    ) {
      setStatus("dirty");
      setError("Save or export this draft before opening another hosted graph.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const connectorDiscovery = connectorDiscoveryRef.current;
      const pluginCatalogDiscovery = pluginCatalogDiscoveryRef.current;
      const operationCatalogDiscovery = operationCatalogDiscoveryRef.current;
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
        (async () => {
          if (operationCatalogDiscovery == null) return;
          try {
            setOperationCatalog(await operationCatalogDiscovery.load());
          } catch {
            // Older runtimes and failed discovery do not block canonical graph access. Existing
            // operation config remains preserved, but the editor offers no unsupported additions.
            clearOperationCatalog();
          }
        })(),
      ]);
      const document = await persistence.load(target);
      const restored = graphToCanvas(document.graph);
      applyingRemoteRef.current = true;
      useGraphStore
        .getState()
        .setGraph(restored.nodes, restored.edges, document.graph.name, document.graph.trigger);
      applyingRemoteRef.current = false;
      revisionRef.current = document.revision;
      setRevision(document.revision);
      addressRef.current = document.address ?? null;
      setAddress(document.address ?? null);
      contentSha256Ref.current = document.contentSha256 ?? null;
      setContentSha256(document.contentSha256 ?? null);
      attachedRef.current = true;
      changeVersionRef.current = 0;
      baselineRef.current = serializeGraphState(useGraphStore.getState());
      lastSemanticRef.current = baselineRef.current;
      setStatus("clean");
    } catch (cause) {
      applyingRemoteRef.current = false;
      if (!isManagedGraphPersistence(persistence) || !attachedRef.current) {
        attachedRef.current = false;
        revisionRef.current = null;
        setRevision(null);
        addressRef.current = null;
        setAddress(null);
        contentSha256Ref.current = null;
        setContentSha256(null);
        baselineRef.current = null;
        lastSemanticRef.current = null;
      }
      setStatus("error");
      setError(describeError(cause, isManagedGraphPersistence(persistence)));
    }
  }, []);

  const open = useCallback(
    async (target?: GraphAddress) => openDocument(target, false),
    [openDocument],
  );

  const reload = useCallback(async () => {
    const target = addressRef.current ?? undefined;
    await openDocument(target, true);
  }, [openDocument]);

  const create = useCallback(async (project: string, graph: string) => {
    const persistence = persistenceRef.current!;
    if (!isManagedGraphPersistence(persistence)) return;
    if (attachedRef.current) {
      setStatus("error");
      setError("Detach this graph before creating a separate hosted graph.");
      return;
    }
    const address = { project, graph };
    const state = useGraphStore.getState();
    const document = canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger);
    const submittedSemantic = JSON.stringify(document);
    setStatus("saving");
    setError(null);
    try {
      const created = await persistence.create(address, document);
      revisionRef.current = created.revision;
      setRevision(created.revision);
      addressRef.current = address;
      setAddress(address);
      contentSha256Ref.current = created.contentSha256 ?? null;
      setContentSha256(created.contentSha256 ?? null);
      attachedRef.current = true;
      changeVersionRef.current = 0;
      const currentSemantic = serializeGraphState(useGraphStore.getState());
      if (currentSemantic === submittedSemantic) {
        const restored = graphToCanvas(created.graph);
        applyingRemoteRef.current = true;
        useGraphStore
          .getState()
          .setGraph(restored.nodes, restored.edges, created.graph.name, created.graph.trigger);
        applyingRemoteRef.current = false;
        baselineRef.current = serializeGraphState(useGraphStore.getState());
        lastSemanticRef.current = baselineRef.current;
        setStatus("clean");
      } else {
        // The detached draft remained editable while Create was in flight. Attach the accepted
        // remote identity and baseline, but keep the newer local canvas dirty instead of erasing it.
        baselineRef.current = JSON.stringify(created.graph);
        lastSemanticRef.current = currentSemantic;
        changeVersionRef.current = 1;
        setStatus("dirty");
      }
    } catch (cause) {
      applyingRemoteRef.current = false;
      setStatus("error");
      setError(describeError(cause, true));
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
      const target = addressRef.current;
      const document =
        target === null
          ? await persistenceRef.current!.save(graph, revision)
          : await persistenceRef.current!.save(graph, revision, target);
      revisionRef.current = document.revision;
      setRevision(document.revision);
      setContentSha256(document.contentSha256 ?? contentSha256Ref.current);
      contentSha256Ref.current = document.contentSha256 ?? contentSha256Ref.current;
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
      setError(describeError(cause, isManagedGraphPersistence(persistenceRef.current!)));
    }
  }, []);

  const deleteGraph = useCallback(async () => {
    const persistence = persistenceRef.current!;
    const target = addressRef.current;
    const revision = revisionRef.current;
    if (!isManagedGraphPersistence(persistence) || target === null || revision === null) {
      setStatus("error");
      setError("Open a hosted graph before deleting it.");
      return;
    }
    setStatus("deleting");
    setError(null);
    try {
      await persistence.delete(target, revision);
      attachedRef.current = false;
      revisionRef.current = null;
      setRevision(null);
      addressRef.current = null;
      setAddress(null);
      contentSha256Ref.current = null;
      setContentSha256(null);
      baselineRef.current = null;
      lastSemanticRef.current = null;
      changeVersionRef.current = 0;
      setGraphs((current) =>
        current.filter((item) => item.project !== target.project || item.graph !== target.graph),
      );
      setStatus("disconnected");
    } catch (cause) {
      setStatus(cause instanceof GraphPersistenceError && cause.conflict ? "conflict" : "error");
      setError(describeError(cause, true));
    }
  }, []);

  const detach = useCallback(() => {
    attachedRef.current = false;
    revisionRef.current = null;
    setRevision(null);
    addressRef.current = null;
    setAddress(null);
    contentSha256Ref.current = null;
    setContentSha256(null);
    baselineRef.current = null;
    lastSemanticRef.current = null;
    changeVersionRef.current = 0;
    setStatus("disconnected");
    setError(null);
  }, []);

  return {
    status,
    error,
    revision,
    address,
    contentSha256,
    attached: revision !== null,
    managed,
    projects,
    graphs,
    nextCursor,
    browsing,
    browseError,
    loadProjects,
    loadGraphs,
    create,
    open,
    reload,
    save,
    delete: deleteGraph,
    detach,
  };
}

function describeError(error: unknown, hosted = false): string {
  if (error instanceof TypeError) {
    if (hosted) {
      return "Could not reach hosted Dander. Check the connection and retry the same operation safely.";
    }
    return "Could not reach Dander. Start `dander graph serve --file <graph.yaml>` and try again.";
  }
  return error instanceof Error ? error.message : "Dander graph request failed.";
}

function serializeGraphState(state: GraphState): string {
  return JSON.stringify(
    canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger),
  );
}
