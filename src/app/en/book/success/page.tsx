import type { Metadata } from "next";

import { PublicBookingReturnSection } from "@/components/sections/public-booking/PublicBookingReturnSection";
import { getContainer } from "@/container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Payment Return",
  robots: {
    follow: false,
    index: false,
  },
};

type PublicBookingSuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string | string[];
  }>;
};

export default async function PublicBookingSuccessPage({
  searchParams,
}: PublicBookingSuccessPageProps) {
  const params = await searchParams;
  const sessionParam = params?.session_id;
  const sessionId = Array.isArray(sessionParam)
    ? sessionParam[0]
    : sessionParam;
  const content = await getReturnContent(sessionId);

  return <PublicBookingReturnSection content={content} sessionId={sessionId} />;
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
