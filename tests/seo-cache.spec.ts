import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { marketingLastModified } from "../src/content/marketing/lastModified";
import {
  marketingLocales,
  marketingPath,
  pageKeys,
} from "../src/content/marketing/routes";

// next dev deliberately disables caching. Run this contract against next start
// or the standalone production server (see docs/production-launch.md).
test.skip(process.env.SEO_CACHE_E2E !== "1", "Requires a production build");

test("commercial HTML is cached for one hour on first and repeat requests", async ({
  request,
}) => {
  for (const locale of marketingLocales) {
    for (const key of pageKeys) {
      const path = marketingPath(locale, key);
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const response = await request.get(path);
        expect(response.status(), path).toBe(200);
        expect(response.headers()["content-type"], path).toContain("text/html");
        expect(response.headers()["cache-control"], path).toBe("s-maxage=3600");
      }
    }
  }
});

test("the XML preserves all URLs and emits stable editorial dates", async ({
  request,
  page,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  // Next metadata routes require downstream revalidation independently of ISR.
  expect(response.headers()["cache-control"]).toBe(
    "public, max-age=0, must-revalidate",
  );
  const manifest = JSON.parse(
    readFileSync(".next/prerender-manifest.json", "utf8"),
  );
  expect(manifest.routes["/sitemap.xml"]).toMatchObject({
    initialRevalidateSeconds: 3600,
    initialExpireSeconds: 3600,
  });
  const xml = await response.text();
  const entries = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    if (document.querySelector("parsererror"))
      throw new Error("Invalid sitemap XML");
    return Array.from(document.querySelectorAll("url")).map((entry) => ({
      url: entry.querySelector("loc")?.textContent,
      lastModified: entry.querySelector("lastmod")?.textContent,
      alternates: entry.getElementsByTagNameNS(
        "http://www.w3.org/1999/xhtml",
        "link",
      ).length,
    }));
  }, xml);
  expect(entries).toHaveLength(105);
  expect(new Set(entries.map((entry) => entry.url)).size).toBe(105);
  for (const locale of marketingLocales) {
    for (const key of pageKeys) {
      expect(entries).toContainEqual({
        url: `https://jimboatscharter.com${marketingPath(locale, key)}`,
        lastModified: marketingLastModified[locale][key],
        alternates: 5,
      });
    }
  }
  expect(await (await request.get("/sitemap.xml")).text()).toBe(xml);
});

test("versioned Next.js assets retain immutable one-year caching", async ({
  request,
}) => {
  const html = await (await request.get("/en")).text();
  const asset = html.match(
    /(?:src|href)="([^" ]*\/_next\/static\/[^" ]+\.(?:js|css))"/,
  );
  expect(asset).not.toBeNull();
  const response = await request.get(asset![1]);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe(
    "public, max-age=31536000, immutable",
  );
});

test("shared policy routes revalidate hourly and unknown pages remain 404", async ({
  request,
}) => {
  for (const path of ["/en/privacy", "/en/booking-terms"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["cache-control"], path).toBe("s-maxage=3600");
  }
  expect((await request.get("/en/no-such-commercial-page")).status()).toBe(404);
});
