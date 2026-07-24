import { describe, expect, it } from "vitest";
import {
  addField,
  fromRows,
  moveField,
  newField,
  removeField,
  toRows,
  updateField,
} from "@/features/pipeline-canvas/inspector/nodeFields";
import { configToEntries, entriesToConfig } from "@/features/pipeline-canvas/inspector/nodeConfig";
import type { NodeField } from "@/lib/pipeline-graph/schema";

// Fixture-only field data — labels/tokens, never real field values or sample data
// (steering/01-security.md, steering/02-engineering.md).
const NAME_FIELD: NodeField = {
  name: "email",
  type: "STRING",
  nullable: false,
  description: "Contact email",
  metadata: { sensitivity: "pii" },
};
const ID_FIELD: NodeField = {
  name: "id",
  type: "INT64",
  nullable: true,
  description: null,
  metadata: {},
};

describe("newField", () => {
  it("defaults to Dander's NodeField shape: blank name/type, nullable true, null description, empty metadata", () => {
    expect(newField()).toEqual({
      name: "",
      type: "",
      nullable: true,
      description: null,
      metadata: {},
    });
  });
});

describe("toRows / fromRows", () => {
  it("toRows(undefined) yields no rows", () => {
    expect(toRows(undefined)).toEqual([]);
  });

  it("toRows preserves declared field order and pairs each with a row id", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    expect(rows).toHaveLength(2);
    expect(rows[0].field).toEqual(NAME_FIELD);
    expect(rows[1].field).toEqual(ID_FIELD);
    expect(rows[0].id).not.toBe(rows[1].id);
  });

  it("fromRows strips the row id and returns a plain NodeField[] in row order", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    expect(fromRows(rows)).toEqual([NAME_FIELD, ID_FIELD]);
  });

  it("round-trips through toRows -> fromRows unchanged", () => {
    const fields = [NAME_FIELD, ID_FIELD];
    expect(fromRows(toRows(fields))).toEqual(fields);
  });
});

describe("addField", () => {
  it("appends a freshly-defaulted field row to the end", () => {
    const rows = toRows([ID_FIELD]);

    const next = addField(rows);

    expect(next).toHaveLength(2);
    expect(next[0].field).toEqual(ID_FIELD);
    expect(next[1].field).toEqual(newField());
  });

  it("gives the new row a unique id distinct from existing rows", () => {
    const rows = toRows([ID_FIELD]);

    const next = addField(rows);

    expect(next[1].id).not.toBe(rows[0].id);
  });
});

describe("updateField", () => {
  it("edits the name key on the matching row only", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    const next = updateField(rows, rows[1].id, { name: "record_id" });

    expect(next[0].field).toEqual(NAME_FIELD);
    expect(next[1].field).toEqual({ ...ID_FIELD, name: "record_id" });
  });

  it("edits the type key", () => {
    const rows = toRows([ID_FIELD]);

    const next = updateField(rows, rows[0].id, { type: "STRING" });

    expect(next[0].field.type).toBe("STRING");
  });

  it("edits the nullable key", () => {
    const rows = toRows([ID_FIELD]);

    const next = updateField(rows, rows[0].id, { nullable: false });

    expect(next[0].field.nullable).toBe(false);
  });

  it("edits the description key, allowing it to be set back to null", () => {
    const rows = toRows([NAME_FIELD]);

    const cleared = updateField(rows, rows[0].id, { description: null });

    expect(cleared[0].field.description).toBeNull();
  });

  it("is a no-op for an id that doesn't match any row", () => {
    const rows = toRows([ID_FIELD]);

    const next = updateField(rows, "not-a-real-id", { name: "ignored" });

    expect(next).toEqual(rows);
  });
});

describe("removeField", () => {
  it("removes the matching row and leaves the others in order", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    const next = removeField(rows, rows[0].id);

    expect(next).toHaveLength(1);
    expect(next[0].field).toEqual(ID_FIELD);
  });

  it("is a no-op for an id that doesn't match any row", () => {
    const rows = toRows([ID_FIELD]);

    expect(removeField(rows, "not-a-real-id")).toEqual(rows);
  });
});

describe("moveField", () => {
  it("moves a middle row up, swapping with its predecessor", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);
    const idOfSecond = rows[1].id;

    const next = moveField(rows, idOfSecond, "up");

    expect(next.map((row) => row.field)).toEqual([ID_FIELD, NAME_FIELD]);
  });

  it("moves a middle row down, swapping with its successor", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);
    const idOfFirst = rows[0].id;

    const next = moveField(rows, idOfFirst, "down");

    expect(next.map((row) => row.field)).toEqual([ID_FIELD, NAME_FIELD]);
  });

  it("clamps at the top: moving the first row up is a no-op", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    const next = moveField(rows, rows[0].id, "up");

    expect(next).toEqual(rows);
  });

  it("clamps at the bottom: moving the last row down is a no-op", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    const next = moveField(rows, rows[1].id, "down");

    expect(next).toEqual(rows);
  });

  it("is a no-op for an id that doesn't match any row", () => {
    const rows = toRows([NAME_FIELD, ID_FIELD]);

    expect(moveField(rows, "not-a-real-id", "up")).toEqual(rows);
  });
});

describe("metadata tag mapping (reused from nodeConfig)", () => {
  it("expands a field's metadata into tag rows and back, preserving key order", () => {
    const rows = configToEntries(NAME_FIELD.metadata);

    expect(rows).toEqual([{ key: "sensitivity", value: "pii" }]);
    expect(entriesToConfig(rows)).toEqual({ sensitivity: "pii" });
  });

  it("empty metadata yields no tag rows", () => {
    expect(configToEntries(ID_FIELD.metadata)).toEqual([]);
  });

  it("a blank-key tag row is dropped, mirroring config-row semantics", () => {
    const rows = [{ key: "", value: "pii" }];

    expect(entriesToConfig(rows)).toEqual({});
  });
});
