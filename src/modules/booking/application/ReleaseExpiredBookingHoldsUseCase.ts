import type { ReleaseCouponRedemptionUseCase } from "@/modules/coupons/application/ReleaseCouponRedemptionUseCase";

import type { BookingClock } from "./ports/BookingClock";
import type { BookingRepository } from "./ports/BookingRepository";

export type ReleaseExpiredBookingHoldsResultDto = {
  expiredBookingIds: string[];
};

export class ReleaseExpiredBookingHoldsUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly clock: BookingClock,
    private readonly releaseCouponRedemption?: ReleaseCouponRedemptionUseCase,
  ) {}

  async execute(input: {
    limit: number;
    now?: Date;
  }): Promise<ReleaseExpiredBookingHoldsResultDto> {
    const now = input.now ?? this.clock.now();
    const expiredHolds = await this.bookings.findExpiredPaymentHolds({
      limit: input.limit,
      now,
    });
    const expiredBookingIds: string[] = [];

    for (const bookingPayment of expiredHolds) {
      const snapshot = bookingPayment.booking.toSnapshot();

      if (snapshot.status !== "PENDING_PAYMENT") {
        continue;
      }

      const expiredBooking = bookingPayment.booking.expirePaymentHold({
        expiredAt: now,
      });
      const cancelledPayment = bookingPayment.paymentRecord.markCancelled({
        failureReason: "Checkout hold expired before payment was completed.",
      });

      const result = await this.bookings.savePaymentHoldReleased({
        booking: expiredBooking,
        calendarBlockId: snapshot.calendarBlockId,
        paymentRecord: cancelledPayment,
        releasedAt: now,
      });

      if (result !== "RELEASED") {
        continue;
      }

      await this.releaseCouponRedemption?.execute({
        bookingId: snapshot.id,
        releasedAt: now,
      });

      expiredBookingIds.push(snapshot.id);
    }

    return { expiredBookingIds };
  }
}
