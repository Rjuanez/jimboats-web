import type { Page } from "@playwright/test";
import {
  presentWeather,
  presentSunTimes,
} from "../../src/interface/next/presenters/weatherView";
import { marketingLocales } from "../../src/content/marketing/routes";

export async function mockWeather(page: Page) {
  await page.route("**/api/weather?*", async (route) => {
    const locale =
      marketingLocales.find(
        (value) =>
          value === new URL(route.request().url()).searchParams.get("locale"),
      ) ?? "es";
    if (new URL(route.request().url()).searchParams.get("view") === "sun") {
      await route.fulfill({
        json: {
          sun: presentSunTimes(
            {
              date: "2026-11-03",
              sunrise: "2026-11-03T06:24+00:00",
              sunset: "2026-11-03T16:44+00:00",
            },
            locale,
          ),
        },
      });
      return;
    }
    await route.fulfill({
      json: {
        weather: presentWeather(
          {
            time: "2026-11-02T12:00:00Z",
            temperatureC: 19,
            windKmh: 11,
            humidityPercent: 68,
            condition: "partlyCloudy",
            night: false,
          },
          locale,
        ),
      },
    });
  });
}
