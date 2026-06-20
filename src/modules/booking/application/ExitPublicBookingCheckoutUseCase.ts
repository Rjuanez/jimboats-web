import { ApplicationError } from "@/shared/application/ApplicationError";
import type { ReleaseCouponRedemptionUseCase } from "@/modules/coupons/application/ReleaseCouponRedemptionUseCase";

import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";
import type {
  ExitPublicBookingCheckoutCommand,
  ExitPublicBookingCheckoutResultDto,
} from "./PublicCheckoutDtos";

export class ExitPublicBookingCheckoutUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
    private readonly releaseCouponRedemption?: ReleaseCouponRedemptionUseCase,
  ) {}

  async execute(
    command: ExitPublicBookingCheckoutCommand,
  ): Promise<ExitPublicBookingCheckoutResultDto> {
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

    const now = this.clock.now();
    const exitedBooking = bookingPayment.booking.exitPaymentHold({
      exitedAt: now,
    });
    const cancelledPayment = bookingPayment.paymentRecord.markCancelled({
      failureReason: "Customer exited checkout before payment was completed.",
      providerSessionId,
    });

    const result = await this.bookings.savePaymentHoldReleased({
      booking: exitedBooking,
      calendarBlockId: snapshot.calendarBlockId,
      paymentRecord: cancelledPayment,
      releasedAt: now,
    });

    if (result !== "RELEASED") {
      return {
        action: "IGNORED",
        bookingId: snapshot.id,
      };
    }

    await this.releaseCouponRedemption?.execute({
      bookingId: snapshot.id,
      releasedAt: now,
    });

    return {
      action: "EXITED",
      bookingId: snapshot.id,
    };
  }
}
