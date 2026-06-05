import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { CalendarBlock } from "./CalendarBlock";

describe("CalendarBlock", () => {
  it("creates a manual active block", () => {
    const block = createCalendarBlock();

    expect(block.toSnapshot()).toMatchObject({
      bookingId: null,
      id: "block-1",
      reason: "Maintenance window",
      source: "MANUAL_BLOCK",
      status: "ACTIVE",
      visibleEndMinutes: 12 * 60,
      visibleStartMinutes: 10 * 60,
    });
  });

  it("rejects manual blocks without reason", () => {
    expect(() => createCalendarBlock({ reason: " " })).toThrow(DomainError);
  });

  it("creates a confirmed booking block", () => {
    const block = CalendarBlock.create({
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      createdByUserId: "admin-user",
      experienceId: "sunset-cruise",
      expiresAt: null,
      id: "booking-block-1",
      localDate: "2026-06-05",
      protectedEndAt: new Date("2026-06-05T12:30:00.000Z"),
      protectedStartAt: new Date("2026-06-05T09:30:00.000Z"),
      reason: "Booking JB-2026-0001",
      source: "BOOKING_CONFIRMED",
      status: "ACTIVE",
      timeZone: "Europe/Madrid",
      updatedAt: new Date("2026-06-01T10:00:00.000Z"),
      visibleEndMinutes: 12 * 60,
      visibleStartMinutes: 10 * 60,
    });

    expect(block.toSnapshot()).toMatchObject({
      bookingId: "booking-1",
      experienceId: "sunset-cruise",
      source: "BOOKING_CONFIRMED",
    });
  });

  it("creates a public checkout booking hold block", () => {
    const block = CalendarBlock.create({
      bookingId: "booking-1",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      createdByUserId: "public-checkout",
      experienceId: "sunset-cruise",
      expiresAt: new Date("2026-06-01T10:15:00.000Z"),
      id: "booking-hold-1",
      localDate: "2026-06-05",
      protectedEndAt: new Date("2026-06-05T12:30:00.000Z"),
      protectedStartAt: new Date("2026-06-05T09:30:00.000Z"),
      reason: "Checkout hold JB-2026-0001",
      source: "BOOKING_HOLD",
      status: "ACTIVE",
      timeZone: "Europe/Madrid",
      updatedAt: new Date("2026-06-01T10:00:00.000Z"),
      visibleEndMinutes: 12 * 60,
      visibleStartMinutes: 10 * 60,
    });

    expect(block.toSnapshot()).toMatchObject({
      bookingId: "booking-1",
      experienceId: "sunset-cruise",
      expiresAt: "2026-06-01T10:15:00.000Z",
      source: "BOOKING_HOLD",
    });
  });

  it("rejects public checkout holds without expiry", () => {
    expect(() =>
      CalendarBlock.create({
        bookingId: "booking-1",
        createdAt: new Date("2026-06-01T10:00:00.000Z"),
        createdByUserId: "public-checkout",
        experienceId: "sunset-cruise",
        expiresAt: null,
        id: "booking-hold-1",
        localDate: "2026-06-05",
        protectedEndAt: new Date("2026-06-05T12:30:00.000Z"),
        protectedStartAt: new Date("2026-06-05T09:30:00.000Z"),
        reason: "Checkout hold JB-2026-0001",
        source: "BOOKING_HOLD",
        status: "ACTIVE",
        timeZone: "Europe/Madrid",
        updatedAt: new Date("2026-06-01T10:00:00.000Z"),
        visibleEndMinutes: 12 * 60,
        visibleStartMinutes: 10 * 60,
      }),
    ).toThrow(DomainError);
  });

  it("detects active protected range overlaps", () => {
    const block = createCalendarBlock();

    expect(
      block.overlapsProtectedRange(
        new Date("2026-06-05T09:30:00.000Z"),
        new Date("2026-06-05T10:30:00.000Z"),
      ),
    ).toBe(true);
    expect(
      block.overlapsProtectedRange(
        new Date("2026-06-05T12:00:00.000Z"),
        new Date("2026-06-05T13:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("releases an active manual block", () => {
    const released = createCalendarBlock().release(
      new Date("2026-06-01T10:30:00.000Z"),
    );

    expect(released.toSnapshot()).toMatchObject({
      status: "RELEASED",
      updatedAt: "2026-06-01T10:30:00.000Z",
    });
  });

  it("does not release an inactive block twice", () => {
    const released = createCalendarBlock().release(
      new Date("2026-06-01T10:30:00.000Z"),
    );

    expect(() =>
      released.release(new Date("2026-06-01T10:35:00.000Z")),
    ).toThrow(DomainError);
  });
});

function createCalendarBlock(
  patch: Partial<Parameters<typeof CalendarBlock.createManual>[0]> = {},
) {
  return CalendarBlock.createManual({
    createdAt: new Date("2026-06-01T10:00:00.000Z"),
    createdByUserId: "admin-user",
    id: "block-1",
    localDate: "2026-06-05",
    protectedEndAt: new Date("2026-06-05T12:00:00.000Z"),
    protectedStartAt: new Date("2026-06-05T10:00:00.000Z"),
    reason: "Maintenance window",
    timeZone: "Europe/Madrid",
    visibleEndMinutes: 12 * 60,
    visibleStartMinutes: 10 * 60,
    ...patch,
  });
}
