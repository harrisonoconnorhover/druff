import { expect, test, type Page } from "@playwright/test";

const DANDER_MANIFEST = `
version: 1
platform:
  region: us-central1
pipelines:
  greenhouse_jobs:
    source: greenhouse_job_board
    models: [stg_greenhouse__jobs]
    schedule: "0 9 * * *"
    time_zone: America/New_York
    paused: false
`;

function canvasNode(page: Page, name: string) {
  return page.locator(".react-flow__node", { hasText: name });
}

test("imports dander.yaml as an editable, detached local preview", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Import Druff graph or Dander manifest file").setInputFiles({
    name: "dander.yaml",
    mimeType: "application/yaml",
    buffer: Buffer.from(DANDER_MANIFEST),
  });

  await expect(canvasNode(page, "Ingest greenhouse_job_board")).toBeVisible();
  await expect(canvasNode(page, "Build stg_greenhouse__jobs")).toBeVisible();
  await expect(page.getByText("No Dander files or cloud resources were changed.")).toBeVisible();
  await expect(page.getByText("Local draft", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save to Dander" })).toBeDisabled();
});
