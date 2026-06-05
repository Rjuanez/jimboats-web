import type { Metadata } from "next";

import { PublicBookingWorkspace } from "@/components/sections/public-booking/PublicBookingWorkspace";
import { startPublicBookingCheckoutAction } from "@/interface/next/actions/publicBookingActions";
import { getPublicStripePublishableKey } from "@/interface/next/config/publicStripeConfig";
import { getPublicBookingPage } from "@/interface/next/presenters/publicBookingPresenter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Private Boat Experience",
  description:
    "Choose a JimBoats private boat experience, available date, extras and deposit payment.",
  robots: {
    follow: false,
    index: false,
  },
};

type PublicBookingPageProps = {
  searchParams?: Promise<{
    experience?: string | string[];
  }>;
};

export default async function PublicBookingPage({
  searchParams,
}: PublicBookingPageProps) {
  const content = await getPublicBookingPage("en");
  const stripePublishableKey = getPublicStripePublishableKey();
  const params = await searchParams;
  const experienceParam = params?.experience;
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
