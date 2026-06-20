import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

import { Booking } from "./Booking";
import { CustomerDetails } from "./CustomerDetails";
import { PaymentRecord } from "./PaymentRecord";
import { PriceSnapshot } from "./PriceSnapshot";
import { SelectedSlot } from "./SelectedSlot";

describe("Booking domain", () => {
  it("creates a confirmed backpanel booking with frozen price and payment", () => {
    const booking = createBooking();

    expect(booking.toSnapshot()).toMatchObject({
      calendarBlockId: "calendar-block-1",
      customer: {
        email: "sailor@example.com",
        fullName: "Sailor Guest",
        preferredLocale: "en",
      },
      experienceId: "sunset-cruise",
      guestCount: 4,
      priceSnapshot: {
        depositAmount: moneyDto(10_000),
        remainingAmount: moneyDto(1_270_00),
        totalAmount: moneyDto(1_370_00),
      },
      reference: "JB-2026-0001",
      status: "CONFIRMED",
    });
  });

  it("creates a public pending booking protected by a checkout hold", () => {
    const holdExpiresAt = new Date("2026-06-01T10:30:00.000Z");
    const booking = createPublicPendingBooking({ holdExpiresAt });

    expect(booking.toSnapshot()).toMatchObject({
      confirmedAt: null,
      createdByUserId: null,
      holdExpiresAt: holdExpiresAt.toISOString(),
      source: "PUBLIC_CHECKOUT",
      status: "PENDING_PAYMENT",
    });
  });

  it("confirms a pending public booking when the deposit payment succeeds", () => {
    const confirmedAt = new Date("2026-06-01T10:05:00.000Z");
    const booking = createPublicPendingBooking().confirmDepositPayment({
      confirmedAt,
    });

    expect(booking.toSnapshot()).toMatchObject({
      confirmedAt: confirmedAt.toISOString(),
      holdExpiresAt: null,
      status: "CONFIRMED",
    });
  });

  it("expires pending public booking holds", () => {
    const expiredAt = new Date("2026-06-01T10:31:00.000Z");
    const booking = createPublicPendingBooking().expirePaymentHold({
      expiredAt,
    });

    expect(booking.toSnapshot()).toMatchObject({
      holdExpiresAt: null,
      status: "EXPIRED",
      updatedAt: expiredAt.toISOString(),
    });
  });

  it("marks pending public booking holds as exited", () => {
    const exitedAt = new Date("2026-06-01T10:12:00.000Z");
    const booking = createPublicPendingBooking().exitPaymentHold({
      exitedAt,
    });

    expect(booking.toSnapshot()).toMatchObject({
      holdExpiresAt: null,
      status: "EXITED",
      updatedAt: exitedAt.toISOString(),
    });
  });

  it("rejects public pending bookings without a hold expiration", () => {
    const now = new Date("2026-06-01T10:00:00.000Z");
    const paymentRecord = PaymentRecord.createStripePendingDeposit({
      amount: money(10_000),
      bookingId: "booking-1",
      createdAt: now,
      id: "payment-1",
    });

    expect(() =>
      Booking.create({
        calendarBlockId: "calendar-block-1",
        cancelledAt: null,
        confirmedAt: null,
        createdAt: now,
        createdByUserId: null,
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
        holdExpiresAt: null,
        id: "booking-1",
        internalNotes: "",
        paymentRecordId: paymentRecord.id,
        priceSnapshot: PriceSnapshot.create({
          basePrice: money(1_200_00),
          capturedAt: now,
          depositAmount: money(10_000),
          extraLines: [],
          remainingAmount: money(1_100_00),
          totalAmount: money(1_200_00),
        }),
        reference: "jb-2026-0001",
        selectedSlot: SelectedSlot.create({
          endMinutes: 14 * 60,
          localDate: "2026-06-05",
          slotKey: "morning",
          startMinutes: 10 * 60,
          timeZone: "Europe/Madrid",
        }),
        source: "PUBLIC_CHECKOUT",
        status: "PENDING_PAYMENT",
        updatedAt: now,
      }),
    ).toThrow(DomainError);
  });

  it("tracks Stripe deposit payment lifecycle", () => {
    const createdAt = new Date("2026-06-01T10:00:00.000Z");
    const paidAt = new Date("2026-06-01T10:05:00.000Z");
    const payment = PaymentRecord.createStripePendingDeposit({
      amount: money(10_000),
      bookingId: "booking-1",
      createdAt,
      id: "payment-1",
    })
      .withCheckoutSession({ providerSessionId: "cs_test_123" })
      .markSucceeded({
        paidAt,
        providerPaymentIntentId: "pi_test_123",
        providerSessionId: "cs_test_123",
      });

    expect(payment.toSnapshot()).toMatchObject({
      paidAt: paidAt.toISOString(),
      provider: "STRIPE",
      providerPaymentIntentId: "pi_test_123",
      providerSessionId: "cs_test_123",
      status: "SUCCEEDED",
    });
  });

  it("rejects confirmed bookings without calendar block", () => {
    expect(() => createBooking({ calendarBlockId: " " })).toThrow(DomainError);
  });

  it("updates operational booking details while preserving identity", () => {
    const updatedAt = new Date("2026-06-02T10:00:00.000Z");
    const booking = createBooking().updateOperationalDetails({
      customer: CustomerDetails.create({
        email: "updated@example.com",
        fullName: "Updated Guest",
        notes: "Needs invoice.",
        phone: null,
        preferredLocale: "es",
      }),
      guestCount: 2,
      internalNotes: "Moved from phone request.",
      priceSnapshot: PriceSnapshot.create({
        basePrice: money(1_200_00),
        capturedAt: updatedAt,
        depositAmount: money(10_000),
        extraLines: [],
        remainingAmount: money(1_100_00),
        totalAmount: money(1_200_00),
      }),
      selectedSlot: SelectedSlot.create({
        endMinutes: 16 * 60,
        localDate: "2026-06-08",
        slotKey: "afternoon",
        startMinutes: 12 * 60,
        timeZone: "Europe/Madrid",
      }),
      updatedAt,
    });

    expect(booking.toSnapshot()).toMatchObject({
      customer: {
        email: "updated@example.com",
        fullName: "Updated Guest",
        preferredLocale: "es",
      },
      guestCount: 2,
      id: "booking-1",
      internalNotes: "Moved from phone request.",
      selectedSlot: {
        localDate: "2026-06-08",
        slotKey: "afternoon",
      },
      status: "CONFIRMED",
      updatedAt: updatedAt.toISOString(),
    });
  });

  it("cancels confirmed bookings", () => {
    const cancelledAt = new Date("2026-06-02T11:00:00.000Z");
    const booking = createBooking().cancel({ cancelledAt });

    expect(booking.toSnapshot()).toMatchObject({
      cancelledAt: cancelledAt.toISOString(),
      status: "CANCELLED",
      updatedAt: cancelledAt.toISOString(),
    });
  });

  it("rejects updates for cancelled bookings", () => {
    const cancelled = createBooking().cancel({
      cancelledAt: new Date("2026-06-02T11:00:00.000Z"),
    });

    expect(() =>
      cancelled.updateOperationalDetails({
        customer: CustomerDetails.create({
          email: "updated@example.com",
          fullName: "Updated Guest",
          notes: "",
          phone: null,
          preferredLocale: "en",
        }),
        guestCount: 2,
        internalNotes: "",
        priceSnapshot: PriceSnapshot.create({
          basePrice: money(1_200_00),
          capturedAt: new Date("2026-06-02T12:00:00.000Z"),
          depositAmount: money(10_000),
          extraLines: [],
          remainingAmount: money(1_100_00),
          totalAmount: money(1_200_00),
        }),
        selectedSlot: SelectedSlot.create({
          endMinutes: 14 * 60,
          localDate: "2026-06-05",
          slotKey: "morning",
          startMinutes: 10 * 60,
          timeZone: "Europe/Madrid",
        }),
        updatedAt: new Date("2026-06-02T12:00:00.000Z"),
      }),
    ).toThrow(DomainError);
  });

  it("rejects invalid customer details", () => {
    expect(() =>
      createBooking({
        customer: CustomerDetails.create({
          email: "invalid",
          fullName: "Sailor Guest",
          notes: "",
          phone: null,
          preferredLocale: "en",
        }),
      }),
    ).toThrow(DomainError);
  });

  it("rejects inconsistent price snapshots", () => {
    expect(() =>
      PriceSnapshot.create({
        basePrice: money(1_200_00),
        capturedAt: new Date("2026-06-01T10:00:00.000Z"),
        depositAmount: money(10_000),
        extraLines: [],
        remainingAmount: money(1_000_00),
        totalAmount: money(1_200_00),
      }),
    ).toThrow(DomainError);
  });

  it("rejects invalid selected slots", () => {
    expect(() =>
      SelectedSlot.create({
        endMinutes: 10 * 60,
        localDate: "2026-06-05",
        slotKey: null,
        startMinutes: 12 * 60,
        timeZone: "Europe/Madrid",
      }),
    ).toThrow(DomainError);
  });
});

