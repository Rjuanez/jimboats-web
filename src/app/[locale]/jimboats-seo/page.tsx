import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoApplicationDocument } from "@/components/sections/seo-app/SeoApplicationDocument";
import { seoApplicationHome } from "@/i18n/seo-app/es";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export const metadata: Metadata = {
  title: { absolute: seoApplicationHome.title },
  description: seoApplicationHome.description,
  alternates: { canonical: "https://jimboatscharter.com/es/jimboats-seo" },
  robots: { index: false, follow: true },
};

export default async function SeoApplicationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if ((await params).locale !== "es") notFound();

  return <SeoApplicationDocument content={seoApplicationHome} />;
}
