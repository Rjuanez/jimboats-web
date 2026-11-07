"use server";

import { z } from "zod";
import { getContainer } from "@/container";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

const selection = z.object({
  experienceId: z.enum(["daytrip", "ex-sunset", "sunrise", "romantic"]),
  hours: z.number().int().min(1).max(6),
  localDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }),
});
const checkout = selection.extend({
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  guestCount: z.number().int().positive().max(99),
  locale: z.enum(["es", "en", "fr", "de", "nl"]),
  fullName: z.string().trim().min(1).max(200),
  email: z.email(),
  phone: z.string().trim().min(1).max(50),
  acceptedTerms: z.literal(true),
});
async function result<T>(work: () => Promise<T>) {
  try {
    return { ok: true as const, value: await work() };
  } catch (error) {
    const code =
      error instanceof ApplicationError || error instanceof DomainError
        ? error.code
        : error instanceof z.ZodError
          ? "INVALID_INPUT"
          : "BOOKING_UNAVAILABLE";
    if (code === "BOOKING_UNAVAILABLE")
      console.error("Hourly booking failed", error);
    return { ok: false as const, code };
  }
}
export async function getHourlyQuoteAction(input: unknown) {
  return result(() =>
    getContainer().hourlyBooking.quote(selection.parse(input)),
  );
}
export async function createHourlyBookingAction(input: unknown) {
  return result(async () => {
    const command = checkout.parse(input);
    const origin = process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3100";
    return getContainer().hourlyBooking.create({
      ...command,
      customer: {
        fullName: command.fullName,
        email: command.email,
        phone: command.phone,
        // Existing transactional templates support ES/EN/CA. Booking UI supports all five marketing locales.
        preferredLocale: command.locale === "es" ? "es" : "en",
      },
      consents: { ticketEmail: false, ticketWhatsapp: false },
      termsLocale: command.locale,
      returnUrl: `${origin}/${command.locale === "es" ? "es" : "en"}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    });
  });
}
export async function simulateHourlyPaymentAction(sessionId: string) {
  return result(() =>
    getContainer().hourlyBooking.simulatePayment(
      z
        .string()
        .regex(/^local_[0-9a-f-]{36}$/)
        .parse(sessionId),
    ),
  );
}
export async function abandonHourlyCheckoutAction(sessionId: string) {
  return result(() =>
    getContainer().publicBooking.exitCheckout({
      providerSessionId: z.string().min(1).parse(sessionId),
    }),
  );
}
