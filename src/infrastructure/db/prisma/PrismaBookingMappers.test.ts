import { describe, expect, it } from "vitest";

import { CustomerDetails } from "@/modules/booking/domain/CustomerDetails";
import { PaymentRecord } from "@/modules/booking/domain/PaymentRecord";
import { Money } from "@/shared/domain/Money";

import {
  bookingExperienceOptionFromPrismaRecord,
  bookingFromPrismaRecord,
  bookingToPrismaWriteModel,
  paymentRecordToPrismaWriteModel,
} from "./PrismaBookingMappers";
import type {
  PrismaBookingExperienceRecord,
  PrismaBookingRecord,
} from "./PrismaBookingMappers";
import { Booking } from "@/modules/booking/domain/Booking";
import { PriceSnapshot } from "@/modules/booking/domain/PriceSnapshot";
import { SelectedSlot } from "@/modules/booking/domain/SelectedSlot";

describe("Prisma booking mappers", () => {
  it("maps a booking record into the domain model", () => {
    const booking = bookingFromPrismaRecord(bookingRecord());

    expect(booking.toSnapshot()).toMatchObject({
      customer: {
        email: "sailor@example.com",
      },
      experienceId: "sunset-cruise",
      priceSnapshot: {
        totalAmount: moneyDto(1_290_00),
      },
      reference: "JB-2026-0001",
      selectedSlot: {
        localDate: "2026-06-10",
      },
      status: "CONFIRMED",
    });
  });

  it("maps a booking domain model into persistence write data", () => {
    const writeModel = bookingToPrismaWriteModel(
      createBooking(),
      new Map([["champagne", "line-champagne"]]),
    );

    expect(writeModel).toMatchObject({
      booking: {
        customerEmail: "sailor@example.com",
        depositAmountMinor: 10_000,
        selectedLocalDate: new Date("2026-06-10T00:00:00.000Z"),
        status: "CONFIRMED",
      },
      extras: [
        {
          extraId: "champagne",
          id: "line-champagne",
          totalAmountMinor: 9_000,
        },
      ],
      id: "booking-1",
    });
  });

  it("maps payment records into persistence write data", () => {
    const payment = paymentRecordToPrismaWriteModel(
      PaymentRecord.createManualDeposit({
        amount: money(10_000),
        bookingId: "booking-1",
        createdAt: new Date("2026-06-01T10:00:00.000Z"),
        id: "payment-1",
        paidAt: new Date("2026-06-01T10:00:00.000Z"),
      }),
    );

    expect(payment).toMatchObject({
      amountMinor: 10_000,
      provider: "MANUAL",
      status: "MANUALLY_PAID",
    });
  });

  it("maps experience options needed by the booking use case", () => {
    const option = bookingExperienceOptionFromPrismaRecord(experienceRecord());

    expect(option).toMatchObject({
      extraSelectionRules: [
        {
          extraId: "champagne",
          limitPerBooking: 1,
        },
      ],
      id: "sunset-cruise",
      slotPolicy: {
        fixedSlots: [
          {
            id: "morning",
          },
        ],
        mode: "FIXED_SLOTS",
      },
    });
  });
});

