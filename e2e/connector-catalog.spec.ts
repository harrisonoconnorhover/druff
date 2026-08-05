import { expect, test } from "@playwright/test";

const ORIGIN = "http://localhost:3000";
const HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Content-Type": "application/json",
};

test("browses curated connectors and copies explicit setup steps", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: ORIGIN });
  await page.route("http://127.0.0.1:8765/v1/connectors", async (route) => {
    await route.fulfill({
      status: 200,
      headers: HEADERS,
      body: JSON.stringify({ connectors: [] }),
    });
  });
  await page.route("http://127.0.0.1:8765/v1/plugin-catalog", async (route) => {
    await route.fulfill({
      status: 200,
      headers: HEADERS,
      body: JSON.stringify({
        schema_version: 1,
        dander_version: "0.5.0",
        connectors: [
          {
            id: "salesforce",
            display_name: "Salesforce",
            description: "Bulk API Accounts ingestion.",
            distribution: "dander-connector-salesforce",
            version: "0.1.1",
            dander_specifier: ">=0.4.0,<0.6",
            compatible: true,
            support_status: "first-party-alpha",
            validation_status: "provider-validated",
            documentation_url: "https://example.test/docs/salesforce",
            pypi_url: "https://example.test/pypi/salesforce",
            repository_url: "https://example.test/repository/salesforce",
            installed: true,
            installed_version: "0.1.1",
          },
          {
            id: "servicenow",
            display_name: "ServiceNow",
            description: "Table API incident ingestion.",
            distribution: "dander-connector-servicenow",
            version: "0.1.1",
            dander_specifier: ">=0.4.0,<0.6",
            compatible: true,
            support_status: "first-party-alpha",
            validation_status: "provider-validated",
            documentation_url: "https://example.test/docs/servicenow",
            pypi_url: "https://example.test/pypi/servicenow",
            repository_url: "https://example.test/repository/servicenow",
            installed: false,
            installed_version: null,
          },
        ],
      }),
    });
  });
  await page.route("http://127.0.0.1:8765/v1/graph", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...HEADERS, ETag: '"revision-1"' },
      body: JSON.stringify({ name: "catalog-graph", nodes: [], edges: [] }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open from Dander" }).click();
  await page.getByRole("button", { name: "Browse catalog" }).click();

  await expect(page.getByText("Installed 0.1.1")).toBeVisible();
  await expect(page.getByText("Not installed")).toBeVisible();
  await page.getByLabel("Search connector catalog").fill("incident");
  await expect(page.getByRole("heading", { name: "ServiceNow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Salesforce" })).toHaveCount(0);

  await page.getByLabel("Search connector catalog").fill("");
  await page
    .getByRole("heading", { name: "Salesforce" })
    .locator("xpath=ancestor::article")
    .getByRole("button", { name: "Copy setup" })
    .click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("dander-connector-salesforce");
});
