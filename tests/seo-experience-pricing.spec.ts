import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getMarketingPage } from "../src/content/marketing";
import { mockWeather } from "./fixtures/weather";

for (const locale of ["es", "en", "fr", "de", "nl"] as const) {
  test(`concise pricing is readable and accessible in ${locale}`, async ({
    page,
  }) => {
    await mockWeather(page);
    const model = getMarketingPage(locale, "private");
    await page.goto(model.path);
    const rule = page.locator("#experience-prices");
    const card = page.getByRole("complementary", {
      name: model.detail!.labels.reserve,
    });
    await expect(rule).toContainText(model.detail!.pricing.summary);
    await expect(rule.getByRole("table")).toHaveCount(0);
    await expect(card).toContainText(model.detail!.pricing.extraLabel);
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await rule.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await rule.boundingBox())!.height).toBeLessThan(300);
      expect(
        (await new AxeBuilder({ page }).include("#experience-prices").analyze())
          .violations,
      ).toEqual([]);
    }
    await card
      .getByRole("link", { name: model.detail!.labels.bookingCard.bookNow })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/book\\?experience=daytrip&hours=1$`),
    );
    const prices = getMarketingPage(locale, "prices");
    await page.goto(prices.path);
    await expect(page.locator("#pricing-rules h3")).toHaveCount(3);
    await expect(page.locator("#pricing-rules").getByRole("table")).toHaveCount(
      0,
    );
    await page.setViewportSize({ width: 360, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("sunrise, sunset and romantic rules show their own base and limits", async ({
  page,
}) => {
  await mockWeather(page);
  for (const key of ["sunset", "sunrise", "romantic"] as const) {
    const model = getMarketingPage("es", key);
    await page.goto(model.path);
    await expect(page.locator("#experience-prices")).toContainText(
      model.detail!.pricing.summary,
    );
  }
});
