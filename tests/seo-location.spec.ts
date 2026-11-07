import { expect, test } from "@playwright/test";

// Opt in: the content of these public third-party embeds changes independently.
test("live location widgets load and remain usable on mobile", async ({
  page,
}) => {
  test.skip(
    process.env.MARKETING_EMBEDS_E2E !== "1",
    "Run explicitly when checking external embeds",
  );
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/es#find-us");
  await page.locator("#find-us").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("port-weather").locator("time")).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.frameLocator('iframe[src*="maps.google.com"]').locator("body"),
  ).toContainText(/Google|Xaloc/, { timeout: 30_000 });
  await page
    .locator("#find-us")
    .screenshot({ path: ".local-preview/location-live-desktop.png" });
  await page.setViewportSize({ width: 360, height: 900 });
  await page.locator("#find-us").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .locator("#find-us")
    .screenshot({ path: ".local-preview/location-live-mobile.png" });
});
