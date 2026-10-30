import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoApplicationDocument } from "@/components/sections/seo-app/SeoApplicationDocument";
import { seoApplicationPrivacy } from "@/i18n/seo-app/es";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export const metadata: Metadata = {
  title: { absolute: seoApplicationPrivacy.title },
  description: seoApplicationPrivacy.description,
  alternates: {
    canonical: "https://jimboatscharter.com/es/jimboats-seo/privacidad",
  },
  robots: { index: false, follow: true },
};

export default async function SeoApplicationPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if ((await params).locale !== "es") notFound();

  return <SeoApplicationDocument content={seoApplicationPrivacy} />;
}
