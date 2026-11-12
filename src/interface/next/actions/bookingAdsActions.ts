"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getBookingAdsMeasurement } from "@/container";
import { adsConsentLifetimeSeconds } from "@/modules/ads/application/BookingAdsMeasurement";
import {
  bookingAdsConsentCookie,
  bookingAdsConsentId,
} from "../config/bookingAdsPrivacy";

const choiceSchema = z.object({
  advertising: z.boolean(),
  oppref: z.string().min(1).max(500).nullable(),
});
const localeSchema = z.enum(["es", "en", "fr", "de", "nl"]);

export async function saveBookingAdsChoiceAction(input: {
  advertising: boolean;
  oppref: string | null;
}): Promise<{ ok: boolean }> {
  try {
    const measurement = getBookingAdsMeasurement();
    if (!measurement) return { ok: false };
    const choice = choiceSchema.parse(input);
    const id = await measurement.save({
      ...choice,
      oppref: choice.advertising ? choice.oppref : null,
      previousId: await bookingAdsConsentId(),
    });
    (await cookies()).set(bookingAdsConsentCookie, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: adsConsentLifetimeSeconds,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function recordBookingWhatsAppClickAction(
  locale: string,
): Promise<void> {
  try {
    const measurement = getBookingAdsMeasurement();
    if (!measurement) return;
    await measurement.whatsapp(
      await bookingAdsConsentId(),
      localeSchema.parse(locale),
    );
  } catch {
    // WhatsApp navigation must never wait for, or fail because of, measurement.
  }
}
