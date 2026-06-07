import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicBookingReturnSection } from "@/components/sections/public-booking/PublicBookingReturnSection";
import { getContainer } from "@/container";
import {
  parsePublicLocale,
  type PublicLocale,
} from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";

export const dynamic = "force-dynamic";

type PublicBookingSuccessPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    session_id?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: PublicBookingSuccessPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.metadata.bookingReturn.title,
    robots: {
      follow: false,
      index: false,
    },
  };
}

export default async function PublicBookingSuccessPage({
  params,
  searchParams,
}: PublicBookingSuccessPageProps) {
  const locale = await resolveLocale(params);
  const dictionary = getPublicDictionary(locale);
  const queryParams = await searchParams;
  const sessionParam = queryParams?.session_id;
  const sessionId = Array.isArray(sessionParam)
    ? sessionParam[0]
    : sessionParam;
  const content = await getReturnContent(sessionId);

  return (
    <PublicBookingReturnSection
      content={content}
      dictionary={dictionary}
      locale={locale}
      sessionId={sessionId}
    />
  );
}

async function getReturnContent(sessionId: string | undefined) {
  if (!sessionId) {
    return null;
  }

  try {
    return await getContainer().publicBooking.getCheckoutReturn({
      providerSessionId: sessionId,
    });
  } catch {
    return null;
  }
}

async function resolveLocale(params: PublicBookingSuccessPageProps["params"]) {
  const { locale } = await params;
  const parsedLocale = parsePublicLocale(locale);

  if (!parsedLocale) {
    notFound();
  }

  return parsedLocale satisfies PublicLocale;
}
