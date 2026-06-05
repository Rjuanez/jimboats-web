import { z } from "zod";

import type {
  AdminBookingCancelInput,
  AdminBookingCreateInput,
  AdminBookingIssueAccessLinkInput,
  AdminBookingUpdateInput,
} from "@/components/sections/admin-bookings/AdminBookingTypes";

const localDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.");
const clockTimeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a time in HH:mm format.");

const adminBookingMutationSchema = z.object({
  customerEmail: z.string().trim().email("Customer email is invalid."),
  customerName: z.string().trim().min(1, "Customer name is required."),
  customerNotes: z.string().trim(),
  customerPhone: z.string().trim(),
  endTime: clockTimeSchema,
  experienceId: z.string().trim().min(1, "Experience is required."),
  guestCount: z.number().int().positive("Guest count must be positive."),
  internalNotes: z.string().trim(),
  localDate: localDateSchema,
  selectedExtras: z.array(
    z.object({
      extraId: z.string().trim().min(1),
      quantity: z.number().int().nonnegative(),
    }),
  ),
  slotKey: z.string().trim().min(1).nullable(),
  startTime: clockTimeSchema,
});

export const adminBookingCreateSchema = adminBookingMutationSchema;

export const adminBookingUpdateSchema = adminBookingMutationSchema.extend({
  bookingId: z.string().trim().min(1, "Booking is required."),
});

export const adminBookingCancelSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking is required."),
});

export const adminBookingIssueAccessLinkSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking is required."),
});

export function parseAdminBookingCreate(input: AdminBookingCreateInput) {
  return adminBookingCreateSchema.parse(input);
}

export function parseAdminBookingUpdate(input: AdminBookingUpdateInput) {
  return adminBookingUpdateSchema.parse(input);
}

export function parseAdminBookingCancel(input: AdminBookingCancelInput) {
  return adminBookingCancelSchema.parse(input);
}

export function parseAdminBookingIssueAccessLink(
  input: AdminBookingIssueAccessLinkInput,
) {
  return adminBookingIssueAccessLinkSchema.parse(input);
}
