import type { Metadata, MetadataRoute } from "next";
import { getMarketingPage } from "@/content/marketing";
import { operator } from "@/content/marketing/catalog";
import {
  marketingLocales,
  type MarketingLocale,
} from "@/content/marketing/routes";
import { getPrivacyDocument } from "@/content/privacy";
import { privacyPath } from "@/content/privacy/routes";
import { productionSeoEnabled } from "@/interface/next/config/seoIndexing";

function privacyLanguages() {
  return Object.fromEntries(
    marketingLocales.map((locale) => [
      locale,
      `${operator.url}${privacyPath(locale)}`,
    ]),
  );
}

export function getPrivacyPage(locale: MarketingLocale) {
  const page = getMarketingPage(locale);
  return {
    document: getPrivacyDocument(locale),
    page: {
      ...page,
      path: privacyPath(locale),
      languages: page.languages.map((language) => ({
        ...language,
        href: privacyPath(language.locale),
      })),
    },
  };
}

export function privacyMetadata(locale: MarketingLocale): Metadata {
  const copy = getPrivacyDocument(locale);
  const url = `${operator.url}${privacyPath(locale)}`;
  return {
    title: { absolute: `${copy.title} | JimBoats` },
    description: copy.description,
    alternates: { canonical: url, languages: privacyLanguages() },
    robots: { index: productionSeoEnabled(), follow: true },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      type: "website",
    },
  };
}

export function privacySitemap(): MetadataRoute.Sitemap {
  return marketingLocales.map((locale) => ({
    url: `${operator.url}${privacyPath(locale)}`,
    alternates: { languages: privacyLanguages() },
  }));
}
