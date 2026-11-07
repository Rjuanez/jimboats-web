import type { Metadata, MetadataRoute } from "next";
import { getMarketingPage } from "@/content/marketing";
import { operator } from "@/content/marketing/catalog";
import {
  marketingLocales,
  type MarketingLocale,
} from "@/content/marketing/routes";
import terms from "@/content/booking/terms.json";
import { getBookingTermsContent } from "@/content/booking/terms";
import { termsPath } from "@/content/booking/termsRoutes";
import { productionSeoEnabled } from "@/interface/next/config/seoIndexing";

function languages() {
  return Object.fromEntries(
    marketingLocales.map((locale) => [
      locale,
      `${operator.url}${termsPath(locale)}`,
    ]),
  );
}

export function getBookingTermsPage(locale: MarketingLocale) {
  const page = getMarketingPage(locale);
  return {
    ...getBookingTermsContent(locale),
    page: {
      ...page,
      path: termsPath(locale),
      languages: page.languages.map((language) => ({
        ...language,
        href: termsPath(language.locale),
      })),
    },
  };
}

export function bookingTermsMetadata(locale: MarketingLocale): Metadata {
  const { title, description } = terms[locale];
  const url = `${operator.url}${termsPath(locale)}`;
  return {
    title: { absolute: `${title} | JimBoats` },
    description,
    alternates: { canonical: url, languages: languages() },
    robots: { index: productionSeoEnabled(), follow: true },
    openGraph: { title, description, url, type: "website" },
  };
}

export function bookingTermsSitemap(): MetadataRoute.Sitemap {
  return marketingLocales.map((locale) => ({
    url: `${operator.url}${termsPath(locale)}`,
    alternates: { languages: languages() },
  }));
}
