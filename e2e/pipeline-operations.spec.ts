import { expect, test } from "@playwright/test";

const ORIGIN = "http://localhost:3000";
const HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-Match",
  "Access-Control-Expose-Headers": "ETag",
  "Content-Type": "application/json",
};

test("authors and saves Dander-advertised operations on a canonical transform", async ({
  page,
}) => {
  let savedGraph: Record<string, unknown> | null = null;
  await page.route("http://127.0.0.1:8765/v1/operations", async (route) => {
    await route.fulfill({
      status: 200,
      headers: HEADERS,
      body: JSON.stringify({
        schema_version: 1,
        operations: [
          {
            kind: "trim_whitespace",
            display_name: "Trim whitespace",
            description: "Remove leading and trailing whitespace from a string field.",
            parameters: [
              { name: "field", display_name: "Field", control: "field", required: true },
            ],
          },
        ],
      }),
    });
  });
  await page.route("http://127.0.0.1:8765/v1/graph", async (route) => {
    if (route.request().method() === "PUT") {
      savedGraph = route.request().postDataJSON() as Record<string, unknown>;
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
      body: JSON.stringify({
        name: "normalize-accounts",
        nodes: [
          {
            id: "normalize",
            type: "transform",
            name: "Normalize accounts",
            config: { sql: "select name from source" },
            fields: [{ name: "name", type: "STRING" }],
            visual: { position: { x: 300, y: 200 } },
          },
        ],
        edges: [],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open from Dander" }).click();
  await page.locator(".react-flow__node", { hasText: "Normalize accounts" }).click();
  await expect(page.getByText("Ordered operations", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Save to Dander" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  expect(savedGraph).not.toBeNull();
  const nodes = savedGraph!.nodes as Array<Record<string, unknown>>;
  expect(nodes[0]).toMatchObject({
    config: {
      sql: "select name from source",
      operations: [{ kind: "trim_whitespace", params: { field: "name" }, metadata: {} }],
    },
  });
});
