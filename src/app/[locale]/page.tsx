import { notFound } from "next/navigation";
import { getMarketingPage } from "@/content/marketing";
import {
  isMarketingLocale,
  marketingLocales,
} from "@/content/marketing/routes";
import { SeoMarketingPage } from "@/components/sections/seo/SeoMarketingPage";
import { MarketingStructuredData } from "@/components/sections/seo/MarketingStructuredData";
import {
  marketingMetadata,
  marketingStructuredData,
} from "@/interface/next/presenters/marketingSeoPresenter";

type Props = { params: Promise<{ locale: string }> };
export function generateStaticParams() {
  return marketingLocales.map((locale) => ({ locale }));
}
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  if (!isMarketingLocale(locale)) notFound();
  return marketingMetadata(locale);
}
export default async function LocalizedHomePage(props: Props) {
  const { locale } = await props.params;
  if (!isMarketingLocale(locale)) notFound();
  const page = getMarketingPage(locale);
  return (
    <>
      <SeoMarketingPage page={page} />
      <MarketingStructuredData data={marketingStructuredData(page)} />
    </>
  );
}
