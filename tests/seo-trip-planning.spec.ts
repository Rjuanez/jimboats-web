import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  marketingLocales,
  marketingPath,
} from "../src/content/marketing/routes";
import { mockWeather } from "./fixtures/weather";

for (const locale of marketingLocales) {
  test(`duration comparison and practical answers work in ${locale}`, async ({
    page,
  }) => {
    await mockWeather(page);
    await page.goto(marketingPath(locale, "prices"));
    const guide = page.locator("#choose-duration");
    const preparation = page.locator("#before-boarding");
    await expect(guide.getByRole("rowheader")).toHaveCount(3);
    for (const hours of [1, 2, 4]) {
      await expect(
        guide.locator(
          `a[href="/${locale}/book?experience=daytrip&hours=${hours}"]`,
        ),
      ).toHaveCount(1);
    }
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await guide.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await guide.evaluate((node) => node.scrollWidth <= node.clientWidth),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include("#choose-duration")
            .include("#before-boarding")
            .analyze()
        ).violations,
      ).toEqual([]);
      const contact = preparation.getByRole("link").first();
      await contact.scrollIntoViewIfNeeded();
      await expect(contact).toBeInViewport();
      expect((await contact.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (locale === "es" || locale === "de") {
        await guide.screenshot({
          path: `.local-preview/point13-duration-${locale}-${width}.png`,
        });
        await preparation.screenshot({
          path: `.local-preview/point13-preparation-${locale}-${width}.png`,
        });
      }
    }
    await guide
      .locator(`a[href="/${locale}/book?experience=daytrip&hours=2"]`)
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/book\\?experience=daytrip&hours=2$`),
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "2 h", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    for (const key of [
      "private",
      "sunset",
      "sunrise",
      "romantic",
      "contact",
    ] as const) {
      await page.goto(marketingPath(locale, key));
      await expect(page.locator("#before-boarding")).toHaveCount(1);
      await expect(
        page.locator(
          `a[href="${marketingPath(locale, "prices")}#choose-duration"]`,
        ),
      ).toHaveCount(1);
    }
  });
}
