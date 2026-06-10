import type { BookingCalendarPublisher } from "@/modules/booking/application/ports/BookingCalendarPublisher";
import type { Booking } from "@/modules/booking/domain/Booking";

import { GoogleBookingCalendarPublisher } from "./GoogleBookingCalendarPublisher";
import { NoopBookingCalendarPublisher } from "./NoopBookingCalendarPublisher";

export function createBookingCalendarPublisherFromEnv(): BookingCalendarPublisher {
  if (!isGoogleCalendarEnabled()) {
    return new NoopBookingCalendarPublisher();
  }

  return new LazyGoogleBookingCalendarPublisher({
    calendarId: requiredEnv("GOOGLE_CALENDAR_ID"),
    clientEmail: requiredEnv("GOOGLE_CLIENT_EMAIL"),
    privateKey: normalizePrivateKey(requiredEnv("GOOGLE_PRIVATE_KEY")),
  });
}

type LazyGoogleBookingCalendarPublisherConfig = {
  calendarId: string;
  clientEmail: string;
  privateKey: string;
};

class LazyGoogleBookingCalendarPublisher implements BookingCalendarPublisher {
  private publisher: BookingCalendarPublisher | null = null;

  constructor(
    private readonly config: LazyGoogleBookingCalendarPublisherConfig,
  ) {}

  async upsertBookingEvent(input: {
    booking: Booking;
    externalEventId: string | null;
  }) {
    return (await this.getPublisher()).upsertBookingEvent(input);
  }

  async markBookingEventCancelled(input: {
    booking: Booking;
    externalEventId: string | null;
  }) {
    return (await this.getPublisher()).markBookingEventCancelled(input);
  }

  private async getPublisher() {
    if (this.publisher) {
      return this.publisher;
    }

    const { google } = await import("googleapis");
    const auth = new google.auth.JWT({
      email: this.config.clientEmail,
      key: this.config.privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    const calendar = google.calendar({
      auth,
      version: "v3",
    });

    this.publisher = new GoogleBookingCalendarPublisher(calendar.events, {
      calendarId: this.config.calendarId,
    });

    return this.publisher;
  }
}

function isGoogleCalendarEnabled() {
  return (process.env.GOOGLE_CALENDAR_ENABLED ?? "false")
    .trim()
    .toLowerCase() === "true";
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required when GOOGLE_CALENDAR_ENABLED=true.`);
  }

  return value;
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}
