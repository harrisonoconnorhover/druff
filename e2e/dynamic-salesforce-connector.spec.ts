import { expect, test, type Page } from "@playwright/test";

const ORIGIN = "http://localhost:3000";
const HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-Match",
  "Access-Control-Expose-Headers": "ETag",
  "Content-Type": "application/json",
};

function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

test("discovers Salesforce and saves its canonical Dander source binding", async ({ page }) => {
  let savedGraph: Record<string, unknown> | null = null;
  await page.route("http://127.0.0.1:8765/v1/connectors", async (route) => {
    await route.fulfill({
      status: 200,
      headers: HEADERS,
      body: JSON.stringify({
        connectors: [
          {
            id: "salesforce",
            display_name: "Salesforce",
            engine: "salesforce_bulk2",
            description: "Read Accounts.",
            plugin: {
              id: "salesforce",
              distribution: "dander-connector-salesforce",
              version: "0.1.0rc1",
            },
            endpoints: [
              {
                id: "accounts",
                display_name: "Accounts",
                graph_binding: { connector: "salesforce", endpoint: "accounts" },
                fields: [
                  { name: "Id", display_name: "ID", data_type: "STRING", required: true },
                  {
                    name: "SystemModstamp",
                    display_name: "System modification stamp",
                    data_type: "TIMESTAMP",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      }),
    });
  });
  await page.route("http://127.0.0.1:8765/v1/graph", async (route) => {
    const request = route.request();
    if (request.method() === "PUT") {
      savedGraph = request.postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        headers: { ...HEADERS, ETag: '"revision-2"' },
        body: JSON.stringify(savedGraph),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { ...HEADERS, ETag: '"revision-1"' },
      body: JSON.stringify({ name: "salesforce-graph", nodes: [], edges: [] }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open from Dander" }).click();

  const paletteItem = page.locator('[draggable="true"]', { hasText: "Salesforce" });
  await expect(paletteItem).toBeVisible();
  const pane = page.locator(".react-flow__pane");
  const source = await paletteItem.boundingBox();
  const target = await pane.boundingBox();
  if (!source || !target) throw new Error("palette item or canvas pane not found");

  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
  await page.mouse.up();

  const newNode = canvasNode(page, "New source");
  await expect(newNode).toContainText("Salesforce");
  await newNode.click();
  await expect(page.getByLabel(/dander connector/i)).toHaveValue("salesforce");
  await expect(page.getByLabel(/endpoint/i)).toHaveValue("accounts");

  await page.getByRole("button", { name: "Save to Dander" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  expect(savedGraph).not.toBeNull();
  const nodes = savedGraph!.nodes as Array<Record<string, unknown>>;
  expect(nodes[0]).toMatchObject({
    type: "source",
    config: { connector: "salesforce", endpoint: "accounts" },
    fields: [
      { name: "Id", type: "STRING", nullable: false },
      { name: "SystemModstamp", type: "TIMESTAMP", nullable: false },
    ],
  });
});
