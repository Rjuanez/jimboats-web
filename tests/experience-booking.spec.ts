import { test, expect } from "@playwright/test";
import { mockWeather } from "./fixtures/weather";
import AxeBuilder from "@axe-core/playwright";
import {
  marketingLocales,
  marketingPath,
} from "../src/content/marketing/routes";
import { getMarketingPage } from "../src/content/marketing";

test("all 20 detail pages have one H1, correct hierarchy, specific content and faithful review selection", async ({
  page,
}) => {
  for (const locale of marketingLocales)
    for (const key of ["private", "sunset", "sunrise", "romantic"] as const) {
      const model = getMarketingPage(locale, key);
      await page.goto(marketingPath(locale, key), {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("main h1")).toHaveText(model.title);
      await expect(page.locator("#faq details")).toHaveCount(9);
      await expect(page.locator("#find-us")).toHaveCount(0);
      await expect(
        page
          .locator("header")
          .getByRole("link", { name: model.navigation[0].label, exact: true }),
      ).toHaveAttribute("href", `/${locale}#experiences`);
      const order = await page
        .locator(
          "#experience-included, #experience-about, #experience-itinerary, #experience-audience, #reviews-title, #faq-title, #experience-gallery",
        )
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(order).toEqual([
        "experience-included",
        "experience-about",
        "experience-itinerary",
        "experience-audience",
        "reviews-title",
        "faq-title",
        "experience-gallery",
      ]);
      await expect(page.locator("#reviews blockquote")).toHaveCount(
        model.reviews.excerpts.length,
      );
      await expect(page.locator("#reviews")).toContainText(
        model.detail!.reviewsContext,
      );
      await expect(
        page.locator(
          'nav[aria-label="' +
            model.detailCopy.breadcrumbLabel +
            '"] li[aria-current="page"]',
        ),
      ).toHaveCount(1);
      const levels = await page
        .locator("main h1, main h2, main h3, main h4")
        .evaluateAll((elements) => elements.map((el) => Number(el.tagName[1])));
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(
        levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1),
      ).toBe(true);
    }
});

for (const width of [360, 1280])
  test(`original booking steps preserve selection, duration, extras and payment at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/es/book?experience=daytrip&hours=1");
    await expect(
      page.getByRole("button", { name: "1 h", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const calendar = page.locator("#public-booking-date-selection");
    const day = calendar
      .locator('button[aria-pressed="false"]:not([disabled])')
      .first();
    await day.click();
    const times = page.locator("#public-booking-time-selection");
    await times.getByRole("button").first().click();
    await page.getByRole("button", { name: "3 h", exact: true }).click();
    await expect(times).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Continuar a extras|^Continuar$/ }),
    ).toBeDisabled();
    await day.click();
    await times
      .getByRole("button", { name: "10:00 → 13:00", exact: true })
      .click();
    await page
      .getByRole("button", { name: /Continuar a extras|^Continuar$/ })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hazlo a tu manera",
    );
    await page.getByRole("button", { name: /Añadir/ }).click();
    await page
      .getByRole("button", { name: /Continuar al pago|^Continuar$/ })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Confirma tu reserva",
    );
    await expect(
      page.getByText("€320", { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /^Personas/ }).locator("option"),
    ).toHaveCount(6);
    await page
      .getByLabel("Nombre completo", { exact: true })
      .fill("Prueba local");
    await page.getByLabel("Email", { exact: true }).fill("preview@example.com");
    await page
      .getByRole("button", {
        name: width < 1024 ? /Pagar ahora/ : /Pago seguro €50/,
      })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "PRUEBA LOCAL" }),
    ).toContainText("PRUEBA LOCAL");
    await expect(
      page.getByRole("heading", { name: "Reserva confirmada", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: `.local-preview/restored-payment-${width}.png`,
      fullPage: true,
    });
  });

test("booking language changes preserve the locked experience and hours", async ({
  page,
}) => {
  await page.goto("/es/book?experience=romantic&hours=2");
  await page.getByRole("button", { name: "4 h", exact: true }).click();
  await page.getByRole("link", { name: "FR", exact: true }).click();
  await expect(page).toHaveURL(/\/fr\/book\?experience=romantic&hours=4/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Choisissez la durée et la date",
  );
  await expect(
    page.getByRole("button", { name: "4 h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: /^[56] h$/, exact: true }),
  ).toHaveCount(0);
});

test("each experience detail opens its own locked booking", async ({
  page,
}) => {
  for (const experience of getMarketingPage("es").experiences) {
    await page.goto(experience.href);
    await page
      .getByRole("link", { name: "Ver fechas y reservar", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/es/book\\?experience=${experience.bookingId}&hours=${experience.featuredHours}$`,
      ),
    );
    await expect(
      page.getByRole("button", {
        name: `${experience.featuredHours} h`,
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('section[aria-labelledby="duration-selection-title"]'),
    ).toContainText(experience.title);
  }
});

for (const width of [360, 768, 1280]) {
  test(`detail sections remain usable and price follows reviews and FAQ at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWeather(page);
    await page.goto("/es/paseo-barco-atardecer-barcelona");
    const price = page.getByRole("complementary", {
      name: "Ver fechas y reservar",
    });
    for (const id of ["reviews", "faq"]) {
      await page
        .locator(`#${id}`)
        .evaluate((element) =>
          element.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      if (width >= 1024) {
        const box = await price.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(900);
      }
    }
    await page.locator("#faq summary").first().click();
    await expect(page.locator("#faq details").first()).toHaveAttribute(
      "open",
      "",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page
      .locator("#reviews")
      .screenshot({ path: `.local-preview/detail-reviews-${width}.png` });
  });
}

