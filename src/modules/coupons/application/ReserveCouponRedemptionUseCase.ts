import { calculateCouponDiscount } from "../domain/CouponDiscountPolicy";
import type {
  ReserveCouponRedemptionCommand,
  ReservedCouponRedemption,
} from "./CouponDtos";
import { findValidCouponVersion } from "./CouponValidation";
import type { CouponRepository } from "./ports/CouponRepository";

export class ReserveCouponRedemptionUseCase {
  constructor(private readonly coupons: CouponRepository) {}

  async execute(
    command: ReserveCouponRedemptionCommand,
  ): Promise<ReservedCouponRedemption> {
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
    const redemption = {
      bookingId: command.bookingId,
      couponId: coupon.couponId,
      couponSnapshot: discount.discountSnapshot,
      couponVersionId: coupon.couponVersionId,
      customerEmailNormalized: command.customerEmail.trim().toLowerCase(),
      discountAmount: discount.discountAmount,
      finalCashRemainingAmount: discount.remainingAmount,
      finalDepositAmount: discount.depositAmount,
      finalTotalAmount: discount.totalAmount,
      id: `coupon-redemption-${command.bookingId}`,
      originalCashRemainingAmount: discount.originalRemainingAmount,
      originalDepositAmount: {
        amountMinor: command.depositAmountMinor,
        currency: command.currency,
      },
      originalTotalAmount: {
        amountMinor: command.subtotalAmountMinor,
        currency: command.currency,
      },
      paymentRecordId: command.paymentRecordId,
      reservedAt: command.now,
      status: "RESERVED" as const,
    };

    return {
      depositAmount: discount.depositAmount,
      discountAmount: discount.discountAmount,
      discountSnapshot: discount.discountSnapshot,
      redemption,
      remainingAmount: discount.remainingAmount,
      subtotalAmount: discount.subtotalAmount,
      totalAmount: discount.totalAmount,
    };
  }
}
