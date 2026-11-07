import { notFound } from "next/navigation";
import { profileParams } from "@/content/marketing/crew";
import { skippers } from "@/content/marketing/skippers";
import {
  isMarketingLocale,
  resolveMarketingPage,
} from "@/content/marketing/routes";
import {
  skipperPage,
  skipperMetadata,
} from "@/interface/next/presenters/skipperPresenter";
import { MarketingStructuredData } from "@/components/sections/seo/MarketingStructuredData";
import { SeoSkipperPage } from "@/components/sections/seo/SeoSkipperPage";

export const dynamicParams = false;
export const generateStaticParams = profileParams;
type Props = {
  params: Promise<{ locale: string; slug: string; person: string }>;
};
async function resolve({ params }: Props) {
  const { locale, slug, person } = await params;
  if (
    !isMarketingLocale(locale) ||
    resolveMarketingPage(locale, slug) !== "about"
  )
    notFound();
  const skipper = skippers.find(({ id }) => id === person);
  if (!skipper) notFound();
  return skipperPage(locale, skipper);
}
export async function generateMetadata(props: Props) {
  return skipperMetadata(await resolve(props));
}
export default async function Profile(props: Props) {
  const page = await resolve(props);
  return (
    <>
      <SeoSkipperPage page={page} />
      <MarketingStructuredData data={page.data} />
    </>
  );
}
