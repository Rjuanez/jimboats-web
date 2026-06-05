import type { Metadata } from "next";

import { HomeLandingPage } from "@/components/sections/HomeLandingPage";
import {
  createHomeLandingStructuredData,
  getHomeLandingPage,
  homeLandingContent,
} from "@/interface/next/presenters/homeLandingPresenter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Boat Experiences in Barcelona",
  description:
    "Premium private boat charters in Barcelona for sunset cruises, celebrations, proposals and Mediterranean moments at sea.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
    },
  },
  openGraph: {
    title: "Private Boat Experiences in Barcelona | JimBoats",
    description:
      "Premium private boat charters in Barcelona for sunset cruises, celebrations, proposals and Mediterranean moments at sea.",
    images: [
      {
        url: "/images/generated/landing/hero-sunset-barcelona-1024.webp",
        width: 1024,
        height: 1024,
        alt: homeLandingContent.hero.image.alt,
      },
    ],
    locale: "en",
    siteName: "JimBoats",
    type: "website",
  },
};

export default async function EnglishHomePage() {
  const content = await getHomeLandingPage("en");

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
