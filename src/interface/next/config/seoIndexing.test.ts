import { afterEach, expect, it, vi } from "vitest";
import { productionSeoEnabled } from "./seoIndexing";
import robots from "@/app/robots";
import { marketingMetadata } from "../presenters/marketingSeoPresenter";

afterEach(() => vi.unstubAllEnvs());

it("requires explicit indexing and keeps every preview mode excluded", () => {
  expect(productionSeoEnabled({})).toBe(false);
  expect(productionSeoEnabled({ JIMBOATS_INDEXING: "1" })).toBe(true);
  for (const flag of ["JIMBOATS_SEO_PREVIEW", "JIMBOATS_LOCAL_BOOKINGS", "JIMBOATS_ADMIN_PREVIEW_DATA"]) {
    expect(productionSeoEnabled({ JIMBOATS_INDEXING: "1", [flag]: "1" })).toBe(false);
  }
});

it("serves crawlable production marketing and a sitemap, but blocks preview", () => {
  vi.stubEnv("JIMBOATS_INDEXING", "1");
  vi.stubEnv("JIMBOATS_SEO_PREVIEW", "0");
  vi.stubEnv("JIMBOATS_LOCAL_BOOKINGS", "0");
  vi.stubEnv("JIMBOATS_ADMIN_PREVIEW_DATA", "0");
  expect(robots().sitemap).toBe("https://jimboatscharter.com/sitemap.xml");
  expect(marketingMetadata("es").robots).toMatchObject({ index: true });
  vi.stubEnv("JIMBOATS_SEO_PREVIEW", "1");
  expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  expect(marketingMetadata("es").robots).toMatchObject({ index: false });
});
