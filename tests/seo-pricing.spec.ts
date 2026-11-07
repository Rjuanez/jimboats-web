import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockWeather } from "./fixtures/weather";

for (const locale of ["es", "en", "fr", "de", "nl"]) {
  test(`pricing tables stay readable and accessible in ${locale}`, async ({
    page,
  }) => {
    await mockWeather(page);
    await page.goto(`/${locale}#prices`);
    const section = page.locator("#prices");
    // Preserve the indexed legacy anchor without restoring the old photo gallery.
    await expect(page.locator("#gallery")).toHaveCount(1);
    const tables = section.getByRole("table");
    await expect(tables).toHaveCount(2);
    await expect(tables.nth(0).getByRole("rowheader")).toHaveCount(4);
    await expect(tables.nth(1).getByRole("rowheader")).toHaveCount(3);
    await expect(tables.nth(1)).toContainText(/20/);
    const firstLink = tables.nth(0).getByRole("link").first();
    const detail = await firstLink.getAttribute("href");
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await section.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const table of await tables.all()) {
        expect(
          await table.evaluate((node) => node.scrollWidth <= node.clientWidth),
        ).toBe(true);
      }
      expect(
        (await new AxeBuilder({ page }).include("#prices").analyze())
          .violations,
      ).toEqual([]);
      if (locale === "es")
        await section.screenshot({
          path: `.local-preview/pricing-${width}.png`,
        });
    }
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${detail}$`));
  });
}
