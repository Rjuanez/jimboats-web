import { getMarketingPage } from "../src/content/marketing";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  marketingLocales,
  marketingPath,
  pageKeys,
} from "../src/content/marketing/routes";

test("all 45 marketing pages expose HTML, metadata and valid internal translations", async ({
  request,
}) => {
  for (const locale of marketingLocales)
    for (const key of pageKeys) {
      const path = marketingPath(locale, key);
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<html lang="${locale}"`);
      expect((html.match(/<h1(?:\s|>)/g) || []).length, path).toBe(1);
      expect(html).toContain(`href="https://jimboatscharter.com${path}"`);
      expect(html).toContain("application/ld+json");
      expect(html).not.toMatch(/rel="canonical" href="http:\/\/localhost/);
    }
});

test("detail selects the experience and the original checkout owns duration", async ({
  page,
}) => {
  await page.goto("/es/paseo-privado-barco-barcelona");
  await expect(page.locator("h1")).toContainText("120");
  await expect(
    page
      .getByRole("navigation", { name: "Ruta de navegación" })
      .getByRole("link", { name: "Experiencias", exact: true }),
  ).toHaveAttribute("href", "/es#experiences");
  await page
    .getByRole("link", { name: "Ver fechas y reservar", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/experience=daytrip&hours=1/);
  await expect(
    page.getByRole("button", { name: "1 h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("combobox", { name: /Experiencia/ })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "5 h", exact: true }).click();
  await expect(page).toHaveURL(/experience=daytrip&hours=5/);
  await expect(
    page.getByRole("button", { name: "5 h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: /Elige tu fecha/ }),
  ).toBeVisible();
});

test("translated switch retains the same experience", async ({ page }) => {
  await page.goto("/es/paseo-barco-atardecer-barcelona");
  await page
    .getByRole("navigation", { name: "Idioma" })
    .getByRole("link", { name: "DE", exact: true })
    .click();
  await expect(page).toHaveURL(/\/de\/bootstour-sonnenuntergang-barcelona$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("capacity and minimum durations agree across landing, details and booking", async ({
  page,
}) => {
  await page.goto("/es");
  await expect(
    page.locator("#experiences").getByText("Hasta 6 personas", { exact: true }),
  ).toHaveCount(4);
  await expect(page.locator("#extras")).not.toContainText("Por confirmar");
  await expect(
    page.locator("#faq").getByRole("link", { name: "Hablar por WhatsApp" }),
  ).toHaveCount(0);
  for (const slug of ["atardecer", "amanecer", "romantico"]) {
    const minimum = slug === "romantico" ? 1 : 2;
    await page.goto(`/es/paseo-barco-${slug}-barcelona`);
    await expect(
      page
        .getByRole("link", { name: "Ver fechas y reservar", exact: true })
        .first(),
    ).toHaveAttribute("href", new RegExp(`hours=${minimum}$`));
    await expect(page.locator("h1")).toContainText(`${minimum} ${minimum === 1 ? "hora" : "horas"}`);
  }
  await expect(page.getByRole("region", { name: "Incluye", exact: true })).toContainText("Decoración de las fotos incluida");
  await expect(page.getByRole("link", { name: /Planes románticos en Barcelona/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Dónde ver el atardecer en Barcelona/ })).toBeVisible();
  await page.goto("/es/book?experience=romantic&hours=1");
  await expect(
    page.getByRole("button", { name: "1 h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: /^[56] h$/, exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: /Experiencia/ })).toHaveCount(
    0,
  );
});

for (const width of [360, 768, 1280])
  test(`marketing layout and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/es",
      "/de/bootstour-sonnenuntergang-barcelona",
      "/fr/tarifs",
      "/nl/book?experience=romantic&hours=4",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true);
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations, path).toEqual([]);
    }
  });

test("sitemap and preview robots are intentional; unknown page is 404", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect((xml.match(/<loc>/g) || []).length).toBe(105);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  expect((await request.get("/es/no-such-experience")).status()).toBe(404);
});

