import type { Booking } from "../../domain/Booking";

export type BookingCalendarPublishResult = {
  externalEventId: string;
};

export type BookingCalendarPublisher = {
  markBookingEventCancelled(input: {
    booking: Booking;
    externalEventId: string | null;
  }): Promise<BookingCalendarPublishResult | null>;
  upsertBookingEvent(input: {
    booking: Booking;
    externalEventId: string | null;
  }): Promise<BookingCalendarPublishResult | null>;
};
