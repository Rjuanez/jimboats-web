import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
