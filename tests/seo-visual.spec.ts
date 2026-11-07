import { mockWeather } from "./fixtures/weather";
import { expect, test } from "@playwright/test";

for (const width of [360, 1280]) {
  for (const [name, path] of [
    ["home", "/es"],
    ["experience", "/es/paseo-privado-barco-barcelona"],
    ["sunrise", "/es/paseo-barco-amanecer-barcelona"],
  ]) {
    test(`SEO ${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mockWeather(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.addStyleTag({
        content: "nextjs-portal { display: none !important; }",
      });
      if (name === "home") {
        // Visit the below-the-fold guide images before the full-page capture.
        await page.locator("#blog").scrollIntoViewIfNeeded();
      }
      await page.locator("img").evaluateAll(async (images) => {
        await Promise.all(
          images.map(async (image) => {
            if (image instanceof HTMLImageElement) {
              image.loading = "eager";
              await image.decode();
            }
          }),
        );
      });
      if (name === "home") {
        // Check the photos in their own viewport capture: Chromium can omit
        // offscreen image layers in this very tall full-page screenshot.
        await expect(page.locator("#blog")).toHaveScreenshot(
          `seo-home-guides-${width}.png`,
          { animations: "disabled" },
        );
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page).toHaveScreenshot(`seo-${name}-${width}.png`, {
        fullPage: true,
        mask: [
          page.locator("iframe"),
          ...(name === "home" ? [page.locator("#blog img")] : []),
        ],
        maskColor: "#e8d9be",
        animations: "disabled",
      });
      if (name === "home") {
        await page.locator("#find-us").scrollIntoViewIfNeeded();
        await page
          .locator("#find-us")
          .screenshot({ path: `.local-preview/location-${name}-${width}.png` });
      }
      await page
        .locator("#faq")
        .screenshot({ path: `.local-preview/faq-${name}-${width}.png` });
    });
  }
}
