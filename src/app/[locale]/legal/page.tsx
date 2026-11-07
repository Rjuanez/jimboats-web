import { notFound } from "next/navigation";
import { getMarketingPage } from "@/content/marketing";
import { legalCopy, legalDescriptions } from "@/content/marketing/legal";
import {
  marketingLocales,
  isMarketingLocale,
} from "@/content/marketing/routes";
import { operator } from "@/content/marketing/catalog";
import { SeoLegalPage } from "@/components/sections/seo/SeoLegalPage";
import { productionSeoEnabled } from "@/interface/next/config/seoIndexing";

type Props = { params: Promise<{ locale: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return marketingLocales.map((locale) => ({ locale }));
}
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  return {
    title: { absolute: `${legalCopy[locale][0]} | JimBoats` },
    description: legalDescriptions[locale]
      .replaceAll("{legalName}", operator.legalName)
      .replaceAll("{taxId}", operator.taxId),
    alternates: {
      canonical: `${operator.url}/${locale}/legal`,
      languages: Object.fromEntries(
        marketingLocales.map((language) => [
          language,
          `${operator.url}/${language}/legal`,
        ]),
      ),
    },
    robots: { index: productionSeoEnabled(), follow: true },
  };
}
export default async function LegalPage({ params }: Props) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  const page = getMarketingPage(locale);
  return (
    <SeoLegalPage
      page={{
        ...page,
        path: `/${locale}/legal`,
        languages: page.languages.map((language) => ({
          ...language,
          href: `/${language.locale}/legal`,
        })),
      }}
    />
  );
}
