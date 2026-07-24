import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { WRITER_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/writer/category";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

const { Editor: WriterConfigEditor } = WRITER_CONFIG_CATEGORY;

// Fixture node + benign identifiers only — no real/sensitive data, per steering/02-engineering.md.
function fixtureNode(config?: Record<string, unknown>): Node<PipelineNodeData> {
  return {
    id: "n1",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: { name: "Fixture write node", type: "target", kind: "write", config },
    selected: false,
  };
}

describe("WriterConfigCategory registration", () => {
  it("matches a write-kind node and no other kind", () => {
    expect(WRITER_CONFIG_CATEGORY.matches(fixtureNode())).toBe(true);
    expect(
      WRITER_CONFIG_CATEGORY.matches({
        ...fixtureNode(),
        data: { name: "Fixture source", type: "source", kind: "source" },
      }),
    ).toBe(false);
  });
});

describe("WriterConfigEditor", () => {
  it("defaults to scd1 with blank destination for a config-less write node", () => {
    render(<WriterConfigEditor node={fixtureNode()} onConfigChange={vi.fn()} />);

    expect(screen.getByLabelText(/write mode/i)).toHaveValue("scd1");
    expect(screen.getByLabelText(/dataset/i)).toHaveValue("");
    expect(screen.getByLabelText(/table/i)).toHaveValue("");
  });

  it("renders an existing incremental writer's fields", () => {
    const node = fixtureNode({
      writer: {
        write_mode: "incremental",
        destination: { dataset: "analytics", table: "dim_customer", business_key: ["customer_id"] },
        cursor_field: "updated_at",
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(screen.getByLabelText(/write mode/i)).toHaveValue("incremental");
    expect(screen.getByLabelText(/dataset/i)).toHaveValue("analytics");
    expect(screen.getByLabelText(/table/i)).toHaveValue("dim_customer");
    expect(screen.getByLabelText(/cursor field/i)).toHaveValue("updated_at");
    expect(screen.getByLabelText("Business key column 1")).toHaveValue("customer_id");
  });

  it("typing dataset/table calls onConfigChange with a clean payload", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<WriterConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.type(screen.getByLabelText(/dataset/i), "analytics");
    await user.type(screen.getByLabelText(/table/i), "dim_customer");

    expect(onConfigChange).toHaveBeenLastCalledWith({
      writer: { write_mode: "scd1", destination: { dataset: "analytics", table: "dim_customer" } },
    });
  });

  it("shows an actionable inline message for empty business_key on scd1", () => {
    const node = fixtureNode({
      writer: { write_mode: "scd1", destination: { dataset: "analytics", table: "dim_customer" } },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(screen.getByText(/business key column is required/i)).toBeInTheDocument();
  });

  it("does not show a business_key error for snapshot mode", async () => {
    const user = userEvent.setup();
    const node = fixtureNode({
      writer: { write_mode: "scd1", destination: { dataset: "analytics", table: "dim_customer" } },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText(/write mode/i), "snapshot");

    expect(screen.queryByText(/business key column is required/i)).not.toBeInTheDocument();
  });

  it("adding a business key column writes it under destination.business_key", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({
      writer: { write_mode: "scd1", destination: { dataset: "analytics", table: "dim_customer" } },
    });
    render(<WriterConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getByRole("button", { name: /add business key column/i }));
    await user.type(screen.getByLabelText("Business key column 1"), "customer_id");

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        writer: expect.objectContaining({
          destination: expect.objectContaining({ business_key: ["customer_id"] }),
        }),
      }),
    );
  });

  it("shows an actionable inline message for a blank cursor_field on incremental", () => {
    const node = fixtureNode({
      writer: {
        write_mode: "incremental",
        destination: { dataset: "analytics", table: "dim_customer", business_key: ["customer_id"] },
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(screen.getByText(/cursor field is required/i)).toBeInTheDocument();
  });

  it("enabling partitioning and choosing ingestion-time writes field: null", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getByLabelText(/enable partitioning/i));
    await user.click(screen.getByLabelText(/ingestion-time partitioning/i));

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        writer: expect.objectContaining({
          partitioning: { field: null, granularity: "day", require_partition_filter: false },
        }),
      }),
    );
  });

  it("changing granularity and require_partition_filter reflects in the written config", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
        partitioning: { field: "created_at", granularity: "day", require_partition_filter: false },
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.selectOptions(screen.getByLabelText(/granularity/i), "month");
    await user.click(screen.getByLabelText(/require partition filter/i));

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        writer: expect.objectContaining({
          partitioning: {
            field: "created_at",
            granularity: "month",
            require_partition_filter: true,
          },
        }),
      }),
    );
  });

  it("adding a 5th clustering column shows the max-columns error", async () => {
    const user = userEvent.setup();
    const node = fixtureNode({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
        clustering: ["a", "b", "c", "d"],
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add clustering column/i }));
    await user.type(screen.getByLabelText("Clustering column 5"), "e");

    expect(screen.getByText(/limited to 4 columns/i)).toBeInTheDocument();
  });

  it("a duplicate clustering column shows the duplicate error", async () => {
    const user = userEvent.setup();
    const node = fixtureNode({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
        clustering: ["region"],
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add clustering column/i }));
    await user.type(screen.getByLabelText("Clustering column 2"), "region");

    expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
  });

  it("reordering clustering columns moves the value, reflected in onConfigChange", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({
      writer: {
        write_mode: "snapshot",
        destination: { dataset: "analytics", table: "dim_customer" },
        clustering: ["region", "segment"],
      },
    });
    render(<WriterConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getAllByLabelText(/move clustering column down/i)[0]);

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        writer: expect.objectContaining({ clustering: ["segment", "region"] }),
      }),
    );
  });
});
