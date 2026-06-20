import { ApplicationError } from "@/shared/application/ApplicationError";

import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";
import type {
  RecordPublicBookingCheckoutHeartbeatCommand,
  RecordPublicBookingCheckoutHeartbeatResultDto,
} from "./PublicCheckoutDtos";

export class RecordPublicBookingCheckoutHeartbeatUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
  ) {}

  async execute(
    command: RecordPublicBookingCheckoutHeartbeatCommand,
  ): Promise<RecordPublicBookingCheckoutHeartbeatResultDto> {
    const providerSessionId = command.providerSessionId.trim();

    if (!providerSessionId) {
      throw new ApplicationError(
        "BOOKING_PAYMENT_SESSION_MISSING",
        "Checkout session is required.",
      );
    }

    const bookingPayment =
      await this.bookings.findByPaymentProviderSessionId(providerSessionId);

    if (!bookingPayment) {
      return {
        action: "IGNORED",
        bookingId: null,
      };
    }

    const snapshot = bookingPayment.booking.toSnapshot();

    if (snapshot.status !== "PENDING_PAYMENT") {
      return {
        action: "IGNORED",
        bookingId: snapshot.id,
      };
    }

    const seenAt = this.clock.now();
    const touchedBooking = bookingPayment.booking.touchPaymentHoldHeartbeat({
      seenAt,
    });
    const result = await this.bookings.savePaymentHoldHeartbeat({
      booking: touchedBooking,
      seenAt,
    });

    return {
      action: result === "RECORDED" ? "RECORDED" : "IGNORED",
      bookingId: snapshot.id,
    };
  }
}
