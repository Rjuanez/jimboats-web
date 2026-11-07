import { mockWeather } from "./fixtures/weather";
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
  await mockWeather(page);
  await page.goto("/en", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("home-desktop.png", {
    fullPage: true,
    animations: "disabled",
    mask: [page.locator("img"), page.locator("iframe")],
    maskColor: "#e8d9be",
    maxDiffPixelRatio: 0.02,
  });
});

test("admin calendar desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await mockWeather(page);
  await page.goto("/admin/calendar", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-calendar-desktop.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixels: 2,
  });
});

test("admin bookings desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await mockWeather(page);
  await page.goto("/admin/bookings", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-bookings-desktop.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixels: 2,
  });
});

test("admin booking detail desktop visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await mockWeather(page);
  await page.goto("/admin/bookings/booking-preview-1", {
    waitUntil: "networkidle",
  });
  await hideDevelopmentIndicators(page);

  await expect(page).toHaveScreenshot("admin-booking-detail-desktop.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixels: 2,
  });
});

test("admin bookings mobile visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await mockWeather(page);
  await page.goto("/admin/bookings", { waitUntil: "networkidle" });
  await hideDevelopmentIndicators(page);
  await expect(page).toHaveScreenshot("admin-bookings-mobile.png", {
    fullPage: true,
    animations: "disabled",
  });
});
