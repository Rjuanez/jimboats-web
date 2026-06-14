import type { CouponRepository } from "./ports/CouponRepository";

export class ReleaseCouponRedemptionUseCase {
  constructor(private readonly coupons: CouponRepository) {}

  async execute(input: { bookingId: string; releasedAt: Date }) {
    await this.coupons.releaseRedemptionForBooking(input);
  }
}
