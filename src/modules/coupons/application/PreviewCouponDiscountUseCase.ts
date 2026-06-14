import { calculateCouponDiscount } from "../domain/CouponDiscountPolicy";
import type { CouponDiscountResult, PreviewCouponDiscountCommand } from "./CouponDtos";
import { findValidCouponVersion } from "./CouponValidation";
import type { CouponRepository } from "./ports/CouponRepository";

export class PreviewCouponDiscountUseCase {
  constructor(private readonly coupons: CouponRepository) {}

  async execute(
    command: PreviewCouponDiscountCommand,
  ): Promise<CouponDiscountResult> {
    const coupon = await findValidCouponVersion({
      code: command.code,
      context: command,
      coupons: this.coupons,
      now: command.now,
    });

    const discount = calculateCouponDiscount({
      currency: command.currency,
      depositAmountMinor: command.depositAmountMinor,
      now: command.now,
      rule: {
        campaignName: coupon.campaignName,
        code: coupon.code,
        couponId: coupon.couponId,
        couponVersionId: coupon.couponVersionId,
        discountAmountMinor: coupon.discountAmountMinor,
        discountPercentageBps: coupon.discountPercentageBps,
        discountType: coupon.discountType,
      },
      subtotalAmountMinor: command.subtotalAmountMinor,
    });

    return {
      depositAmount: discount.depositAmount,
      discountAmount: discount.discountAmount,
      discountSnapshot: discount.discountSnapshot,
      remainingAmount: discount.remainingAmount,
      subtotalAmount: discount.subtotalAmount,
      totalAmount: discount.totalAmount,
    };
  }
}
