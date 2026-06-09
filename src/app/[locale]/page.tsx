import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeLandingPage } from "@/components/sections/HomeLandingPage";
import {
  createLanguageAlternates,
  parsePublicLocale,
  supportedLocales,
  type PublicLocale,
} from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";
import {
  createHomeLandingStructuredData,
  getHomeLandingPage,
  homeLandingContent,
} from "@/interface/next/presenters/homeLandingPresenter";

type LocalizedPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.metadata.home.title,
    description: dictionary.metadata.home.description,
    alternates: {
      canonical: `/${locale}`,
      languages: createLanguageAlternates(),
    },
    openGraph: {
      title: dictionary.metadata.home.titleWithBrand,
      description: dictionary.metadata.home.description,
      images: [
        {
          url: "/images/generated/landing/hero-sunset-barcelona-1024.webp",
          width: 1024,
          height: 1024,
          alt: homeLandingContent.hero.image.alt,
        },
      ],
      locale: dictionary.metadata.home.ogLocale,
      siteName: "JimBoats",
      type: "website",
    },
  };
}

export default async function LocalizedHomePage({ params }: LocalizedPageProps) {
  const locale = await resolveLocale(params);
  const content = await getHomeLandingPage(locale);

  return (
    <>
      <HomeLandingPage content={content} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createHomeLandingStructuredData(content)),
        }}
        type="application/ld+json"
      />
    </>
  );
}

async function resolveLocale(params: LocalizedPageProps["params"]) {
  const { locale } = await params;
  const parsedLocale = parsePublicLocale(locale);

  if (!parsedLocale) {
    notFound();
  }

  return parsedLocale satisfies PublicLocale;
}
