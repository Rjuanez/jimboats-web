import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicBookingWorkspace } from "@/components/sections/public-booking/PublicBookingWorkspace";
import {
  createLanguageAlternates,
  parsePublicLocale,
  type PublicLocale,
} from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";
import { startPublicBookingCheckoutAction } from "@/interface/next/actions/publicBookingActions";
import { getPublicStripePublishableKey } from "@/interface/next/config/publicStripeConfig";
import { getPublicBookingPage } from "@/interface/next/presenters/publicBookingPresenter";

export const dynamic = "force-dynamic";

type PublicBookingPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    experience?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: PublicBookingPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.metadata.booking.title,
    description: dictionary.metadata.booking.description,
    alternates: {
      canonical: `/${locale}/book`,
      languages: createLanguageAlternates("/book"),
    },
    robots: {
      follow: false,
      index: false,
    },
  };
}

export default async function PublicBookingPage({
  params,
  searchParams,
}: PublicBookingPageProps) {
  const locale = await resolveLocale(params);
  const content = await getPublicBookingPage(locale);
  const stripePublishableKey = getPublicStripePublishableKey();
  const queryParams = await searchParams;
  const experienceParam = queryParams?.experience;
  const initialExperienceId = Array.isArray(experienceParam)
    ? experienceParam[0]
    : experienceParam;

  return (
    <PublicBookingWorkspace
      actions={{
        startCheckout: startPublicBookingCheckoutAction,
      }}
      content={content}
      initialExperienceId={initialExperienceId}
      stripePublishableKey={stripePublishableKey}
    />
  );
}

async function resolveLocale(params: PublicBookingPageProps["params"]) {
  const { locale } = await params;
  const parsedLocale = parsePublicLocale(locale);

  if (!parsedLocale) {
    notFound();
  }

  return parsedLocale satisfies PublicLocale;
}
