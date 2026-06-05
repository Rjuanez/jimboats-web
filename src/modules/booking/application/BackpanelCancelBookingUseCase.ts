import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminBookingDto,
  BackpanelCancelBookingCommand,
} from "./AdminBookingDtos";
import { bookingToAdminDto } from "./BookingApplicationMappers";
import { createBackpanelBookingCancelledRecords } from "./BookingLifecycleRecords";
import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";

export class BackpanelCancelBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
  ) {}

  async execute(command: BackpanelCancelBookingCommand): Promise<AdminBookingDto> {
    const current = await this.bookings.findById(command.bookingId);

    if (!current) {
      throw new ApplicationError("BOOKING_NOT_FOUND", "Booking was not found.");
    }

    if (current.status === "CANCELLED") {
      throw new ApplicationError(
        "BOOKING_ALREADY_CANCELLED",
        "Booking is already cancelled.",
      );
    }

    if (current.status !== "CONFIRMED") {
      throw new ApplicationError(
        "BOOKING_NOT_EDITABLE",
        "Only confirmed bookings can be cancelled from the backpanel.",
      );
    }

    const cancelledAt = this.clock.now();
    const booking = current.cancel({ cancelledAt });
    const lifecycleRecords = createBackpanelBookingCancelledRecords({
      actorUserId: command.cancelledByUserId,
      after: booking,
      before: current,
      occurredAt: cancelledAt,
    });

    await this.bookings.saveAdminCancelledBooking({
      auditEntries: lifecycleRecords.auditEntries,
      booking,
      calendarBlockId: current.toSnapshot().calendarBlockId,
      outboxEvents: lifecycleRecords.outboxEvents,
      releasedAt: cancelledAt,
    });

    return bookingToAdminDto(booking);
  }
}
