import { test, expect } from "@playwright/test";

test("renders the pipeline canvas with its placeholder nodes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Greenhouse")).toBeVisible();
  await expect(page.getByText("Normalize fields")).toBeVisible();
  await expect(page.getByText("BigQuery (SCD1)")).toBeVisible();
});

test("supports panning the canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Greenhouse")).toBeVisible();

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