function createBooking(patch: Partial<Parameters<typeof Booking.create>[0]> = {}) {
  const now = new Date("2026-06-01T10:00:00.000Z");
  const paymentRecord = PaymentRecord.createManualDeposit({
    amount: money(10_000),
    bookingId: "booking-1",
    createdAt: now,
    id: "payment-1",
    paidAt: now,
  });

  return Booking.create({
    calendarBlockId: "calendar-block-1",
    cancelledAt: null,
    confirmedAt: now,
    createdAt: now,
    createdByUserId: "admin-user",
    customer: CustomerDetails.create({
      email: "SAILOR@example.com",
      fullName: " Sailor   Guest ",
      notes: "",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    }),
    experienceId: "sunset-cruise",
    experienceNameSnapshot: "Sunset Cruise",
    guestCount: 4,
    holdExpiresAt: null,
    id: "booking-1",
    internalNotes: "",
    paymentRecordId: paymentRecord.id,
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
        {
          extraId: "snacks",
          nameSnapshot: "Snacks",
          quantity: 2,
          totalPrice: money(8_000),
          unitPrice: money(4_000),
        },
      ],
      remainingAmount: money(1_270_00),
      totalAmount: money(1_370_00),
    }),
    reference: "jb-2026-0001",
    selectedSlot: SelectedSlot.create({
      endMinutes: 14 * 60,
      localDate: "2026-06-05",
      slotKey: "morning",
      startMinutes: 10 * 60,
      timeZone: "Europe/Madrid",
    }),
    source: "BACKPANEL",
    status: "CONFIRMED",
    updatedAt: now,
    ...patch,
  });
}

