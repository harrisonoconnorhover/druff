import { describe, expect, it, vi } from "vitest";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import {
  LocalStorageGraphPersistence,
  type GraphSnapshot,
} from "@/lib/persistence/graph-persistence";

const STORAGE_KEY = "druff.graph.v1";

/** Minimal Map-backed `Storage` fake — no real DOM/browser storage, per this file's design seam. */
function createFakeStorage(overrides: Partial<Storage> = {}): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
    ...overrides,
  } as Storage;
}

const FIXTURE_SNAPSHOT: GraphSnapshot = {
  graph: EXAMPLE_GRAPH,
  positions: { crm_contacts: { x: 0, y: 80 }, warehouse_customers: { x: 280, y: 80 } },
};

describe("LocalStorageGraphPersistence", () => {
  it("round-trips a saved snapshot through load()", () => {
    const storage = createFakeStorage();
    const persistence = new LocalStorageGraphPersistence(storage);

    persistence.save(FIXTURE_SNAPSHOT);

    expect(persistence.load()).toEqual(FIXTURE_SNAPSHOT);
  });

  it("returns null when nothing has been saved", () => {
    const persistence = new LocalStorageGraphPersistence(createFakeStorage());
    expect(persistence.load()).toBeNull();
  });

  it("returns null (and does not throw) for an unparseable JSON blob", () => {
    const storage = createFakeStorage();
    storage.setItem(STORAGE_KEY, "{not json");
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns null for a mismatched envelope version", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 999, graph: FIXTURE_SNAPSHOT.graph, positions: {} }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    warn.mockRestore();
  });

  it("returns null for a schema-invalid graph without throwing", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, graph: { nodes: "not-an-array" }, positions: {} }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    warn.mockRestore();
  });

  it("falls back to an empty positions sidecar when positions is malformed", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, graph: FIXTURE_SNAPSHOT.graph, positions: "nonsense" }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    expect(persistence.load()).toEqual({ graph: FIXTURE_SNAPSHOT.graph, positions: {} });
  });

  it("propagates a genuine environment failure (e.g. quota) on save rather than swallowing it", () => {
    const storage = createFakeStorage({
      setItem: () => {
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      },
    });
    const persistence = new LocalStorageGraphPersistence(storage);

    expect(() => persistence.save(FIXTURE_SNAPSHOT)).toThrow();
  });

  it("clear() removes the stored snapshot so a subsequent load() returns null", () => {
    const storage = createFakeStorage();
    const persistence = new LocalStorageGraphPersistence(storage);
    persistence.save(FIXTURE_SNAPSHOT);

    persistence.clear();

    expect(persistence.load()).toBeNull();
  });

  it("never logs the underlying graph/positions values on a corrupt blob (no sensitive-data leak)", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        graph: { nodes: "not-an-array", secretLookingValue: "sk-should-not-appear" },
        positions: {},
      }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    persistence.load();
    const loggedText = warn.mock.calls.flat().join(" ");
    expect(loggedText).not.toContain("sk-should-not-appear");
    warn.mockRestore();
  });
});
