"use client";

import { useEffect } from "react";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph, extractLayout, graphToCanvas } from "@/lib/pipeline-graph";
import {
  LocalStorageGraphPersistence,
  type GraphPersistence,
} from "@/lib/persistence/graph-persistence";

/** Debounce delay (ms) between a store change and the resulting autosave, so a burst of drag/edit
 * events (every pointer-move while dragging a node) doesn't write to localStorage on every frame. */
const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 500;

export type UseGraphPersistenceOptions = {
  /** Injectable persistence seam — defaults to the real `localStorage`-backed implementation.
   * Tests supply a fake so no real browser storage is touched. */
  persistence?: GraphPersistence;
  /** Autosave debounce delay in ms; overridable for tests. */
  debounceMs?: number;
};

/**
 * Connects the graph store (DRUFF-1) to local persistence (this ticket): on mount, hydrates the
 * store from the last-saved snapshot (a no-op if there is none — the store keeps its seed graph,
 * which is exactly what a fresh reload would show anyway); thereafter, debounced-autosaves the
 * current canvas as a `{ graph, positions }` snapshot on every store change.
 *
 * Deliberately subscribes to the store **imperatively** (`useGraphStore.subscribe`, not a reactive
 * selector) rather than depending on `nodes`/`edges` in a `useEffect` — that would mean either
 * calling `setState` synchronously inside an effect to sequence "hydrate, then start
 * autosaving" (cascading-render territory), or racing the very first autosave against
 * hydration's own store update. Subscribing directly sidesteps both: hydration's `setGraph` call
 * and every later store change are just callbacks on the same subscription, in the order they
 * actually happen, with no derived React state needed to sequence them.
 *
 * Contains no JSX; mount once per editor instance (`GraphEditor`).
 */
export function useGraphPersistence(options: UseGraphPersistenceOptions = {}): void {
  useEffect(() => {
    // Resolved inside the effect (not the render body) so the real `LocalStorageGraphPersistence`
    // default is only ever constructed client-side, post-mount — never during Next.js's
    // server-side render of this `'use client'` component, where `window` doesn't exist.
    const persistence = options.persistence ?? new LocalStorageGraphPersistence();
    const debounceMs = options.debounceMs ?? DEFAULT_AUTOSAVE_DEBOUNCE_MS;

    const snapshot = persistence.load();
    if (snapshot) {
      const restored = graphToCanvas(snapshot.graph, snapshot.positions);
      useGraphStore.getState().setGraph(restored.nodes, restored.edges);
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useGraphStore.subscribe((state) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        persistence.save({
          graph: canvasToGraph(state.nodes, state.edges),
          positions: extractLayout(state.nodes),
        });
      }, debounceMs);
    });

    return () => {
      if (timeout) clearTimeout(timeout);
      unsubscribe();
    };
    // Mount-only: `persistence`/`debounceMs` aren't expected to change for a given `GraphEditor`
    // instance, and re-running this on every render would re-hydrate mid-session, clobbering
    // in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
