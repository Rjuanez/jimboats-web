import { notFound } from "next/navigation";
import { isMarketingLocale } from "@/content/marketing/routes";
import { blogStaticParams, resolveBlogKey } from "@/content/blog/catalog";
import { SeoBlogArticle } from "@/components/sections/blog/SeoBlogArticle";
import { MarketingStructuredData } from "@/components/sections/seo/MarketingStructuredData";
import {
  blogMetadata,
  blogStructuredData,
  getBlogPage,
} from "@/interface/next/presenters/blogPresenter";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = blogStaticParams;
async function resolve({ params }: Props) {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale)) notFound();
  const key = resolveBlogKey(locale, slug);
  if (!key) notFound();
  return getBlogPage(locale, key);
}
export async function generateMetadata(props: Props) {
  const page = await resolve(props);
  return blogMetadata(page.locale, page.key);
}
export default async function BlogArticlePage(props: Props) {
  const page = await resolve(props);
  return (
    <>
      <SeoBlogArticle page={page} />
      <MarketingStructuredData data={blogStructuredData(page)} />
    </>
  );
}
