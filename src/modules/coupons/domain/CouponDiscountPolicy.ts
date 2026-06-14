import { domainError } from "@/shared/domain/DomainError";

import type { CouponDiscountType } from "../application/CouponDtos";

export type CouponDiscountRule = {
  campaignName: string;
  code: string;
  couponId: string;
  couponVersionId: string;
  discountAmountMinor: number | null;
  discountPercentageBps: number | null;
  discountType: CouponDiscountType;
};

export type CouponDiscountInput = {
  currency: "EUR";
  depositAmountMinor: number;
  now: Date;
  rule: CouponDiscountRule;
  subtotalAmountMinor: number;
};

export function calculateCouponDiscount(input: CouponDiscountInput) {
  assertMoney(input.subtotalAmountMinor, "Coupon subtotal is invalid.");
  assertMoney(input.depositAmountMinor, "Coupon deposit is invalid.");

  if (input.depositAmountMinor > input.subtotalAmountMinor) {
    throw domainError(
      "COUPON_PRICE_INVALID",
      "Coupon deposit cannot exceed subtotal.",
    );
  }

  const originalRemainingAmountMinor =
    input.subtotalAmountMinor - input.depositAmountMinor;
  const rawDiscountAmountMinor = rawDiscount(input);
  const discountAmountMinor = Math.min(
    rawDiscountAmountMinor,
    input.subtotalAmountMinor,
  );
  const finalTotalAmountMinor =
    input.subtotalAmountMinor - discountAmountMinor;
  const finalRemainingAmountMinor = Math.max(
    originalRemainingAmountMinor - discountAmountMinor,
    0,
  );
  const finalDepositAmountMinor =
    finalTotalAmountMinor - finalRemainingAmountMinor;

  return {
    depositAmount: money(finalDepositAmountMinor, input.currency),
    discountAmount: money(discountAmountMinor, input.currency),
    discountSnapshot: {
      appliedAt: input.now.toISOString(),
      campaignName: input.rule.campaignName,
      code: input.rule.code,
      couponId: input.rule.couponId,
      couponVersionId: input.rule.couponVersionId,
      discountAmount: money(discountAmountMinor, input.currency),
      discountType: input.rule.discountType,
      discountValue:
        input.rule.discountType === "PERCENTAGE"
          ? input.rule.discountPercentageBps ?? 0
          : input.rule.discountAmountMinor ?? 0,
    },
    originalRemainingAmount: money(originalRemainingAmountMinor, input.currency),
    subtotalAmount: money(input.subtotalAmountMinor, input.currency),
    totalAmount: money(finalTotalAmountMinor, input.currency),
    remainingAmount: money(finalRemainingAmountMinor, input.currency),
  };
}

function rawDiscount(input: CouponDiscountInput) {
  if (input.rule.discountType === "FIXED_AMOUNT") {
    const amount = input.rule.discountAmountMinor;

    if (amount === null || !Number.isInteger(amount) || amount <= 0) {
      throw domainError("COUPON_DISCOUNT_INVALID", "Coupon fixed amount is invalid.");
    }

    return amount;
  }

  const bps = input.rule.discountPercentageBps;

  if (bps === null || !Number.isInteger(bps) || bps <= 0 || bps > 10_000) {
    throw domainError(
      "COUPON_DISCOUNT_INVALID",
      "Coupon percentage is invalid.",
    );
  }

  return Math.floor((input.subtotalAmountMinor * bps) / 10_000);
}

function assertMoney(amountMinor: number, message: string) {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw domainError("COUPON_PRICE_INVALID", message);
  }
}

function money(amountMinor: number, currency: "EUR") {
  return {
    amountMinor,
    currency,
  };
}
