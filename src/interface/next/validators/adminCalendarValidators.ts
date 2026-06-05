import { z } from "zod";

import type {
  AdminCalendarManualBlockInput,
  AdminCalendarReleaseBlockInput,
} from "@/components/sections/admin-calendar/AdminCalendarTypes";

const localDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.");
const clockTimeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a time in HH:mm format.");

export const adminCalendarRangeSchema = z.object({
  fromLocalDate: localDateSchema,
  toLocalDate: localDateSchema,
});

export const adminManualCalendarBlockSchema = adminCalendarRangeSchema.extend({
  endTime: clockTimeSchema,
  localDate: localDateSchema,
  reason: z.string().trim().min(1, "Manual block reason is required."),
  startTime: clockTimeSchema,
});

export const adminReleaseCalendarBlockSchema = adminCalendarRangeSchema.extend({
  calendarBlockId: z.string().trim().min(1, "Calendar block id is required."),
});

export function parseAdminManualCalendarBlock(
  input: AdminCalendarManualBlockInput,
) {
  return adminManualCalendarBlockSchema.parse(input);
}

export function parseAdminReleaseCalendarBlock(
  input: AdminCalendarReleaseBlockInput,
) {
  return adminReleaseCalendarBlockSchema.parse(input);
}

export function parseAdminCalendarSearchParams(input: {
  from?: string | string[];
  to?: string | string[];
}) {
  const fromLocalDate = readFirst(input.from);
  const toLocalDate = readFirst(input.to);

  if (!fromLocalDate || !toLocalDate) {
    return {};
  }

  const parsed = adminCalendarRangeSchema.parse({
    fromLocalDate,
    toLocalDate,
  });

  return parsed;
}

function readFirst(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
