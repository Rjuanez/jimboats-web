import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/layout/RootDocument";
import { isMarketingLocale } from "@/content/marketing/routes";
export { metadata, viewport } from "@/components/layout/RootDocument";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  return <RootDocument locale={locale}>{children}</RootDocument>;
}
