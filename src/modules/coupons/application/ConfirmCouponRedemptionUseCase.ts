import type { CouponRepository } from "./ports/CouponRepository";

export class ConfirmCouponRedemptionUseCase {
  constructor(private readonly coupons: CouponRepository) {}

  async execute(input: { bookingId: string; confirmedAt: Date }) {
    await this.coupons.confirmRedemptionForBooking(input);
  }
}
