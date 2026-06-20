import { describe, expect, it } from "vitest";

import { Money } from "@/shared/domain/Money";

import { BookingCalendarSyncService } from "./BookingCalendarSyncService";
import type { BookingCalendarPublisher } from "./ports/BookingCalendarPublisher";
import type { BookingCalendarSyncState } from "./ports/BookingRepository";
import { Booking } from "../domain/Booking";
import { CustomerDetails } from "../domain/CustomerDetails";
import { PriceSnapshot } from "../domain/PriceSnapshot";
import { SelectedSlot } from "../domain/SelectedSlot";

describe("BookingCalendarSyncService", () => {
  it("publishes confirmed bookings and stores the external event id", async () => {
    const bookings = new FakeCalendarSyncRepository();
    const publisher = new FakeCalendarPublisher();
    const service = new BookingCalendarSyncService(
      bookings,
      publisher,
      fixedClock(),
    );

    await service.syncConfirmedBooking(createBooking());

    expect(publisher.upserts).toMatchObject([
      {
        externalEventId: null,
      },
    ]);
    expect(bookings.synced).toMatchObject({
      bookingId: "booking-1",
      externalEventId: "google-event-1",
      syncedAt: new Date("2026-06-01T10:00:00.000Z"),
    });
  });

  it("marks existing external events as cancelled", async () => {
    const bookings = new FakeCalendarSyncRepository({
      externalEventId: "google-event-1",
      syncError: null,
      syncedAt: null,
    });
    const publisher = new FakeCalendarPublisher();
    const service = new BookingCalendarSyncService(
      bookings,
      publisher,
      fixedClock(),
    );

    await service.syncCancelledBooking(
      createBooking({
        cancelledAt: new Date("2026-06-01T10:00:00.000Z"),
        status: "CANCELLED",
      }),
    );

    expect(publisher.cancellations).toMatchObject([
      {
        externalEventId: "google-event-1",
      },
    ]);
    expect(bookings.synced).toMatchObject({
      externalEventId: "google-event-1",
    });
  });

  it("stores publisher errors without throwing", async () => {
    const bookings = new FakeCalendarSyncRepository();
    const publisher = new FakeCalendarPublisher();
    publisher.nextError = new Error("Google Calendar is unavailable.");
    const service = new BookingCalendarSyncService(
      bookings,
      publisher,
      fixedClock(),
    );

    await expect(
      service.syncConfirmedBooking(createBooking()),
    ).resolves.toBeUndefined();
    expect(bookings.failed).toMatchObject({
      bookingId: "booking-1",
      syncError: "Google Calendar is unavailable.",
    });
  });
});

class FakeCalendarSyncRepository {
  failed: {
    bookingId: string;
    syncError: string;
  } | null = null;
  synced: {
    bookingId: string;
    externalEventId: string;
    syncedAt: Date;
  } | null = null;

  constructor(private state: BookingCalendarSyncState | null = defaultState()) {}

  async findCalendarSyncState() {
    return this.state;
  }

  async markCalendarSyncFailed(input: {
    bookingId: string;
    syncError: string;
  }) {
    this.failed = input;
  }

  async markCalendarSynced(input: {
    bookingId: string;
    externalEventId: string;
    syncedAt: Date;
  }) {
    this.synced = input;
    this.state = {
      externalEventId: input.externalEventId,
      syncError: null,
      syncedAt: input.syncedAt,
    };
  }
}

class FakeCalendarPublisher implements BookingCalendarPublisher {
  cancellations: Array<{ externalEventId: string | null }> = [];
  nextError: Error | null = null;
  upserts: Array<{ externalEventId: string | null }> = [];

  async markBookingEventCancelled(input: { externalEventId: string | null }) {
    this.throwIfNeeded();
    this.cancellations.push({ externalEventId: input.externalEventId });

    return input.externalEventId
      ? { externalEventId: input.externalEventId }
      : null;
  }

  async upsertBookingEvent(input: { externalEventId: string | null }) {
    this.throwIfNeeded();
    this.upserts.push({ externalEventId: input.externalEventId });

    return { externalEventId: input.externalEventId ?? "google-event-1" };
  }

  private throwIfNeeded() {
    if (this.nextError) {
      throw this.nextError;
    }
  }
}

function defaultState(): BookingCalendarSyncState {
  return {
    externalEventId: null,
    syncError: null,
    syncedAt: null,
  };
}

function fixedClock() {
  return {
    now: () => new Date("2026-06-01T10:00:00.000Z"),
  };
}

function createBooking(
  patch: Partial<Parameters<typeof Booking.create>[0]> = {},
) {
  const createdAt = new Date("2026-06-01T09:00:00.000Z");

  return Booking.create({
    calendarBlockId: "block-booking-1",
    cancelledAt: null,
    checkoutLastSeenAt: null,
    confirmedAt: createdAt,
    createdAt,
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
    holdExpiresAt: null,
    id: "booking-1",
    internalNotes: "",
    paymentRecordId: "payment-1",
    priceSnapshot: PriceSnapshot.create({
      basePrice: money(1_200_00),
      capturedAt: createdAt,
      depositAmount: money(10_000),
      extraLines: [],
      remainingAmount: money(1_100_00),
      totalAmount: money(1_200_00),
    }),
    reference: "JB-2026-0001",
    selectedSlot: SelectedSlot.create({
      endMinutes: 14 * 60,
      localDate: "2026-06-10",
      slotKey: "morning",
      startMinutes: 10 * 60,
      timeZone: "Europe/Madrid",
    }),
    source: "BACKPANEL",
    status: "CONFIRMED",
    updatedAt: createdAt,
    ...patch,
  });
}

function money(amountMinor: number) {
  return Money.create({
    amountMinor,
    currency: "EUR",
  });
}
