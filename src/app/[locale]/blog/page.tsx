import { notFound } from "next/navigation";
import {
  isMarketingLocale,
  marketingLocales,
} from "@/content/marketing/routes";
import { SeoBlogIndex } from "@/components/sections/blog/SeoBlogIndex";
import { MarketingStructuredData } from "@/components/sections/seo/MarketingStructuredData";
import {
  blogMetadata,
  blogStructuredData,
  getBlogPage,
} from "@/interface/next/presenters/blogPresenter";

type Props = { params: Promise<{ locale: string }> };
export const dynamicParams = false;
export const generateStaticParams = () =>
  marketingLocales.map((locale) => ({ locale }));
async function resolve({ params }: Props) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  return getBlogPage(locale);
}
export async function generateMetadata(props: Props) {
  return blogMetadata((await resolve(props)).locale);
}
export default async function BlogIndexPage(props: Props) {
  const page = await resolve(props);
  return (
    <>
      <SeoBlogIndex page={page} />
      <MarketingStructuredData data={blogStructuredData(page)} />
    </>
  );
}
