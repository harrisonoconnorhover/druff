import { test, expect, type Page } from "@playwright/test";

/** Locates a canvas node by its visible name, scoped to `.react-flow__node` — disambiguates from
 * palette entries with the same visible text (e.g. the "Greenhouse" connector palette item). */
function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

/**
 * End-to-end editor interaction: drag Greenhouse from the palette, edit its registry-driven
 * config, and confirm the value remains in the detached local draft. Persistence to a Dander graph
 * is exercised through explicit Open/Save, not localStorage autosave. Drag/drop and real canvas
 * interaction don't run reliably under jsdom, so this stays a Playwright test.
 */
test("dragging Greenhouse from the palette creates an editable connector node", async ({
  page,
}) => {
  await page.goto("/");

  // The palette lists Greenhouse as a pre-made connector entry (DRUFF-6), distinct from the
  // draggable generic-kind entries and from any canvas node sharing the same visible name.
  const greenhousePaletteItem = page.locator('[draggable="true"]', { hasText: "Greenhouse" });
  await expect(greenhousePaletteItem).toBeVisible();

  const pane = page.locator(".react-flow__pane");
  const source = await greenhousePaletteItem.boundingBox();
  const target = await pane.boundingBox();
  if (!source || !target) throw new Error("palette item or canvas pane not found");

  // Drop away from the existing seed nodes so the new node doesn't overlap them.
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height - 40, { steps: 10 });
  await page.mouse.up();

  // A freshly-dropped connector node keeps the generic default name ("New source") but is
  // identifiable as Greenhouse via its registry-driven icon/subtitle (PipelineNode, DRUFF-6).
  const newNode = canvasNode(page, "New source");
  await expect(newNode).toBeVisible();
  await expect(newNode).toContainText("Greenhouse");

  // Select it so the inspector renders the descriptor-driven connector form (not the generic
  // key/value editor).
  await newNode.click();
  const endpointField = page.getByLabel(/endpoint/i);
  await expect(endpointField).toBeVisible();
  await expect(page.getByLabel(/dander connector/i)).toHaveValue("greenhouse_job_board");
  await expect(endpointField).toHaveValue("jobs");

  await endpointField.fill("offices");
  await expect(page.getByLabel(/endpoint/i)).toHaveValue("offices");
  await expect(page.getByText("Local draft", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save to Dander" })).toBeDisabled();
});
