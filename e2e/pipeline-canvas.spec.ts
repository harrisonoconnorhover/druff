import { test, expect, type Page } from "@playwright/test";

/**
 * Locates a canvas node by its visible name, scoped to `.react-flow__node` — since DRUFF-6 the
 * node palette also lists "Greenhouse" as a pre-made connector entry, so an unscoped
 * `page.getByText("Greenhouse")` matches both the seed canvas node and the palette item.
 */
function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

test("renders the pipeline canvas with its placeholder nodes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Loopback/offline mode", { exact: true })).toBeVisible();
  await expect(canvasNode(page, "Greenhouse")).toBeVisible();
  await expect(canvasNode(page, "Normalize fields")).toBeVisible();
  await expect(canvasNode(page, "BigQuery (SCD1)")).toBeVisible();
});

test("supports panning the canvas", async ({ page }) => {
  await page.goto("/");
  await expect(canvasNode(page, "Greenhouse")).toBeVisible();

  const viewport = page.locator(".react-flow__viewport");
  const before = await viewport.getAttribute("style");

  // Drag from a corner of the pane, well clear of any node, so this drags the canvas
  // (pans the viewport) rather than an individual node.
  const pane = page.locator(".react-flow__pane");
  const box = await pane.boundingBox();
  if (!box) throw new Error("canvas pane not found");

  const start = { x: box.x + 20, y: box.y + 20 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 100, start.y - 50, { steps: 10 });
  await page.mouse.up();

  const after = await viewport.getAttribute("style");
  expect(after).not.toBe(before);
});

test("dragging a palette item onto the canvas creates a new node", async ({ page }) => {
  await page.goto("/");
  await expect(canvasNode(page, "Greenhouse")).toBeVisible();

  // A brand-new "New transform" node shouldn't exist until the drop happens.
  await expect(page.getByText("New transform")).toHaveCount(0);

  const paletteItem = page.getByText("Transform", { exact: true });
  const pane = page.locator(".react-flow__pane");

  const source = await paletteItem.boundingBox();
  const target = await pane.boundingBox();
  if (!source || !target) throw new Error("palette item or canvas pane not found");

  // Playwright has no native HTML5 drag-and-drop simulation, so the drag is driven with raw
  // mouse events (down on the palette item, move over the pane, up to drop) — this is enough to
  // trigger the browser's native dragstart/dragover/drop sequence for a `draggable` element.
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
  await page.mouse.up();

  const newNode = page.getByText("New transform");
  await expect(newNode).toBeVisible();

  // The dropped node is immediately connectable: it exposes the standard handles, same as the
  // pre-seeded nodes.
  const newNodeCard = page.locator(".react-flow__node", { hasText: "New transform" });
  await expect(newNodeCard.locator(".react-flow__handle")).toHaveCount(2);
});
