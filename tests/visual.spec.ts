import { expect, test } from "@playwright/test";

test("home desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page
    .locator("#devtools-indicator, [data-next-badge-root]")
    .evaluateAll((elements) => {
      for (const element of elements) {
        if (element instanceof HTMLElement) {
          element.style.display = "none";
        }
      }
    });

  await expect(page).toHaveScreenshot("home-desktop.png", {
    fullPage: true,
  });
});