test("featured duration flows into booking and FAQs work with a keyboard", async ({
  page,
}) => {
  await page.goto("/es");
  for (const [id, price] of [
    ["private", "120"],
    ["sunset", "220"],
    ["sunrise", "220"],
    ["romantic", "250"],
  ]) {
    await expect(page.locator(`#experience-${id}`)).toContainText(price);
    await expect(page.locator(`#experience-${id}`)).toContainText("Desde");
  }
  const question = page
    .locator("#faq summary")
    .filter({ hasText: "¿Necesito licencia" });
  await question.press("Enter");
  await expect(
    page.getByText("No necesitas licencia ni experiencia navegando.", {
      exact: false,
    }),
  ).toBeVisible();
  await question.press("Enter");
  await expect(
    page.getByText("No necesitas licencia ni experiencia navegando.", {
      exact: false,
    }),
  ).not.toBeVisible();
  await expect(page.locator("#find-us iframe")).toHaveCount(1);
  for (const frame of await page.locator("#find-us iframe").all()) {
    await expect(frame).toHaveAttribute("loading", "lazy");
    await expect(frame).toHaveAttribute("title", /.+/);
  }
  await page.locator("#experience-private").getByRole("link").click();
  await expect(page.locator("h1")).toContainText("120");
  await expect(
    page
      .getByRole("link", { name: "Ver fechas y reservar", exact: true })
      .first(),
  ).toHaveAttribute("href", /hours=1$/);
});

