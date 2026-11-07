import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/es/jimboats-seo", title: "JimBoats SEO" },
  {
    path: "/es/jimboats-seo/privacidad",
    title: "Política de privacidad de JimBoats SEO",
  },
];

for (const document of pages) {
  test(`${document.path} is public and readable without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      const response = await page.goto(document.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        document.title,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      await expect(page.getByRole("main")).toContainText(document.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://jimboatscharter.com${document.path}`,
      );
      await expect(
        page.getByRole("link", { name: "Privacidad", exact: true }),
      ).toHaveAttribute("href", "/es/jimboats-seo/privacidad");
    } finally {
      await context.close();
    }
  });

  for (const width of [360, 768, 1280]) {
    test(`${document.path} is accessible and fits ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(document.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => window.document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow).toBe(false);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath("page.png"),
        fullPage: true,
      });
    });
  }
}

test("application links to privacy and back", async ({ page }) => {
  await page.goto("/es/jimboats-seo");
  await page
    .getByRole("link", {
      name: "Leer la política de privacidad de JimBoats SEO",
    })
    .click();
  await expect(page).toHaveURL(/\/es\/jimboats-seo\/privacidad$/);
  await page.getByRole("link", { name: "La aplicación", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/jimboats-seo$/);
});

test("unpublished translations do not silently return Spanish content", async ({
  request,
}) => {
  for (const locale of ["en", "ca", "xx"]) {
    for (const suffix of ["", "/privacidad"]) {
      expect(
        (await request.get(`/${locale}/jimboats-seo${suffix}`)).status(),
      ).toBe(404);
    }
  }
});
