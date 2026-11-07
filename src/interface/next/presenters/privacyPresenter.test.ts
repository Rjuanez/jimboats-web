import { describe, expect, it } from "vitest";
import { generateStaticParams } from "@/app/[locale]/[slug]/page";
import sitemap from "@/app/sitemap";
import { marketingLocales } from "@/content/marketing/routes";
import { privacyPages, privacyPath } from "@/content/privacy/routes";
import { getPrivacyPage, privacyMetadata } from "./privacyPresenter";
import { termsPath, termsStaticParams } from "@/content/booking/termsRoutes";
import { bookingTermsMetadata } from "./bookingTermsPresenter";

describe("public privacy integration", () => {
  it("generates every translated policy with matching metadata, language links and sitemap entries", () => {
    const generated = generateStaticParams();
    const entries = sitemap();
    for (const locale of marketingLocales) {
      const { page, document } = getPrivacyPage(locale);
      const path = privacyPath(locale);
      expect(generated).toContainEqual({
        locale,
        slug: privacyPages[locale].slug,
      });
      expect(page.path).toBe(path);
      expect(document.title).toBe(privacyPages[locale].label);
      expect(document.retention.rows).toHaveLength(8);
      expect(privacyMetadata(locale).alternates?.canonical).toBe(
        `https://jimboatscharter.com${path}`,
      );
      expect(entries).toContainEqual(
        expect.objectContaining({ url: `https://jimboatscharter.com${path}` }),
      );
      for (const link of page.languages) {
        expect(link.href).toBe(privacyPath(link.locale));
      }
    }
    expect(privacyPath("ca")).toBe("/es/privacidad");
  });
});

it("exposes every booking terms URL in the static routes and sitemap", () => {
  expect(generateStaticParams()).toEqual(expect.arrayContaining(termsStaticParams()));
  const entries = sitemap();
  for (const locale of marketingLocales) {
    const url = `https://jimboatscharter.com${termsPath(locale)}`;
    expect(bookingTermsMetadata(locale).alternates?.canonical).toBe(url);
    expect(entries).toContainEqual(expect.objectContaining({ url }));
  }
});
