import { describe, expect, it } from "vitest";
import {
  moveListItem,
  readWriterConfig,
  validateWriter,
  writeWriterConfig,
  WRITE_MODES,
  type WriterView,
} from "@/features/pipeline-canvas/inspector/categories/writer/writerConfig";

// Fixture values only — benign identifiers, no real/sensitive data, per steering/02-engineering.md.
const DEFAULT_VIEW: WriterView = {
  writeMode: "scd1",
  project: "",
  dataset: "",
  table: "",
  businessKey: [],
  cursorField: "",
  partitioningEnabled: false,
  partitionIngestionTime: false,
  partitionField: "",
  granularity: "day",
  requirePartitionFilter: false,
  clustering: [],
};

describe("WRITE_MODES", () => {
  it("is the closed set scd1/scd2/snapshot/incremental", () => {
    expect(WRITE_MODES.map((mode) => mode.mode)).toEqual([
      "scd1",
      "scd2",
      "snapshot",
      "incremental",
    ]);
  });

  it("requires a business key for scd1/scd2/incremental but not snapshot", () => {
    const byMode = Object.fromEntries(WRITE_MODES.map((m) => [m.mode, m.requiresBusinessKey]));
    expect(byMode).toEqual({
      scd1: true,
      scd2: true,
      snapshot: false,
      incremental: true,
    });
  });

  it("requires a cursor field only for incremental", () => {
    const byMode = Object.fromEntries(WRITE_MODES.map((m) => [m.mode, m.requiresCursor]));
    expect(byMode).toEqual({
      scd1: false,
      scd2: false,
      snapshot: false,
      incremental: true,
    });
  });
});

describe("readWriterConfig", () => {
  it("defaults every field for a config with no writer key at all", () => {
    expect(readWriterConfig(undefined)).toEqual(DEFAULT_VIEW);
    expect(readWriterConfig({})).toEqual(DEFAULT_VIEW);
  });

  it("returns the graceful default view for a garbage/legacy writer value", () => {
    expect(readWriterConfig({ writer: { not_a_writer: true } })).toEqual(DEFAULT_VIEW);
    expect(readWriterConfig({ writer: "not-an-object" })).toEqual(DEFAULT_VIEW);
  });

  it("reads a full incremental writer with a named partition field", () => {
    const view = readWriterConfig({
      writer: {
        write_mode: "incremental",
        destination: {
          project: "my-project",
          dataset: "analytics",
          table: "dim_customer",
          business_key: ["customer_id"],
        },
        cursor_field: "updated_at",
        partitioning: {
          field: "created_at",
          granularity: "month",
          require_partition_filter: true,
        },
        clustering: ["region", "segment"],
      },
    });

    expect(view).toEqual({
      writeMode: "incremental",
      project: "my-project",
      dataset: "analytics",
      table: "dim_customer",
      businessKey: ["customer_id"],
      cursorField: "updated_at",
      partitioningEnabled: true,
      partitionIngestionTime: false,
      partitionField: "created_at",
      granularity: "month",
      requirePartitionFilter: true,
      clustering: ["region", "segment"],
    });
  });

  it("treats `partitioning.field === null` as ingestion-time partitioning", () => {
    const view = readWriterConfig({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
        partitioning: { field: null, granularity: "day", require_partition_filter: false },
      },
    });

    expect(view.partitioningEnabled).toBe(true);
    expect(view.partitionIngestionTime).toBe(true);
    expect(view.partitionField).toBe("");
  });

  it("treats an absent `partitioning` as disabled", () => {
    const view = readWriterConfig({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
      },
    });

    expect(view.partitioningEnabled).toBe(false);
    expect(view.partitionIngestionTime).toBe(false);
    expect(view.granularity).toBe("day");
  });
});

describe("writeWriterConfig", () => {
  it("always emits write_mode and destination, even fully blank", () => {
    const config = writeWriterConfig(undefined, DEFAULT_VIEW);

    expect(config.writer).toEqual({
      write_mode: "scd1",
      destination: { dataset: "", table: "" },
    });
  });

  it("round-trips a fully-populated incremental writer", () => {
    const view: WriterView = {
      writeMode: "incremental",
      project: "my-project",
      dataset: "analytics",
      table: "dim_customer",
      businessKey: ["customer_id"],
      cursorField: "updated_at",
      partitioningEnabled: true,
      partitionIngestionTime: false,
      partitionField: "created_at",
      granularity: "month",
      requirePartitionFilter: true,
      clustering: ["region", "segment"],
    };

    const config = writeWriterConfig(undefined, view);

    expect(config.writer).toEqual({
      write_mode: "incremental",
      destination: {
        project: "my-project",
        dataset: "analytics",
        table: "dim_customer",
        business_key: ["customer_id"],
      },
      cursor_field: "updated_at",
      partitioning: { field: "created_at", granularity: "month", require_partition_filter: true },
      clustering: ["region", "segment"],
    });
  });

  it("omits project/business_key/cursor_field/clustering when blank", () => {
    const config = writeWriterConfig(undefined, {
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
    });

    const writer = config.writer as Record<string, unknown>;
    expect(writer).not.toHaveProperty("cursor_field");
    expect(writer).not.toHaveProperty("clustering");
    expect(writer.destination).not.toHaveProperty("project");
    expect(writer.destination).not.toHaveProperty("business_key");
  });

  it("omits partitioning entirely when disabled", () => {
    const config = writeWriterConfig(undefined, { ...DEFAULT_VIEW, partitioningEnabled: false });

    expect(config.writer).not.toHaveProperty("partitioning");
  });

  it("emits an explicit `field: null` for ingestion-time partitioning", () => {
    const config = writeWriterConfig(undefined, {
      ...DEFAULT_VIEW,
      partitioningEnabled: true,
      partitionIngestionTime: true,
      partitionField: "should-be-ignored",
    });

    expect((config.writer as { partitioning: { field: unknown } }).partitioning.field).toBeNull();
  });

  it("trims and drops blank rows from business_key/clustering, preserving order", () => {
    const config = writeWriterConfig(undefined, {
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
      businessKey: [" customer_id ", "", "region"],
      clustering: ["region", "  ", "segment"],
    });

    const writer = config.writer as {
      destination: { business_key: string[] };
      clustering: string[];
    };
    expect(writer.destination.business_key).toEqual(["customer_id", "region"]);
    expect(writer.clustering).toEqual(["region", "segment"]);
  });

  it("preserves sibling non-writer config keys and never mutates prevConfig", () => {
    const prevConfig = { some_other_key: "value" };
    const frozen = JSON.parse(JSON.stringify(prevConfig));

    const config = writeWriterConfig(prevConfig, {
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
    });

    expect(config.some_other_key).toBe("value");
    expect(prevConfig).toEqual(frozen);
  });
});

