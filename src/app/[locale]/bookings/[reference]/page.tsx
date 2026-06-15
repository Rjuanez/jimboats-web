import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicBookingAccessSection } from "@/components/sections/public-booking/PublicBookingAccessSection";
import { getContainer } from "@/container";
import { parsePublicLocale, type PublicLocale } from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";
import { PublicClientAnalyticsBoundary } from "@/interface/next/analytics/PublicClientAnalyticsBoundary";
import { getPublicStatsigConfig } from "@/interface/next/config/publicStatsigConfig";
import { parsePublicBookingAccess } from "@/interface/next/validators/publicBookingValidators";

export const dynamic = "force-dynamic";

type PublicBookingAccessPageProps = {
  params: Promise<{
    locale: string;
    reference: string;
  }>;
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: PublicBookingAccessPageProps): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.metadata.bookingAccess.title,
    robots: {
      follow: false,
      index: false,
    },
  };
}

export default async function PublicBookingAccessPage({
  params,
  searchParams,
}: PublicBookingAccessPageProps) {
  const { locale, reference } = await resolveParams(params);
  const dictionary = getPublicDictionary(locale);
  const queryParams = await searchParams;
  const tokenParam = queryParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const content = await getBookingAccessContent({
    reference,
    token,
  });
  const statsigConfig = getPublicStatsigConfig();

  return (
    <PublicClientAnalyticsBoundary
      config={statsigConfig}
      metadata={{
        locale,
        path: `/${locale}/bookings/[reference]`,
      }}
    >
      <PublicBookingAccessSection
        content={content}
        dictionary={dictionary}
        locale={locale}
      />
    </PublicClientAnalyticsBoundary>
  );
}

async function getBookingAccessContent(input: {
  reference: string;
  token: string | undefined;
}) {
  try {
    const query = parsePublicBookingAccess(input);

    return await getContainer().publicBooking.viewBooking({
      accessToken: query.token,
      reference: query.reference,
    });
  } catch {
    return null;
  }
}

async function resolveParams(params: PublicBookingAccessPageProps["params"]) {
  const { locale, reference } = await params;
  const parsedLocale = parsePublicLocale(locale);

  if (!parsedLocale) {
    notFound();
  }

  return {
    locale: parsedLocale satisfies PublicLocale,
    reference,
  };
}