for (const width of [360, 768, 1280])
  test(`Editorial reviews can be browsed and translated at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/es");
    const section = page.locator("#reviews");
    const track = section.getByRole("list");
    const previous = section.getByRole("button", { name: "Opinión anterior" });
    const next = section.getByRole("button", { name: "Siguiente opinión" });
    expect(await track.getByRole("listitem").count()).toBeGreaterThanOrEqual(8);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "El mar se disfruta. Y se cuenta.",
    );
    await expect(section.getByRole("heading")).toHaveCount(1);
    const first = track.getByRole("listitem").first();
    await expect(first.locator('blockquote[lang="es"]')).toContainText(
      "Desde el momento en que subimos a bordo",
    );
    await expect(first.locator("blockquote")).toHaveCount(1);
    await first
      .getByRole("button", { name: "Ver extracto original" })
      .press("Enter");
    await expect(first.locator('blockquote[lang="en"]')).toContainText(
      "From the moment we stepped on board, Victor made the whole experience feel personal, relaxed and completely bespoke.",
    );
    await expect(first).toContainText("Extracto original · inglés");
    await expect(first.locator('blockquote[lang="es"]')).toHaveCount(0);
    await expect(track.getByRole("listitem").nth(1)).toContainText(
      "Extracto traducido al español",
    );
    await first.getByRole("button", { name: "Ver traducción" }).press("Enter");
    await expect(first.locator('blockquote[lang="es"]')).toBeVisible();
    await expect(
      track.getByRole("link", { name: "Leer en GetYourGuide" }).first(),
    ).toHaveAttribute("href", /getyourguide\.com.*#reloadable-review-card-/);
    await expect(
      track.getByRole("link", { name: "Leer en Google Maps" }).first(),
    ).toHaveAttribute("href", "https://share.google/VCXHQNiEvhbq4R1nY");
    await expect(
      track.getByRole("link", { name: "Leer en Click&Boat" }).first(),
    ).toHaveAttribute(
      "href",
      /clickandboat\.com\/es\/activities\/barcelona\/.*33336$/,
    );
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await next.click();
    await expect(previous).toBeEnabled();
    await track.press("ArrowLeft");
    await expect(previous).toBeDisabled();
    await track.press("End");
    await expect(next).toBeDisabled();
    await track.press("Home");
    await expect(previous).toBeDisabled();
    await expect(section).toContainText("48 opiniones en");
    await expect(
      section.getByRole("link", { name: "Google (35)", exact: true }),
    ).toHaveAttribute("href", "https://share.google/VCXHQNiEvhbq4R1nY");
    await expect(
      section.getByRole("link", { name: "GetYourGuide (6)", exact: true }),
    ).toHaveAttribute("href", /getyourguide\.com/);
    await expect(
      section.getByRole("link", { name: "Click&Boat (7)", exact: true }),
    ).toHaveAttribute("href", /clickandboat\.com/);
    const visibleCards = await track.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return [...element.children].filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
      }).length;
    });
    expect(visibleCards).toBe(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await section.getByRole("heading").click();
    await section.screenshot({ path: `.local-preview/reviews-${width}.png` });
  });

test("English reviews keep the customer's own words without summaries or a redundant translation switch", async ({
  page,
}) => {
  await page.goto("/en");
  const section = page.locator("#reviews");
  await expect(section.locator('blockquote[lang="en"]')).toHaveCount(8);
  await expect(
    section.getByRole("button", { name: "View original excerpt" }),
  ).toHaveCount(0);
  await expect(section).not.toContainText("Review summary");
  await expect(section.locator("blockquote").first()).toHaveText(
    "«From the moment we stepped on board, Victor made the whole experience feel personal, relaxed and completely bespoke.»",
  );
});

test("WhatsApp pulse respects reduced motion and rating fits mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/es");
  const rating = page.getByText("5,0★ Google Maps (35 reseñas)", {
    exact: true,
  });
  await expect(rating).toBeVisible();
  expect(
    await rating.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  const whatsapp = page
    .getByRole("navigation", { name: "Hablar por WhatsApp", exact: true })
    .getByRole("link");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(
    await whatsapp.evaluate(
      (node) => getComputedStyle(node, "::before").animationDuration,
    ),
  ).toBe("2s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await whatsapp.evaluate(
      (node) => getComputedStyle(node, "::before").animationName,
    ),
  ).toBe("none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("menu links reach the home sections from a detail page and preserve language", async ({ page }) => {
  for (const locale of ["es", "en", "fr", "de", "nl"] as const) {
    const model = getMarketingPage(locale, "sunrise");
    await page.goto(model.path);
    const links = page.locator("header nav").first().getByRole("link");
    for (const [index, section] of ["experiences", "prices", "boat", "find-us"].entries()) {
      await expect(links.nth(index)).toHaveAttribute("href", `/${locale}#${section}`);
    }
    await page.goto(`/${locale}`);
    for (const section of ["experiences", "prices", "boat", "find-us"]) {
      await expect(page.locator(`#${section}`)).toHaveCount(1);
    }
    await expect(page.locator("#reviews time")).toHaveCount(0);
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/es/paseo-barco-amanecer-barcelona");
  const header = page.locator("header");
  await expect(header.locator("details")).toHaveCount(0);
  await expect(header.getByRole("link", { name: "Nuestro barco", exact: true })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "EN", exact: true })).toHaveAttribute("href", marketingPath("en", "sunrise"));
  await header.getByRole("link", { name: "JimBoats Charter", exact: true }).click();
  await expect(page).toHaveURL(/\/es$/);
});

test("support pages answer their own question and retain the cancellation and author links", async ({ page }) => {
  for (const key of ["boat", "prices", "about", "contact"] as const) {
    await page.goto(marketingPath("es", key));
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("#reviews")).toHaveCount(0);
    await expect(page.locator("main iframe")).toHaveCount(key === "contact" ? 1 : 0);
    if (key === "boat") await expect(page.getByText("3,03 m", { exact:true })).toBeVisible();
    if (key === "about") await expect(page.locator("#victor-jimenez")).toBeVisible();
    if (key === "contact") await expect(page.locator("#faq")).toContainText("48 horas");
    if (key === "prices") await expect(page.locator("main")).toContainText("jamón ibérico");
  }
});
