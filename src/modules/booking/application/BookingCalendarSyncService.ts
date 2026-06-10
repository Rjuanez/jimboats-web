import type { Booking } from "../domain/Booking";
import type { BookingCalendarPublisher } from "./ports/BookingCalendarPublisher";
import type { BookingClock } from "./ports/BookingClock";
import type {
  BookingCalendarSyncState,
  BookingRepository,
} from "./ports/BookingRepository";

type BookingCalendarSyncRepository = Pick<
  BookingRepository,
  | "findCalendarSyncState"
  | "markCalendarSyncFailed"
  | "markCalendarSynced"
>;

export type BookingCalendarSynchronizer = {
  syncCancelledBooking(booking: Booking): Promise<void>;
  syncConfirmedBooking(booking: Booking): Promise<void>;
};

export class BookingCalendarSyncService implements BookingCalendarSynchronizer {
  constructor(
    private readonly bookings: BookingCalendarSyncRepository,
    private readonly publisher: BookingCalendarPublisher,
    private readonly clock: BookingClock,
  ) {}

  async syncConfirmedBooking(booking: Booking): Promise<void> {
    if (booking.status !== "CONFIRMED") {
      return;
    }

    await this.syncBooking(booking, "upsert");
  }

  async syncCancelledBooking(booking: Booking): Promise<void> {
    if (booking.status !== "CANCELLED") {
      return;
    }

    await this.syncBooking(booking, "cancel");
  }

  private async syncBooking(
    booking: Booking,
    action: "cancel" | "upsert",
  ): Promise<void> {
    const bookingId = booking.id;

    try {
      const state = await this.bookings.findCalendarSyncState(bookingId);

      if (!state) {
        return;
      }

      const result = await this.publish(action, booking, state);

      if (!result) {
        return;
      }

      await this.bookings.markCalendarSynced({
        bookingId,
        externalEventId: result.externalEventId,
        syncedAt: this.clock.now(),
      });
    } catch (error) {
      await this.recordFailure(bookingId, error);
    }
  }

  private publish(
    action: "cancel" | "upsert",
    booking: Booking,
    state: BookingCalendarSyncState,
  ) {
    if (action === "cancel") {
      return this.publisher.markBookingEventCancelled({
        booking,
        externalEventId: state.externalEventId,
      });
    }

    return this.publisher.upsertBookingEvent({
      booking,
      externalEventId: state.externalEventId,
    });
  }

  private async recordFailure(bookingId: string, error: unknown) {
    try {
      await this.bookings.markCalendarSyncFailed({
        bookingId,
        syncError: errorMessage(error),
      });
    } catch {
      // Calendar sync is a non-critical side effect; reservation writes stay valid.
    }
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Unknown calendar sync error.";
}
