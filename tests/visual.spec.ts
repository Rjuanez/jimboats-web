import { expect, test } from "@playwright/test";

test("home desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en", { waitUntil: "networkidle" });
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
    mask: [page.locator("img")],
    maskColor: "#e8d9be",
  });
});
