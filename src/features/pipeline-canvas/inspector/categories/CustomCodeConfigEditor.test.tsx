import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomCodeConfigEditor } from "@/features/pipeline-canvas/inspector/categories/CustomCodeConfigEditor";
import type { MonacoCodeEditorProps } from "@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor";

// `MonacoCodeEditor` is mocked to a plain textarea — jsdom can't run real Monaco, and exercising
// the real editor/highlighting is Playwright/e2e territory, not this ticket's AC6 target (this
// ticket's Design "Test seams"). This also keeps this suite free of the `next/dynamic`
// chunk-loading indirection `CustomCodeConfigEditor` wraps the real widget in.
vi.mock("@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor", () => ({
  MonacoCodeEditor: ({ language, value, onChange }: MonacoCodeEditorProps) => (
    <textarea
      aria-label={`${language} code`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("CustomCodeConfigEditor", () => {
  it("renders empty code and no parameters for a config-less node", async () => {
    render(<CustomCodeConfigEditor language="python" config={undefined} onChange={vi.fn()} />);

    expect(await screen.findByLabelText("python code")).toHaveValue("");
    expect(screen.getByText("No parameters yet.")).toBeInTheDocument();
  });

  it("shows the node's existing code and parameters", async () => {
    const config = {
      code: "SELECT * FROM upstream",
      parameters: [{ name: "window_days" }, { name: "region" }],
    };

    render(<CustomCodeConfigEditor language="sql" config={config} onChange={vi.fn()} />);

    expect(await screen.findByLabelText("sql code")).toHaveValue("SELECT * FROM upstream");
    expect(screen.getByLabelText("Parameter 1 name")).toHaveValue("window_days");
    expect(screen.getByLabelText("Parameter 2 name")).toHaveValue("region");
  });

  it("editing the code calls onChange with the updated config", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CustomCodeConfigEditor language="python" config={undefined} onChange={onChange} />);

    await user.type(await screen.findByLabelText("python code"), "x");

    expect(onChange).toHaveBeenLastCalledWith({ code: "x", parameters: [] });
  });

  it("adding a parameter row then naming it persists a new parameter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CustomCodeConfigEditor language="sql" config={{ code: "SELECT 1" }} onChange={onChange} />,
    );
    await screen.findByLabelText("sql code");

    await user.click(screen.getByRole("button", { name: /add parameter/i }));
    await user.type(screen.getByLabelText("Parameter 1 name"), "region");

    expect(onChange).toHaveBeenLastCalledWith({
      code: "SELECT 1",
      parameters: [{ name: "region" }],
    });
  });

  it("removing a parameter row persists the config without it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const config = { code: "x", parameters: [{ name: "a" }, { name: "b" }] };
    render(<CustomCodeConfigEditor language="python" config={config} onChange={onChange} />);
    await screen.findByLabelText("python code");

    await user.click(screen.getAllByRole("button", { name: /remove parameter/i })[0]);

    expect(onChange).toHaveBeenLastCalledWith({ code: "x", parameters: [{ name: "b" }] });
  });

  it("a not-yet-named parameter row survives being added without being dropped immediately", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CustomCodeConfigEditor language="python" config={undefined} onChange={onChange} />);
    await screen.findByLabelText("python code");

    await user.click(screen.getByRole("button", { name: /add parameter/i }));

    expect(screen.getByLabelText("Parameter 1 name")).toHaveValue("");
    // Blank row hasn't been named yet and there's no code either, so the persisted config has
    // both keys omitted — but the row itself is still on screen (not dropped from local state) so
    // the user can still type a name.
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("clearing all code and parameters omits both config keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const config = { code: "old", parameters: [{ name: "a" }] };
    render(<CustomCodeConfigEditor language="sql" config={config} onChange={onChange} />);

    const textarea = await screen.findByLabelText("sql code");
    await user.clear(textarea);
    await user.click(screen.getByRole("button", { name: /remove parameter/i }));

    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("preserves unrelated config keys on every edit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const config = { endpoint: "/x", code: "y" };
    render(<CustomCodeConfigEditor language="python" config={config} onChange={onChange} />);

    await user.type(await screen.findByLabelText("python code"), "!");

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ endpoint: "/x" }));
  });
});
