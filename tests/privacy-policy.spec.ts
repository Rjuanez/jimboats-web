import { expect, test } from "@playwright/test";

test("privacy pages are readable on mobile, switch language and link from the footer", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const documents = [
    ["es", "privacidad", "Política de privacidad"],
    ["en", "privacy", "Privacy policy"],
    ["fr", "confidentialite", "Politique de confidentialité"],
    ["de", "datenschutz", "Datenschutzerklärung"],
    ["nl", "privacy", "Privacybeleid"],
  ];
  for (const [locale, slug, title] of documents) {
    const path = `/${locale}/${slug}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://jimboatscharter.com${path}`,
    );
    await expect(
      page.locator("footer").getByRole("link", { name: title, exact: true }),
    ).toHaveAttribute("href", path);
    await expect(page.locator("article dl > div")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/privacidad$/);
  expect((await request.get("/en/privacidad")).status()).toBe(404);
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const [locale, slug] of documents)
    expect(xml).toContain(`/${locale}/${slug}</loc>`);
});
