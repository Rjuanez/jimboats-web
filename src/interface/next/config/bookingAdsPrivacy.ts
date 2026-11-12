import { cookies } from "next/headers";
import { getBookingAdsMeasurement } from "@/container";

export const bookingAdsConsentCookie = "jimboats_ads_consent_v1";

export async function bookingAdsConsentId(): Promise<string | null> {
  const value = (await cookies()).get(bookingAdsConsentCookie)?.value;
  return value && (value === "denied-v1" || /^[0-9a-f-]{36}$/i.test(value))
    ? value
    : null;
}

export async function getBookingAdsPrivacy() {
  const measurement = getBookingAdsMeasurement();
  if (!measurement) return { enabled: false, initialChoice: null };
  try {
    return {
      enabled: true,
      initialChoice: await measurement.choice(await bookingAdsConsentId()),
    };
  } catch {
    // A measurement outage must not make bookings unavailable.
    return { enabled: true, initialChoice: null };
  }
}

export async function getBookingAdsAttribution() {
  try {
    const measurement = getBookingAdsMeasurement();
    return measurement
      ? await measurement.attribution(await bookingAdsConsentId())
      : undefined;
  } catch {
    // Fail closed for advertising while preserving the payment flow.
    return undefined;
  }
}
