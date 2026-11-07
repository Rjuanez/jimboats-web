import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockWeather } from "./fixtures/weather";

for (const [locale, title, wind, condition] of [
  ["es", "El tiempo en el puerto", "Viento", "Parcialmente nuboso"],
  ["en", "Weather at the harbour", "Wind", "Partly cloudy"],
  ["fr", "La météo au port", "Vent", "Partiellement nuageux"],
  ["de", "Wetter am Hafen", "Wind", "Teilweise bewölkt"],
  ["nl", "Het weer in de haven", "Wind", "Gedeeltelijk bewolkt"],
]) {
  test(`localized weather ${locale}, mobile and desktop`, async ({ page }) => {
    await mockWeather(page);
    await page.goto(`/${locale}#find-us`);
    const card = page.getByTestId("port-weather");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(title);
    await expect(card).toContainText(condition);
    await expect(card).toContainText(wind);
    await expect(card.locator("time")).toContainText("13:00");
    await expect(card.locator("iframe")).toHaveCount(0);
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await card.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="port-weather"]')
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
test("unavailable weather stays translated and shows no made-up readings", async ({
  page,
}) => {
  await page.route("**/api/weather?*", (route) =>
    route.fulfill({ status: 503, json: { weather: null } }),
  );
  await page.goto("/es#find-us");
  const card = page.getByTestId("port-weather");
  await expect(card).toContainText("La previsión no está disponible ahora.");
  await expect(card.locator("time")).toHaveCount(0);
  await expect(card.locator("dd").first()).toHaveText("—");
});

test("experience solar times are localized, current-day readings rather than departure times", async ({
  page,
}) => {
  await mockWeather(page);
  for (const [locale, slug, label, time] of [
    ["es", "paseo-barco-atardecer-barcelona", "Puesta de sol (hoy):", "17:44"],
    ["es", "paseo-barco-amanecer-barcelona", "Salida del sol (hoy):", "07:24"],
    ["en", "sunset-boat-trip-barcelona", "Sunset (today):", "17:44"],
    [
      "fr",
      "bateau-lever-soleil-barcelone",
      "Lever du soleil (aujourd’hui):",
      "07:24",
    ],
    [
      "de",
      "bootstour-sonnenuntergang-barcelona",
      "Sonnenuntergang (heute):",
      "17:44",
    ],
    ["nl", "boottocht-zonsopgang-barcelona", "Zonsopgang (vandaag):", "07:24"],
  ]) {
    await page.goto(`/${locale}/${slug}`);
    const line = page.locator("p").filter({ hasText: label });
    await expect(line.locator("time")).toHaveText(time);
    await expect(line).not.toContainText(/90|30/);
  }
});

test("unavailable solar times never display invented hours", async ({
  page,
}) => {
  await page.route("**/api/weather?*", (route) =>
    route.fulfill({ status: 503, json: { sun: null } }),
  );
  await page.goto("/es/paseo-barco-amanecer-barcelona");
  const line = page.locator("p").filter({ hasText: "Salida del sol (hoy):" });
  await expect(line).toContainText("Hora no disponible");
  await expect(line.locator("time")).toHaveCount(0);
});
