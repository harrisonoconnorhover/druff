import { test, expect, type Page } from "@playwright/test";

/** Fixture-only secret *reference* string — never a real Greenhouse API key, per
 * `steering/01-security.md` (the descriptor's `harvest_api_key_ref` field stores a handle, not a
 * secret value, so this is safe to commit and to type into the form). */
const FIXTURE_API_KEY_REF = "projects/test-project/secrets/greenhouse-harvest-api-key-fixture";

/** Locates a canvas node by its visible name, scoped to `.react-flow__node` — disambiguates from
 * palette entries with the same visible text (e.g. the "Greenhouse" connector palette item). */
function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

/**
 * End-to-end round trip the ticket's Design calls out explicitly: drag Greenhouse from the palette
 * onto the canvas, edit its config in the inspector, reload the page, and confirm both the
 * connector identity and the config value survive (localStorage persistence, DRUFF-5). Drag/drop
 * and real canvas interaction don't run reliably under jsdom, so this is a Playwright test, not a
 * unit test (per `steering/languages/typescript.md`).
 */
test("dragging Greenhouse from the palette creates a connector node whose config persists across reload", async ({
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
  const apiKeyField = page.getByLabel(/harvest api key reference/i);
  await expect(apiKeyField).toBeVisible();

  await apiKeyField.fill(FIXTURE_API_KEY_REF);

  // Wait for the debounced autosave (DRUFF-5) to actually write the fixture value before reloading,
  // rather than a fixed sleep.
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("druff.graph.v1")))
    .toContain(FIXTURE_API_KEY_REF);

  await page.reload();

  const reloadedNode = canvasNode(page, "New source");
  await expect(reloadedNode).toBeVisible();
  await expect(reloadedNode).toContainText("Greenhouse");

  await reloadedNode.click();
  await expect(page.getByLabel(/harvest api key reference/i)).toHaveValue(FIXTURE_API_KEY_REF);
});
