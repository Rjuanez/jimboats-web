import { profileSitemap, skipperPage } from "@/interface/next/presenters/skipperPresenter";
import { skippers } from "@/content/marketing/skippers";
import { describe, expect, it } from "vitest";
import {
  blogKeys,
  blogPath,
  blogStaticParams,
  getBlogCopy,
  resolveBlogKey,
} from "./catalog";
import { marketingLocales } from "../marketing/routes";
import { getMarketingPage } from "../marketing";
import {
  blogMetadata,
  blogSitemap,
  blogStructuredData,
  getBlogPage,
} from "@/interface/next/presenters/blogPresenter";
import { marketingSitemap } from "@/interface/next/presenters/marketingSeoPresenter";

describe("static multilingual blog", () => {
  it("gives each guide a complete translation, unique route and resolvable local sources", () => {
    expect(blogStaticParams()).toHaveLength(30);
    const paths = new Set<string>();
    for (const locale of marketingLocales) {
      for (const key of blogKeys) {
        const article = getBlogCopy(locale).articles[key];
        const page = getBlogPage(locale, key);
        paths.add(page.path);
        expect(resolveBlogKey(locale, article.slug)).toBe(key);
        expect(resolveBlogKey(locale, "missing-guide")).toBeUndefined();
        expect(
          new Set(article.sections.map((section) => section.id)).size,
        ).toBe(article.sections.length);
        expect(
          article.sections
            .flatMap((section) => section.paragraphs)
            .join(" ")
            .split(/\s+/).length,
        ).toBeGreaterThan(320);
        expect(
          page
            .article!.sections.flatMap((section) => section.sources)
            .every((source) => source?.href.startsWith("https://")),
        ).toBe(true);
        expect(page.experiences[0].id).toBe(key === "food" || key === "birthday" || key === "hen" ? "private" : key);
        for (const link of page.shell.languages)
          expect(link.href).toBe(blogPath(link.locale, key));
        expect(blogMetadata(locale, key).alternates?.canonical).toBe(
          "https://jimboatscharter.com" + page.path,
        );
        expect(blogMetadata(locale, key).robots).toMatchObject({
          index: false,
        });
      }
    }
    expect(paths.size).toBe(30);
  });
  it("publishes the same visible article identity in structured data, without invented offers", () => {
    const page = getBlogPage("es", "sunset");
    const data = blogStructuredData(page);
    expect(data["@graph"]).toContainEqual(
      expect.objectContaining({
        "@type": "BlogPosting",
        headline: page.article!.title,
        inLanguage: "es",
        dateModified: page.date,
        citation: page.sourceLinks.map((source) => source.href),
      }),
    );
    expect(data["@graph"]).toContainEqual(
      expect.objectContaining({
        "@type": "BreadcrumbList",
        itemListElement: expect.arrayContaining([
          expect.objectContaining({
            position: 3,
            item: "https://jimboatscharter.com" + page.path,
          }),
        ]),
      }),
    );
    expect(JSON.stringify(data)).not.toMatch(
      /AggregateRating|Offer|priceCurrency/,
    );
    expect(blogStructuredData(getBlogPage("en"))["@graph"]).toContainEqual(
      expect.objectContaining({ "@type": "CollectionPage" }),
    );
  });
  it("connects guides to experiences and includes 90 unique core URLs in the combined sitemap", () => {
    const urls = [...marketingSitemap(), ...blogSitemap(), ...profileSitemap()];
    expect(urls).toHaveLength(90);
    expect(new Set(urls.map((item) => item.url)).size).toBe(90);
    for (const locale of marketingLocales) {
      expect(getMarketingPage(locale).infoLinks).toContainEqual({
        label: "Blog",
        href: blogPath(locale),
      });
      for (const key of ["sunset", "sunrise"] as const) {
        expect(
          getMarketingPage(locale, key).guides.map((guide) => guide.href),
        ).toEqual([blogPath(locale, key)]);
      }
      expect(getBlogPage(locale).articles).toHaveLength(6);
      expect(getBlogPage(locale, "romantic").articles).toHaveLength(5);
    }
  });
});

it("uses one business identity for publisher and skipper employer without inventing publication dates", () => {
  const page = getBlogPage("es", "sunset");
  const graph = blogStructuredData(page)["@graph"];
  expect(graph).toContainEqual(expect.objectContaining({ "@type": "LocalBusiness", "@id": "https://jimboatscharter.com/#business" }));
  expect(graph).toContainEqual(expect.objectContaining({ "@type": "BlogPosting", publisher: { "@id": "https://jimboatscharter.com/#business" } }));
  expect(JSON.stringify(graph)).not.toContain("#organization");
  const profile = skipperPage("es", skippers[0]).data["@graph"];
  expect(profile).toContainEqual(expect.objectContaining({
    "@type": "ProfilePage",
    mainEntity: expect.objectContaining({ worksFor: { "@id": "https://jimboatscharter.com/#business" } }),
  }));
  expect(JSON.stringify(graph)).not.toContain('"datePublished"');
  const publishedPage = { ...page, article: { ...page.article!, publishedAt: "2026-11-05" } };
  expect(blogStructuredData(publishedPage)["@graph"]).toContainEqual(expect.objectContaining({ datePublished: "2026-11-05" }));
  for (const locale of marketingLocales) for (const key of [undefined, ...blogKeys]) {
    const title = blogMetadata(locale, key).title as { absolute: string };
    expect(title.absolute.match(/JimBoats/g)).toHaveLength(1);
    expect(title.absolute.length).toBeLessThanOrEqual(65);
  }
});
