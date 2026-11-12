import { operator } from "@/content/marketing/catalog";
import { marketingLocales } from "@/content/marketing/routes";
import { profileSitemap } from "@/interface/next/presenters/skipperPresenter";
import type { MetadataRoute } from "next";
import { marketingSitemap } from "@/interface/next/presenters/marketingSeoPresenter";
import { blogSitemap } from "@/interface/next/presenters/blogPresenter";
import { privacySitemap } from "@/interface/next/presenters/privacyPresenter";
import { bookingTermsSitemap } from "@/interface/next/presenters/bookingTermsPresenter";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...marketingSitemap(),
    ...blogSitemap(),
    ...profileSitemap(),
    ...privacySitemap(),
    ...bookingTermsSitemap(),
    ...marketingLocales.map((locale) => ({
      url: `${operator.url}/${locale}/legal`,
    })),
  ];
}