describe("readWriterConfig / writeWriterConfig round trip", () => {
  it("is stable for a fully-populated writer", () => {
    const writer = {
      write_mode: "scd2",
      destination: {
        project: "my-project",
        dataset: "analytics",
        table: "dim_customer",
        business_key: ["customer_id", "region"],
      },
      partitioning: { field: null, granularity: "hour", require_partition_filter: true },
      clustering: ["segment"],
    };

    const view = readWriterConfig({ writer });
    const rebuilt = writeWriterConfig(undefined, view);

    expect(rebuilt.writer).toEqual(writer);
  });
});

describe("validateWriter", () => {
  it("requires dataset and table", () => {
    const errors = validateWriter(DEFAULT_VIEW);
    expect(errors.dataset).toBeTruthy();
    expect(errors.table).toBeTruthy();
  });

  it("requires business_key for scd1/scd2/incremental but not snapshot", () => {
    const base = { ...DEFAULT_VIEW, dataset: "analytics", table: "dim_customer" };

    expect(validateWriter({ ...base, writeMode: "scd1" }).businessKey).toBeTruthy();
    expect(validateWriter({ ...base, writeMode: "scd2" }).businessKey).toBeTruthy();
    expect(validateWriter({ ...base, writeMode: "incremental" }).businessKey).toBeTruthy();
    expect(validateWriter({ ...base, writeMode: "snapshot" }).businessKey).toBeUndefined();
  });

  it("does not error on business_key once at least one non-blank column is present", () => {
    const base = { ...DEFAULT_VIEW, dataset: "analytics", table: "dim_customer" };

    expect(
      validateWriter({ ...base, writeMode: "scd1", businessKey: ["customer_id"] }).businessKey,
    ).toBeUndefined();
  });

  it("requires cursor_field only for incremental", () => {
    const base = {
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
      businessKey: ["customer_id"],
    };

    expect(validateWriter({ ...base, writeMode: "incremental" }).cursorField).toBeTruthy();
    expect(validateWriter({ ...base, writeMode: "scd1" }).cursorField).toBeUndefined();
    expect(validateWriter({ ...base, writeMode: "snapshot" }).cursorField).toBeUndefined();
  });

  it("errors when clustering exceeds 4 columns", () => {
    const errors = validateWriter({
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
      clustering: ["a", "b", "c", "d", "e"],
    });

    expect(errors.clustering).toMatch(/4/);
  });

  it("errors on duplicate clustering column names", () => {
    const errors = validateWriter({
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
      clustering: ["region", "region"],
    });

    expect(errors.clustering).toMatch(/duplicate/i);
  });

  it("has no clustering error for <=4 unique columns", () => {
    const errors = validateWriter({
      ...DEFAULT_VIEW,
      dataset: "analytics",
      table: "dim_customer",
      clustering: ["a", "b", "c", "d"],
    });

    expect(errors.clustering).toBeUndefined();
  });

  it("returns an empty object for a fully valid incremental writer", () => {
    expect(
      validateWriter({
        ...DEFAULT_VIEW,
        writeMode: "incremental",
        dataset: "analytics",
        table: "dim_customer",
        businessKey: ["customer_id"],
        cursorField: "updated_at",
      }),
    ).toEqual({});
  });
});

describe("moveListItem", () => {
  const items = ["a", "b", "c"];

  it("swaps an item with its previous neighbor on 'up'", () => {
    expect(moveListItem(items, 1, "up")).toEqual(["b", "a", "c"]);
  });

  it("swaps an item with its next neighbor on 'down'", () => {
    expect(moveListItem(items, 1, "down")).toEqual(["a", "c", "b"]);
  });

  it("is a no-op moving the first item up or the last item down", () => {
    expect(moveListItem(items, 0, "up")).toEqual(items);
    expect(moveListItem(items, 2, "down")).toEqual(items);
  });
});
