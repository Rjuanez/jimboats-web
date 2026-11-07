import { expect, test } from "@playwright/test";

test("retired Catalan URLs redirect permanently to Spanish and preserve booking parameters", async ({ request }) => {
  for (const path of ["", "/book?experience=romantic&hours=2", "/book/success?reference=SEO-TEST", "/bookings/SEO-TEST?token=test"] ) {
    const response = await request.get(`/ca${path}`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/es${path}`);
  }
  expect((await request.get("/ca/pagina-que-no-existe")).status()).toBe(404);
});

test("the root negotiates all five public languages and maps Catalan to Spanish", async ({ request }) => {
  for (const [language, locale] of [["es-ES", "es"], ["en-GB", "en"], ["fr-FR", "fr"], ["de-DE", "de"], ["nl-NL", "nl"], ["ca-ES", "es"]]) {
    const response = await request.get("/", { maxRedirects: 0, headers: { "Accept-Language": language } });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(`/${locale}`);
  }
});

test("company identity and language links remain on the legal page", async ({ page }) => {
  for (const locale of ["es", "en", "fr", "de", "nl"]) {
    await page.goto(`/${locale}/legal`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toContainText("Jimboats Charter SL");
    await expect(page.locator("main")).toContainText("B25930850");
    await expect(page.locator("main")).toContainText("08019 Barcelona");
    for (const language of ["es", "en", "fr", "de", "nl"]) {
      await expect(page.locator(`header a[hreflang="${language}"]`)).toHaveAttribute("href", `/${language}/legal`);
    }
  }
});

// Production inventory + Search Console, checked 2026-11-05.
test("preserves legacy entry points, booking links and indexed fragments", async ({ request }) => {
  for (const locale of ["es", "en", "ca"]) {
    expect((await request.get(`/${locale}`)).status()).toBe(200);
  }
  const root = await request.get("/", { maxRedirects: 0, headers: { "Accept-Language": "en" } });
  expect([307, 308]).toContain(root.status());
  expect(root.headers().location).toBe("/en");
  const html = await (await request.get("/en")).text();
  for (const id of ["experiences", "extras", "gallery", "how-it-works"]) {
    expect(html).toContain(`id="${id}"`);
  }
  for (const id of ["daytrip", "ex-sunset", "sunrise", "romantic"]) {
    const booking = await request.get(`/es/book?experience=${id}`);
    expect(booking.status()).toBe(200);
    expect(booking.url()).toContain("/es/book?");
  }
});

test("retired experience hubs redirect once to the matching home section", async ({ request }) => {
  for (const [locale, slug] of [["es", "experiencias"], ["en", "experiences"], ["fr", "experiences"], ["de", "erlebnisse"], ["nl", "ervaringen"]]) {
    const response = await request.get(`/${locale}/${slug}`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/${locale}#experiences`);
  }
  expect((await request.get("/es/pagina-que-no-existe")).status()).toBe(404);
});