function createPublicPendingBooking(
  patch: Partial<Parameters<typeof Booking.createPublicPending>[0]> = {},
) {
  const now = new Date("2026-06-01T10:00:00.000Z");
  const paymentRecord = PaymentRecord.createStripePendingDeposit({
    amount: money(10_000),
    bookingId: "booking-1",
    createdAt: now,
    id: "payment-1",
  });

  return Booking.createPublicPending({
    calendarBlockId: "calendar-block-1",
    createdAt: now,
    customer: CustomerDetails.create({
      email: "SAILOR@example.com",
      fullName: " Sailor   Guest ",
      notes: "",
      phone: "+34 600 000 000",
      preferredLocale: "en",
    }),
    experienceId: "sunset-cruise",
    experienceNameSnapshot: "Sunset Cruise",
    guestCount: 4,
    holdExpiresAt: new Date("2026-06-01T10:30:00.000Z"),
    id: "booking-1",
    paymentRecord,
    priceSnapshot: PriceSnapshot.create({
      basePrice: money(1_200_00),
      capturedAt: now,
      depositAmount: money(10_000),
      extraLines: [],
      remainingAmount: money(1_100_00),
      totalAmount: money(1_200_00),
    }),
    reference: "jb-2026-0001",
    selectedSlot: SelectedSlot.create({
      endMinutes: 14 * 60,
      localDate: "2026-06-05",
      slotKey: "morning",
      startMinutes: 10 * 60,
      timeZone: "Europe/Madrid",
    }),
    ...patch,
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
