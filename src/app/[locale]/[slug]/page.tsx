import { notFound } from "next/navigation";
import { termsPages, termsStaticParams } from "@/content/booking/termsRoutes";
import { SeoBookingTermsPage } from "@/components/sections/seo/SeoBookingTermsPage";
import {
  bookingTermsMetadata,
  getBookingTermsPage,
} from "@/interface/next/presenters/bookingTermsPresenter";
import { privacyPages, privacyStaticParams } from "@/content/privacy/routes";
import { SeoPrivacyPage } from "@/components/sections/seo/SeoPrivacyPage";
import {
  getPrivacyPage,
  privacyMetadata,
} from "@/interface/next/presenters/privacyPresenter";
import { getMarketingPage } from "@/content/marketing";
import {
  isMarketingLocale,
  marketingStaticParams,
  resolveMarketingPage,
} from "@/content/marketing/routes";
import { SeoMarketingPage } from "@/components/sections/seo/SeoMarketingPage";
import { MarketingStructuredData } from "@/components/sections/seo/MarketingStructuredData";
import {
  marketingMetadata,
  marketingStructuredData,
} from "@/interface/next/presenters/marketingSeoPresenter";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export const revalidate = 3600;
export function generateStaticParams() {
  return [
    ...marketingStaticParams(),
    ...privacyStaticParams(),
    ...termsStaticParams(),
  ];
}
async function resolve({ params }: Props) {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale)) notFound();
  if (slug === termsPages[locale].slug) {
    return { kind: "terms" as const, locale };
  }
  if (slug === privacyPages[locale].slug) {
    return { kind: "privacy" as const, locale };
  }
  const key = resolveMarketingPage(locale, slug);
  if (!key || key === "home") notFound();
  return { kind: "marketing" as const, page: getMarketingPage(locale, key) };
}
export async function generateMetadata(props: Props) {
  const resolved = await resolve(props);
  if (resolved.kind === "terms") return bookingTermsMetadata(resolved.locale);
  if (resolved.kind === "privacy") return privacyMetadata(resolved.locale);
  const { page } = resolved;
  return marketingMetadata(page.locale, page.key);
}
export default async function ExperienceOrInformationPage(props: Props) {
  const resolved = await resolve(props);
  if (resolved.kind === "terms") {
    return <SeoBookingTermsPage {...getBookingTermsPage(resolved.locale)} />;
  }
  if (resolved.kind === "privacy") {
    return <SeoPrivacyPage {...getPrivacyPage(resolved.locale)} />;
  }
  const { page } = resolved;
  return (
    <>
      <SeoMarketingPage page={page} />
      <MarketingStructuredData data={marketingStructuredData(page)} />
    </>
  );
}
