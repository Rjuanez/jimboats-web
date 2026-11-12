import { getBookingAdsPrivacy } from "@/interface/next/config/bookingAdsPrivacy";
import { saveBookingAdsChoiceAction, recordBookingWhatsAppClickAction } from "@/interface/next/actions/bookingAdsActions";
import { BookingPrivacyPreferences } from "@/components/sections/public-booking/BookingPrivacyPreferences";
import {
  simulateHourlyPaymentAction,
  abandonHourlyCheckoutAction,
} from "@/interface/next/actions/hourlyBookingActions";
import { notFound, redirect } from "next/navigation";
import { HourlyPublicBookingWorkspace } from "@/components/sections/public-booking/HourlyPublicBookingWorkspace";
import { getHourlyPublicBookingPage } from "@/interface/next/presenters/hourlyPublicBookingPresenter";
import {
  previewPublicBookingCouponAction,
  startPublicBookingCheckoutAction,
} from "@/interface/next/actions/publicBookingActions";
import { getPublicStripePublishableKey } from "@/interface/next/config/publicStripeConfig";
import { isMarketingLocale, marketingPath } from "@/content/marketing/routes";
import { PublicClientAnalyticsBoundary } from "@/interface/next/analytics/PublicClientAnalyticsBoundary";
import { getPublicStatsigConfig } from "@/interface/next/config/publicStatsigConfig";
import LegacyBookingPage from "@/interface/next/pages/LegacyBookingPage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "JimBoats · Booking",
  robots: { index: false, follow: false },
};
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    experience?: string | string[];
    hours?: string | string[];
  }>;
};
export default async function BookingPage(props: Props) {
  const { locale } = await props.params;
  if (locale === "ca") return <LegacyBookingPage {...props} />;
  if (!isMarketingLocale(locale)) notFound();
  const query = await props.searchParams;
  const experience = Array.isArray(query.experience)
    ? query.experience[0]
    : query.experience;
  if (!experience) redirect(`${marketingPath(locale)}#experiences`);
  const hours = Number(
    Array.isArray(query.hours) ? query.hours[0] : query.hours,
  );
  const content = await getHourlyPublicBookingPage(locale, experience, hours);
  if (!content) redirect(`${marketingPath(locale)}#experiences`);
  const workspace = (
    <PublicClientAnalyticsBoundary
      config={getPublicStatsigConfig()}
      metadata={{
        locale,
        path: `/${locale}/book`,
        initial_experience_id: experience,
      }}
      viewEventName="booking_page_viewed"
    >
      <HourlyPublicBookingWorkspace
        localPaymentActions={
          process.env.JIMBOATS_LOCAL_BOOKINGS === "1"
            ? {
                simulate: simulateHourlyPaymentAction,
                abandon: abandonHourlyCheckoutAction,
              }
            : undefined
        }
        content={content}
        actions={{
          previewCoupon: previewPublicBookingCouponAction,
          startCheckout: startPublicBookingCheckoutAction,
        }}
        stripePublishableKey={getPublicStripePublishableKey()}
      />
    </PublicClientAnalyticsBoundary>
  );
  const adsPrivacy = await getBookingAdsPrivacy();
  return adsPrivacy.enabled || process.env.JIMBOATS_LOCAL_BOOKINGS === "1" || process.env.JIMBOATS_SEO_PREVIEW === "1" ? (
    <BookingPrivacyPreferences
      locale={locale} privacyHref={content.privacy.href}
      initialChoice={adsPrivacy.initialChoice}
      measurement={adsPrivacy.enabled ? {
        saveChoice: saveBookingAdsChoiceAction,
        whatsappClick: recordBookingWhatsAppClickAction,
      } : undefined}
    >
      {workspace}
    </BookingPrivacyPreferences>
  ) : workspace;
}
