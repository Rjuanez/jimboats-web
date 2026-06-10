import type {
  BookingCalendarPublishResult,
  BookingCalendarPublisher,
} from "@/modules/booking/application/ports/BookingCalendarPublisher";

export class NoopBookingCalendarPublisher implements BookingCalendarPublisher {
  async markBookingEventCancelled(): Promise<BookingCalendarPublishResult | null> {
    return null;
  }

  async upsertBookingEvent(): Promise<BookingCalendarPublishResult | null> {
    return null;
  }
}