test("retired experience hubs and incomplete booking entries lead to home experiences", async ({
  page,
  request,
}) => {
  for (const [locale, slug] of [
    ["es", "experiencias"],
    ["en", "experiences"],
    ["fr", "experiences"],
    ["de", "erlebnisse"],
    ["nl", "ervaringen"],
  ]) {
    const response = await request.get(`/${locale}/${slug}`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/${locale}#experiences`);
  }
  await page.goto("/es/book");
  await expect(page).toHaveURL(/\/es#experiences$/);
  await expect(page.locator("#experiences")).toBeInViewport();
  await page.goto("/es/paseo-barco-atardecer-barcelona");
  await page
    .locator("header")
    .getByRole("link", { name: "Experiencias", exact: true })
    .click();
  await expect(page).toHaveURL(/\/es#experiences$/);
  await expect(page.locator("#experiences")).toBeInViewport();
});

for (const width of [360, 768, 1280]) {
  test(`experience booking card and solar tables at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWeather(page);
    for (const key of ["private", "sunrise", "sunset", "romantic"] as const) {
      const startsAtOneHour = key === "private" || key === "romantic";
      await page.goto(marketingPath("es", key));
      const card = page.getByRole("complementary", {
        name: "Ver fechas y reservar",
      });
      await expect(card).toContainText("Mejor precio online");
      await expect(card).toContainText(
        startsAtOneHour
          ? "Bebida incluida · Aperitivo desde 2 h"
          : "Bebidas y aperitivo incluidos",
      );
      await expect(
        card.getByRole("link", { name: "Reservar por WhatsApp", exact: true }),
      ).toHaveAttribute("href", getMarketingPage("es", key).operator.whatsapp);
      await expect(
        card.getByRole("link", { name: "Reservar ahora", exact: true }),
      ).toHaveAttribute(
        "href",
        new RegExp(`hours=${startsAtOneHour ? 1 : 2}$`),
      );
      await expect(card).toContainText(
        "Si cancelamos por mal tiempo, te devolvemos el importe abonado.",
      );
      await expect(card).not.toContainText("48 horas");
      await expect(card.locator("del")).toHaveCount(0);
      const included = page.getByRole("region", {
        name: "Incluye",
        exact: true,
      });
      await expect(included).toContainText(
        startsAtOneHour ? "Aperitivo desde 2 h" : "Snacks incluidos",
      );
      if (key === "sunrise" || key === "sunset") {
        const table = page.getByRole("table", {
          name: new RegExp("horarios por mes"),
        });
        await expect(table.locator("tbody tr")).toHaveCount(12);
        await expect(
          table.getByRole("row").filter({ hasText: "junio" }),
        ).toContainText(key === "sunrise" ? "06:17" : "21:26");
        await expect(
          table.getByRole("row").filter({ hasText: "enero" }),
        ).toContainText(key === "sunrise" ? "08:15" : "17:46");
        if (key === "sunrise")
          await table.screenshot({
            path: `.local-preview/conversion-solar-${width}.png`,
          });
      }
      await card.scrollIntoViewIfNeeded();
      if (width >= 1024)
        await expect(
          card.getByRole("link", { name: "Reservar ahora", exact: true }),
        ).toBeInViewport();
      if (key === "private" || key === "sunrise" || key === "romantic")
        await card.screenshot({
          path: `.local-preview/conversion-card-${key}-${width}.png`,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  });
}

test("WhatsApp links prefill the selected experience without duration, or a generic enquiry", async ({
  page,
}) => {
  for (const key of [
    "home",
    "sunrise",
    "sunset",
    "private",
    "romantic",
  ] as const) {
    await page.goto(marketingPath("es", key));
    const links = page.locator('a[href^="https://wa.me/"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      const url = new URL((await link.getAttribute("href"))!);
      expect(url.pathname).toBe("/34669707354");
      const text = url.searchParams.get("text")!;
      if (key === "home")
        expect(text).toBe(
          "Hola, me gustaría reservar un paseo privado con JimBoats. ¿Me ayudáis a elegir experiencia y fecha?",
        );
      else {
        const title = getMarketingPage("es", key).experiences.find(
          (item) => item.id === key,
        )!.title;
        expect(text).toBe(
          `Hola, me interesa reservar: ${title}. ¿Qué disponibilidad tenéis?`,
        );
        expect(text).not.toMatch(/\d|horas?/);
      }
    }
  }
});

test("booking help sits below the first-step action and carries the chosen experience", async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/es/book?experience=daytrip&hours=1");
    const panel = page.getByRole("complementary").filter({ has: page.getByRole("link", { name: "¿Necesitas ayuda?" }) }).filter({ visible: true });
    const help = panel.getByRole("link", { name: "¿Necesitas ayuda?", exact: true });
    await expect(help).toBeVisible();
    await expect(help).toHaveAttribute("href", getMarketingPage("es", "private").operator.whatsapp);
    const cta = await panel.getByRole("button", { name: /Continuar/ }).boundingBox();
    const link = await help.boundingBox();
    expect(link!.y).toBeGreaterThanOrEqual(cta!.y + cta!.height);
  }
});
