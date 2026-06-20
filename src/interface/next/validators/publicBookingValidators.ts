import { z } from "zod";

import type { PublicBookingCheckoutInput } from "@/components/sections/public-booking/PublicBookingTypes";

const localeSchema = z.enum(["ca", "en", "es"]);
const localDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.");
const clockTimeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a time in HH:mm format.");

export const publicBookingCheckoutSchema = z.object({
  consents: z.object({
    marketing: z.boolean(),
    ticketEmail: z.boolean(),
    ticketWhatsapp: z.boolean(),
  }),
  couponCode: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .nullable()
    .optional(),
  customer: z.object({
    email: z.string().trim().email("Email is invalid."),
    fullName: z.string().trim().min(1, "Full name is required."),
    phone: z.string().trim(),
  }),
  endTime: clockTimeSchema,
  experienceId: z.string().trim().min(1, "Experience is required."),
  guestCount: z.number().int().min(1).max(99),
  localDate: localDateSchema,
  locale: localeSchema,
  selectedExtras: z.array(
    z.object({
      extraId: z.string().trim().min(1),
      quantity: z.number().int().positive(),
    }),
  ),
  slotKey: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .nullable(),
  startTime: clockTimeSchema,
});

export const publicBookingCouponPreviewSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required."),
  depositAmountMinor: z.number().int().min(0),
  experienceId: z.string().trim().min(1, "Experience is required."),
  subtotalAmountMinor: z.number().int().min(0),
});

export const publicBookingAccessSchema = z.object({
  reference: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

export const publicBookingCheckoutExitSchema = z.object({
  providerSessionId: z.string().trim().min(1, "Checkout session is required."),
});

export function parsePublicBookingCheckout(input: PublicBookingCheckoutInput) {
  return publicBookingCheckoutSchema.parse(input);
}

export function parsePublicBookingCouponPreview(input: unknown) {
  return publicBookingCouponPreviewSchema.parse(input);
}

export function parsePublicBookingAccess(input: {
  reference: unknown;
  token: unknown;
}) {
  return publicBookingAccessSchema.parse(input);
}

export function parsePublicBookingCheckoutExit(input: unknown) {
  return publicBookingCheckoutExitSchema.parse(input);
}
