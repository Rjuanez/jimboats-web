import { createHash } from "node:crypto";

import type { calendar_v3 } from "googleapis";

import type { Booking } from "@/modules/booking/domain/Booking";
import type {
  BookingCalendarPublishResult,
  BookingCalendarPublisher,
} from "@/modules/booking/application/ports/BookingCalendarPublisher";

type GoogleCalendarEventRequest = {
  calendarId: string;
  eventId: string;
  requestBody: calendar_v3.Schema$Event;
  sendUpdates: "none";
};

type GoogleCalendarEventInsertRequest = Omit<
  GoogleCalendarEventRequest,
  "eventId"
>;

export type GoogleCalendarEventsClient = {
  insert(
    request: GoogleCalendarEventInsertRequest,
  ): Promise<{ data: calendar_v3.Schema$Event }>;
  update(
    request: GoogleCalendarEventRequest,
  ): Promise<{ data: calendar_v3.Schema$Event }>;
};

export type GoogleBookingCalendarPublisherConfig = {
  calendarId: string;
};

const statusLabels = {
  CANCELLED: "Cancelada",
  CONFIRMED: "Confirmada",
  EXPIRED: "Expirada",
  PAYMENT_FAILED: "Pago fallido",
  PENDING_PAYMENT: "Pendiente",
} as const;

const statusColorIds = {
  CANCELLED: "11",
  CONFIRMED: "10",
  EXPIRED: "8",
  PAYMENT_FAILED: "11",
  PENDING_PAYMENT: "5",
} as const;

export class GoogleBookingCalendarPublisher implements BookingCalendarPublisher {
  constructor(
    private readonly events: GoogleCalendarEventsClient,
    private readonly config: GoogleBookingCalendarPublisherConfig,
  ) {}

  async upsertBookingEvent(input: {
    booking: Booking;
    externalEventId: string | null;
  }): Promise<BookingCalendarPublishResult> {
    const eventId =
      input.externalEventId ?? deterministicEventId(input.booking.id);
    const event = bookingToGoogleEvent(input.booking, eventId);

    if (input.externalEventId) {
      return this.updateOrInsert(eventId, event);
    }

    return this.insertOrUpdate(eventId, event);
  }

  async markBookingEventCancelled(input: {
    booking: Booking;
    externalEventId: string | null;
  }): Promise<BookingCalendarPublishResult | null> {
    if (!input.externalEventId) {
      return null;
    }

    return this.updateOrInsert(
      input.externalEventId,
      bookingToGoogleEvent(input.booking, input.externalEventId),
    );
  }

  private async insertOrUpdate(
    eventId: string,
    event: calendar_v3.Schema$Event,
  ): Promise<BookingCalendarPublishResult> {
    try {
      const response = await this.events.insert({
        calendarId: this.config.calendarId,
        requestBody: event,
        sendUpdates: "none",
      });

      return { externalEventId: response.data.id ?? eventId };
    } catch (error) {
      if (hasGoogleStatus(error, 409)) {
        return this.updateOrInsert(eventId, event);
      }

      throw error;
    }
  }

  private async updateOrInsert(
    eventId: string,
    event: calendar_v3.Schema$Event,
  ): Promise<BookingCalendarPublishResult> {
    try {
      const response = await this.events.update({
        calendarId: this.config.calendarId,
        eventId,
        requestBody: event,
        sendUpdates: "none",
      });

      return { externalEventId: response.data.id ?? eventId };
    } catch (error) {
      if (hasGoogleStatus(error, 404)) {
        return this.insertOrUpdate(eventId, event);
      }

      throw error;
    }
  }
}

function bookingToGoogleEvent(
  booking: Booking,
  eventId: string,
): calendar_v3.Schema$Event {
  const snapshot = booking.toSnapshot();
  const label = statusLabels[snapshot.status];
  const start = dateTimeFromLocalSlot(
    snapshot.selectedSlot.localDate,
    snapshot.selectedSlot.startMinutes,
  );
  const end = dateTimeFromLocalSlot(
    snapshot.selectedSlot.localDate,
    snapshot.selectedSlot.endMinutes,
  );

  return {
    colorId: statusColorIds[snapshot.status],
    description: [
      "Reserva generada automaticamente desde JimBoats.",
      "Los cambios deben hacerse desde el backpanel, no desde Google Calendar.",
      "",
      `Referencia: ${snapshot.reference}`,
      `Cliente: ${snapshot.customer.fullName}`,
      `Telefono: ${snapshot.customer.phone ?? "-"}`,
      `Email: ${snapshot.customer.email}`,
      `Experiencia: ${snapshot.experienceNameSnapshot}`,
      `Personas: ${snapshot.guestCount}`,
      `Estado: ${label}`,
      snapshot.internalNotes ? `Notas internas: ${snapshot.internalNotes}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
    end: {
      dateTime: end,
      timeZone: snapshot.selectedSlot.timeZone,
    },
    extendedProperties: {
      private: {
        bookingId: snapshot.id,
        reference: snapshot.reference,
        source: "jimboats",
      },
    },
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: false,
    id: eventId,
    start: {
      dateTime: start,
      timeZone: snapshot.selectedSlot.timeZone,
    },
    summary: `[${label}] ${snapshot.customer.fullName} - ${snapshot.experienceNameSnapshot}`,
    transparency: "opaque",
  };
}

function dateTimeFromLocalSlot(localDate: string, minutes: number) {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");

  return `${localDate}T${hour}:${minute}:00`;
}

function deterministicEventId(bookingId: string) {
  return `jb${createHash("sha256").update(bookingId).digest("hex").slice(0, 30)}`;
}

function hasGoogleStatus(error: unknown, status: number) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    response?: {
      status?: unknown;
    };
  };

  return candidate.code === status || candidate.response?.status === status;
}
