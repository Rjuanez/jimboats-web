import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { blogKeys, blogPath, getBlogCopy } from "../src/content/blog/catalog";
import { termsPath } from "../src/content/booking/termsRoutes";
import { privacyPath } from "../src/content/privacy/routes";
import {
  marketingLocales,
  marketingPath,
} from "../src/content/marketing/routes";
import { mockWeather } from "./fixtures/weather";

test("hen party guides credit only Víctor and render supplied photos and confirmed totals", async ({ request }) => {
  for (const locale of marketingLocales) {
    const html = await (await request.get(blogPath(locale, "hen"))).text();
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const article = scripts.flatMap(script => script["@graph"] ?? []).find(item => item["@type"] === "BlogPosting");
    expect(article.author.name).toBe("Víctor Jiménez Sánchez");
    expect(Array.isArray(article.author)).toBe(false);
    expect(article.dateModified).toBe("2026-11-05");
    for (const slug of ["friends", "bride", "toast", "paddle", "preparations"]) {
      expect(html).toContain(`hen-party-${slug}-`);
    }
    expect(html).not.toMatch(/\{(?:private\d+h|food|drinks|perGuest2h|sunset2h)\}/);
    expect(html).toContain("210");
  }
});

test("all localized blog URLs contain static localized text, reciprocal alternates and structured identity", async ({
  request,
}) => {
  for (const locale of marketingLocales) {
    for (const key of [undefined, ...blogKeys]) {
      const path = blogPath(locale, key);
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect((html.match(/<h1(?:\s|>)/g) ?? []).length, path).toBe(1);
      expect(html).toContain(`<html lang="${locale}"`);
      expect(html).toContain(
        `rel="canonical" href="https://jimboatscharter.com${path}"`,
      );
      for (const alternate of marketingLocales)
        expect(html).toContain(
          `href="https://jimboatscharter.com${blogPath(alternate, key)}"`,
        );
      expect(html).toContain(
        key ? '"@type":"BlogPosting"' : '"@type":"CollectionPage"',
      );
      expect(html).toContain("noindex");
      if (key) {
        const article = getBlogCopy(locale).articles[key];
        expect(html).toContain(article.sections[0].id);
        expect(html).toContain(marketingPath(locale, key === "food" || key === "birthday" || key === "hen" ? "private" : key));
      }
    }
  }
  expect((await request.get("/es/blog/no-existe")).status()).toBe(404);
  expect((await request.get("/ca/blog")).status()).toBe(404);
  expect(
    (await request.get("/es/blog/where-to-watch-sunset-barcelona")).status(),
  ).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect((sitemap.match(/<loc>/g) ?? []).length).toBe(105);
  for (const locale of marketingLocales) {
    for (const path of [privacyPath(locale), termsPath(locale)]) {
      expect(sitemap).toContain(
        `<loc>https://jimboatscharter.com${path}</loc>`,
      );
    }
  }
  expect(sitemap).toContain(blogPath("nl", "romantic"));
});

test("readers move between languages of the same guide, its contents and the relevant experience", async ({
  page,
}) => {
  await page.goto(blogPath("es", "sunset"));
  await page
    .getByRole("navigation", { name: "Idioma" })
    .getByRole("link", { name: "DE", exact: true })
    .click();
  await expect(page).toHaveURL(blogPath("de", "sunset"));
  await page
    .getByRole("navigation", { name: "In diesem Reiseführer" })
    .getByRole("link")
    .last()
    .click();
  await expect(page).toHaveURL(/#jimboats$/);
  await page
    .locator('section[aria-labelledby="article-experience"]')
    .getByRole("link")
    .first()
    .click();
  await expect(page).toHaveURL(marketingPath("de", "sunset"));
  await page
    .locator('section[aria-labelledby="experience-guides"]')
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(blogPath("de", "sunset"));
});

test("every translated guide works on a narrow screen with no skipped headings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  for (const locale of marketingLocales)
    for (const key of blogKeys) {
      await page.goto(blogPath(locale, key));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const levels = await page
        .locator("main h1, main h2, main h3")
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.tagName.slice(1))),
        );
      expect(levels[0]).toBe(1);
      expect(
        levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1),
      ).toBe(true);
      await expect(
        page
          .locator('section[aria-labelledby="article-experience"]')
          .getByRole("link")
          .first(),
      ).toHaveAttribute("href", marketingPath(locale, key === "food" || key === "birthday" || key === "hen" ? "private" : key));
    }
});

for (const width of [360, 768, 1280])
  test(`blog layout and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      blogPath("es"),
      blogPath("de", "romantic"),
      blogPath("fr", "sunrise"),
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).analyze()).violations,
        path,
      ).toEqual([]);
    }
  });

for (const width of [360, 1280])
  for (const key of [undefined, "sunset"] as const)
    test(`blog visual ${key ?? "index"} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mockWeather(page);
      await page.goto(blogPath("es", key), { waitUntil: "networkidle" });
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
      await expect(page).toHaveScreenshot(
        `blog-${key ?? "index"}-${width}.png`,
        {
          fullPage: true,
          animations: "disabled",
        },
      );
    });

test("skipper portraits, article credits and translated profiles refer to the same people", async ({ page }) => {
  await page.goto("/es/sobre-nosotros");
  await expect(page.locator("main #blog")).toHaveCount(0);
  for (const [id, portrait] of [["david-jimenez", "crew-portrait-1"], ["victor-jimenez", "crew-portrait-2"]]) {
    const card = page.locator("#" + id);
    await expect(card.locator("img")).toHaveAttribute("src", new RegExp(portrait));
    await card.getByRole("link").click();
    await expect(page).toHaveURL(new RegExp("/es/sobre-nosotros/" + id + "$"));
    const profile = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(profile.join("")).toContain('"@type":"ProfilePage"');
    await page.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(new RegExp("/en/about-us/" + id + "$"));
    const guides = page.locator("main section").filter({ has: page.locator("h3") });
    await expect(guides.locator("article")).toHaveCount(3);
    await expect(guides.locator("article img").first()).toBeVisible();
    await expect(guides.locator("article p").nth(1)).not.toBeEmpty();
    await guides.locator("h3 a").first().click();
    await expect(page.locator('main header a[href="/en/about-us/' + id + '"]')).toHaveCount(1);
    await page.goto("/es/sobre-nosotros");
  }
});
