import { test, expect, type Page } from "@playwright/test";

/**
 * DRUFF-16: the inline validation surface. Real drag/connect canvas interaction, so this is
 * Playwright rather than a jsdom unit test (`steering/languages/typescript.md`).
 */
function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

test("the seed graph is clean, and a self-loop connection is flagged inline on the node and edge", async ({
  page,
}) => {
  await page.goto("/");
  const greenhouseNode = canvasNode(page, "Greenhouse");
  await expect(greenhouseNode).toBeVisible();

  // A valid graph shows no violation markers anywhere on the canvas (AC5) — there is no separate
  // error log/panel to check instead (AC2).
  await expect(page.getByRole("button", { name: /validation/ })).toHaveCount(0);

  const sourceHandle = greenhouseNode.locator(".react-flow__handle-right");
  const targetHandle = greenhouseNode.locator(".react-flow__handle-left");
  const from = await sourceHandle.boundingBox();
  const to = await targetHandle.boundingBox();
  if (!from || !to) throw new Error("handle not found");

  // Drag from the node's own source handle back onto its own target handle: a self-loop
  // connection, one of DRUFF-15's structural violation kinds.
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
  await page.mouse.up();

  // The self-loop is surfaced on both the node and the edge (AC1/AC2) — two markers, not a
  // separate log entry. The edge's marker renders via `EdgeLabelRenderer`'s portal, near the
  // node's own corner badge for a self-loop, so the node's marker is hovered scoped to the node's
  // own DOM subtree to avoid ambiguity with the (visually adjacent) edge marker.
  await expect(page.getByRole("button", { name: "1 validation issue" })).toHaveCount(2);
  const nodeMarker = greenhouseNode.getByRole("button", { name: "1 validation issue" });
  await expect(nodeMarker).toBeVisible();

  // The message is actionable and structural (node name/id only), never a stack trace.
  await nodeMarker.hover({ force: true });
  await expect(page.getByText(/has an edge that connects to itself/)).toBeVisible();
});
