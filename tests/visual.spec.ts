import { expect, test, type Page } from "@playwright/test";

async function hideDevelopmentIndicators(page: Page) {
  await page
    .locator("#devtools-indicator, [data-next-badge-root]")
    .evaluateAll((elements) => {
      for (const element of elements) {
        if (element instanceof HTMLElement) {
          element.style.display = "none";
        }
      }
    });
}

test("home desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto("/en", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("home-desktop.png", {
    fullPage: true,
    mask: [page.locator("img")],
    maskColor: "#e8d9be",
  });
});

test("admin experiences desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto("/admin/experiences", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-experiences-desktop.png", {
    fullPage: true,
    mask: [page.locator("img")],
    maskColor: "#e2e8f0",
  });
});

test("admin experiences mobile visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto("/admin/experiences", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-experiences-mobile.png", {
    fullPage: true,
    mask: [page.locator("img")],
    maskColor: "#e2e8f0",
  });
});

test("admin experience detail desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto("/admin/experiences/sunset-experience", {
    waitUntil: "networkidle",
  });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-experience-detail-desktop.png", {
    fullPage: true,
    mask: [page.locator("img")],
    maskColor: "#e2e8f0",
  });
});
