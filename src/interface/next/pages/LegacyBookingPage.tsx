import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicBookingWorkspace } from "@/components/sections/public-booking/PublicBookingWorkspace";
import {
  createLanguageAlternates,
  parsePublicLocale,
  type PublicLocale,
} from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";
import {
  previewPublicBookingCouponAction,
  startPublicBookingCheckoutAction,
} from "@/interface/next/actions/publicBookingActions";
import { PublicClientAnalyticsBoundary } from "@/interface/next/analytics/PublicClientAnalyticsBoundary";
import { getPublicStripePublishableKey } from "@/interface/next/config/publicStripeConfig";
import { getPublicStatsigConfig } from "@/interface/next/config/publicStatsigConfig";
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
  const content = await getPublicBookingPage(locale, {
    includeAvailability: false,
  });
  const stripePublishableKey = getPublicStripePublishableKey();
  const queryParams = await searchParams;
  const experienceParam = queryParams?.experience;
  const initialExperienceId = Array.isArray(experienceParam)
    ? experienceParam[0]
    : experienceParam;
  const statsigConfig = getPublicStatsigConfig();

  return (
    <PublicClientAnalyticsBoundary
      config={statsigConfig}
      metadata={{
        ...(initialExperienceId
          ? { initial_experience_id: initialExperienceId }
          : {}),
        locale,
        path: `/${locale}/book`,
      }}
      viewEventName="booking_page_viewed"
    >
      <PublicBookingWorkspace
        actions={{
          previewCoupon: previewPublicBookingCouponAction,
          startCheckout: startPublicBookingCheckoutAction,
        }}
        content={content}
        initialExperienceId={initialExperienceId}
        stripePublishableKey={stripePublishableKey}
      />
    </PublicClientAnalyticsBoundary>
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