export function bookingRecord(
  patch: Partial<PrismaBookingRecord> = {},
): PrismaBookingRecord {
  return {
    calendarBlockId: "block-booking-1",
    cancelledAt: null,
    cashRemainingAmountMinor: 1_190_00,
    cashRemainingCurrency: "EUR",
    checkoutLastSeenAt: null,
    confirmedAt: new Date("2026-06-01T10:00:00.000Z"),
    createdAt: new Date("2026-06-01T10:00:00.000Z"),
    createdByUserId: "admin-user",
    customerEmail: "sailor@example.com",
    customerLocale: "en",
    customerName: "Sailor Guest",
    customerNotes: "",
    customerPhone: "+34 600 000 000",
    depositAmountMinor: 10_000,
    depositCurrency: "EUR",
    experienceId: "sunset-cruise",
    experienceNameSnapshot: "Sunset Cruise",
    externalCalendarEventId: null,
    externalCalendarSyncError: null,
    externalCalendarSyncedAt: null,
    extras: [
      {
        extraId: "champagne",
        id: "line-champagne",
        nameSnapshot: "Premium champagne",
        quantity: 1,
        totalAmountMinor: 9_000,
        totalCurrency: "EUR",
        unitAmountMinor: 9_000,
        unitCurrency: "EUR",
      },
    ],
    guestCount: 4,
    holdExpiresAt: null,
    id: "booking-1",
    internalNotes: "",
    operationsSeenAt: new Date("2026-06-01T10:00:00.000Z"),
    paymentRecordId: "payment-1",
    priceCapturedAt: new Date("2026-06-01T10:00:00.000Z"),
    reference: "JB-2026-0001",
    selectedEndMinutes: 14 * 60,
    selectedLocalDate: new Date("2026-06-10T00:00:00.000Z"),
    selectedSlotKey: "morning",
    selectedStartMinutes: 10 * 60,
    source: "BACKPANEL",
    status: "CONFIRMED",
    timeZone: "Europe/Madrid",
    totalAmountMinor: 1_290_00,
    totalCurrency: "EUR",
    updatedAt: new Date("2026-06-01T10:00:00.000Z"),
    ...patch,
  };
}

export function experienceRecord(
  patch: Partial<PrismaBookingExperienceRecord> = {},
): PrismaBookingExperienceRecord {
  return {
    allowsManualScheduling: true,
    basePriceAmountMinor: 1_200_00,
    basePriceCurrency: "EUR",
    bufferMinutes: 30,
    capacity: 10,
    depositAmountMinor: 10_000,
    depositCurrency: "EUR",
    durationMinutes: 4 * 60,
    extraRules: [
      {
        capacityReduction: 1,
        enabled: true,
        extraId: "champagne",
        limitPerBooking: 1,
        noticeMinutes: 24 * 60,
        priceOverrideAmountMinor: null,
        priceOverrideCurrency: null,
      },
    ],
    fixedSlots: [
      {
        enabled: true,
        endMinutes: 14 * 60,
        label: "Morning",
        position: 1,
        slotKey: "morning",
        startMinutes: 10 * 60,
      },
    ],
    id: "sunset-cruise",
    internalName: "Sunset Cruise",
    maximumAdvanceMonths: 6,
    minimumAdvanceMinutes: 60,
    slotGranularityMinutes: null,
    slotOperatingEndMinutes: null,
    slotOperatingStartMinutes: null,
    slotPolicyMode: "FIXED_SLOTS",
    slotPolicyTimezone: "Europe/Madrid",
    status: "READY",
    ...patch,
  };
}

function createBooking() {
  const now = new Date("2026-06-01T10:00:00.000Z");
  const payment = PaymentRecord.createManualDeposit({
    amount: money(10_000),
    bookingId: "booking-1",
    createdAt: now,
    id: "payment-1",
    paidAt: now,
  });

  return Booking.createBackpanelConfirmed({
    calendarBlockId: "block-booking-1",
    createdAt: now,
    createdByUserId: "admin-user",
    customer: CustomerDetails.create({
      email: "sailor@example.com",
      fullName: "Sailor Guest",
      notes: "",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    }),
    experienceId: "sunset-cruise",
    experienceNameSnapshot: "Sunset Cruise",
    guestCount: 4,
    id: "booking-1",
    internalNotes: "",
    paymentRecord: payment,
    priceSnapshot: PriceSnapshot.create({
      basePrice: money(1_200_00),
      capturedAt: now,
      depositAmount: money(10_000),
      extraLines: [
        {
          extraId: "champagne",
          nameSnapshot: "Premium champagne",
          quantity: 1,
          totalPrice: money(9_000),
          unitPrice: money(9_000),
        },
      ],
      remainingAmount: money(1_190_00),
      totalAmount: money(1_290_00),
    }),
    reference: "JB-2026-0001",
    selectedSlot: SelectedSlot.create({
      endMinutes: 14 * 60,
      localDate: "2026-06-10",
      slotKey: "morning",
      startMinutes: 10 * 60,
      timeZone: "Europe/Madrid",
    }),
  });
}

function money(amountMinor: number) {
  return Money.create(moneyDto(amountMinor));
}

function moneyDto(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR" as const,
  };
}
