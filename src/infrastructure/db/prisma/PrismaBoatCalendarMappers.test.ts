import { describe, expect, it } from "vitest";

import { CalendarBlock } from "@/modules/boat-calendar/domain/CalendarBlock";

import {
  calendarBlockFromPrismaRecord,
  calendarBlockToPrismaWriteModel,
} from "./PrismaBoatCalendarMappers";
import type { PrismaCalendarBlockRecord } from "./PrismaBoatCalendarMappers";

describe("Prisma boat calendar mappers", () => {
  it("maps a calendar block record into the domain model", () => {
    const block = calendarBlockFromPrismaRecord(calendarBlockRecord());

    expect(block.toSnapshot()).toMatchObject({
      bookingId: null,
      id: "block-1",
      localDate: "2026-06-05",
      reason: "Maintenance window",
      source: "MANUAL_BLOCK",
      status: "ACTIVE",
    });
  });

  it("maps a calendar block domain model into persistence write data", () => {
    const writeModel = calendarBlockToPrismaWriteModel(createCalendarBlock());

    expect(writeModel).toMatchObject({
      block: {
        createdByUserId: "admin-user",
        bookingId: null,
        experienceId: null,
        expiresAt: null,
        localDate: new Date("2026-06-05T00:00:00.000Z"),
        protectedEndAt: new Date("2026-06-05T10:00:00.000Z"),
        protectedStartAt: new Date("2026-06-05T08:00:00.000Z"),
        reason: "Maintenance window",
        status: "ACTIVE",
      },
      id: "block-1",
    });
  });

  it("maps persisted booking hold records into the domain model", () => {
    const block = calendarBlockFromPrismaRecord(
      calendarBlockRecord({
        bookingId: "booking-1",
        createdByUserId: "public-checkout",
        experienceId: "sunset-cruise",
        expiresAt: new Date("2026-06-01T10:15:00.000Z"),
        reason: "Checkout hold JB-2026-0001",
        source: "BOOKING_HOLD",
      }),
    );

    expect(block.toSnapshot()).toMatchObject({
      bookingId: "booking-1",
      experienceId: "sunset-cruise",
      expiresAt: "2026-06-01T10:15:00.000Z",
      source: "BOOKING_HOLD",
    });
  });
});

export function calendarBlockRecord(
  patch: Partial<PrismaCalendarBlockRecord> = {},
): PrismaCalendarBlockRecord {
  return {
    bookingId: null,
    createdAt: new Date("2026-06-01T10:00:00.000Z"),
    createdByUserId: "admin-user",
    experienceId: null,
    expiresAt: null,
    id: "block-1",
    localDate: new Date("2026-06-05T00:00:00.000Z"),
    protectedEndAt: new Date("2026-06-05T10:00:00.000Z"),
    protectedStartAt: new Date("2026-06-05T08:00:00.000Z"),
    reason: "Maintenance window",
    source: "MANUAL_BLOCK",
    status: "ACTIVE",
    timeZone: "Europe/Madrid",
    updatedAt: new Date("2026-06-01T10:00:00.000Z"),
    visibleEndMinutes: 12 * 60,
    visibleStartMinutes: 10 * 60,
    ...patch,
  };
}

export function createCalendarBlock(
  patch: Partial<Parameters<typeof CalendarBlock.createManual>[0]> = {},
) {
  return CalendarBlock.createManual({
    createdAt: new Date("2026-06-01T10:00:00.000Z"),
    createdByUserId: "admin-user",
    id: "block-1",
    localDate: "2026-06-05",
    protectedEndAt: new Date("2026-06-05T10:00:00.000Z"),
    protectedStartAt: new Date("2026-06-05T08:00:00.000Z"),
    reason: "Maintenance window",
    timeZone: "Europe/Madrid",
    visibleEndMinutes: 12 * 60,
    visibleStartMinutes: 10 * 60,
    ...patch,
  });
}
