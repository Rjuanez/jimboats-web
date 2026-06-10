import type { BookingCalendarSynchronizer } from "./BookingCalendarSyncService";
import type { BookingRepository } from "./ports/BookingRepository";

type ReconcileBookingCalendarSyncRepository = Pick<
  BookingRepository,
  "findBookingsPendingCalendarSync"
>;

export type ReconcileBookingCalendarSyncResultDto = {
  cancelledSyncAttempts: number;
  confirmedSyncAttempts: number;
  scannedBookings: number;
};

export class ReconcileBookingCalendarSyncUseCase {
  constructor(
    private readonly bookings: ReconcileBookingCalendarSyncRepository,
    private readonly bookingCalendarSync: BookingCalendarSynchronizer,
  ) {}

  async execute(input: {
    limit: number;
  }): Promise<ReconcileBookingCalendarSyncResultDto> {
    const bookings = await this.bookings.findBookingsPendingCalendarSync({
      limit: normalizeLimit(input.limit),
    });
    let cancelledSyncAttempts = 0;
    let confirmedSyncAttempts = 0;

    for (const booking of bookings) {
      if (booking.status === "CONFIRMED") {
        confirmedSyncAttempts += 1;
        await this.bookingCalendarSync.syncConfirmedBooking(booking);
        continue;
      }

      if (booking.status === "CANCELLED") {
        cancelledSyncAttempts += 1;
        await this.bookingCalendarSync.syncCancelledBooking(booking);
      }
    }

    return {
      cancelledSyncAttempts,
      confirmedSyncAttempts,
      scannedBookings: bookings.length,
    };
  }
}

function normalizeLimit(limit: number) {
  if (!Number.isInteger(limit) || limit <= 0) {
    return 50;
  }

  return Math.min(limit, 500);
}
