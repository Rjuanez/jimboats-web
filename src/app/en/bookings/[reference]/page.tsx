import type { Metadata } from "next";

import { PublicBookingAccessSection } from "@/components/sections/public-booking/PublicBookingAccessSection";
import { getContainer } from "@/container";
import { parsePublicBookingAccess } from "@/interface/next/validators/publicBookingValidators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Details",
  robots: {
    follow: false,
    index: false,
  },
};

type PublicBookingAccessPageProps = {
  params: Promise<{
    reference: string;
  }>;
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

export default async function PublicBookingAccessPage({
  params,
  searchParams,
}: PublicBookingAccessPageProps) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const tokenParam = queryParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const content = await getBookingAccessContent({
    reference: routeParams.reference,
    token,
  });

  return <PublicBookingAccessSection content={content} />;
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
