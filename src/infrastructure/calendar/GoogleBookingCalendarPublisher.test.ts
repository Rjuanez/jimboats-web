import { describe, expect, it } from "vitest";

import { Booking } from "@/modules/booking/domain/Booking";
import { CustomerDetails } from "@/modules/booking/domain/CustomerDetails";
import { PriceSnapshot } from "@/modules/booking/domain/PriceSnapshot";
import { SelectedSlot } from "@/modules/booking/domain/SelectedSlot";
import { Money } from "@/shared/domain/Money";

import { GoogleBookingCalendarPublisher } from "./GoogleBookingCalendarPublisher";
import type { GoogleCalendarEventsClient } from "./GoogleBookingCalendarPublisher";

describe("GoogleBookingCalendarPublisher", () => {
  it("inserts confirmed bookings as colored Google Calendar events", async () => {
    const events = new FakeGoogleEventsClient();
    const publisher = new GoogleBookingCalendarPublisher(events, {
      calendarId: "company-calendar",
    });

    const result = await publisher.upsertBookingEvent({
      booking: createBooking(),
      externalEventId: null,
    });

    expect(result.externalEventId).toMatch(/^jb[a-f0-9]{30}$/);
    expect(events.inserts[0]).toMatchObject({
      calendarId: "company-calendar",
      requestBody: {
        colorId: "10",
        end: {
          dateTime: "2026-06-10T14:00:00",
          timeZone: "Europe/Madrid",
        },
        start: {
          dateTime: "2026-06-10T10:00:00",
          timeZone: "Europe/Madrid",
        },
        summary: "[Confirmada] Sailor Guest - Sunset Cruise",
      },
      sendUpdates: "none",
    });
  });

  it("updates existing events and marks cancellations in red", async () => {
    const events = new FakeGoogleEventsClient();
    const publisher = new GoogleBookingCalendarPublisher(events, {
      calendarId: "company-calendar",
    });

    await publisher.markBookingEventCancelled({
      booking: createBooking({
        cancelledAt: new Date("2026-06-01T10:00:00.000Z"),
        status: "CANCELLED",
      }),
      externalEventId: "existing-event",
    });

    expect(events.updates[0]).toMatchObject({
      eventId: "existing-event",
      requestBody: {
        colorId: "11",
        summary: "[Cancelada] Sailor Guest - Sunset Cruise",
      },
    });
  });
});

class FakeGoogleEventsClient implements GoogleCalendarEventsClient {
  inserts: Parameters<GoogleCalendarEventsClient["insert"]>[0][] = [];
  updates: Parameters<GoogleCalendarEventsClient["update"]>[0][] = [];

  async insert(request: Parameters<GoogleCalendarEventsClient["insert"]>[0]) {
    this.inserts.push(request);

    return {
      data: {
        id: request.requestBody.id,
      },
    };
  }

  async update(request: Parameters<GoogleCalendarEventsClient["update"]>[0]) {
    this.updates.push(request);

    return {
      data: {
        id: request.eventId,
      },
    };
  }
}

function createBooking(
  patch: Partial<Parameters<typeof Booking.create>[0]> = {},
) {
  const createdAt = new Date("2026-06-01T09:00:00.000Z");

  return Booking.create({
    calendarBlockId: "block-booking-1",
    cancelledAt: null,
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
