import { describe, expect, it } from "vitest";

import { calculateCouponDiscount } from "./CouponDiscountPolicy";

describe("CouponDiscountPolicy", () => {
  it("applies percentage discounts to the cash remaining amount first", () => {
    const result = calculateCouponDiscount({
      currency: "EUR",
      depositAmountMinor: 10_000,
      now: new Date("2026-06-14T10:00:00.000Z"),
      rule: percentageRule(1_000),
      subtotalAmountMinor: 35_000,
    });

    expect(result.discountAmount).toEqual(money(3_500));
    expect(result.depositAmount).toEqual(money(10_000));
    expect(result.remainingAmount).toEqual(money(21_500));
    expect(result.totalAmount).toEqual(money(31_500));
  });

  it("reduces the deposit only when the discount is larger than the remaining cash balance", () => {
    const result = calculateCouponDiscount({
      currency: "EUR",
      depositAmountMinor: 10_000,
      now: new Date("2026-06-14T10:00:00.000Z"),
      rule: fixedRule(5_000),
      subtotalAmountMinor: 12_000,
    });

    expect(result.discountAmount).toEqual(money(5_000));
    expect(result.depositAmount).toEqual(money(7_000));
    expect(result.remainingAmount).toEqual(money(0));
    expect(result.totalAmount).toEqual(money(7_000));
  });
});

function percentageRule(discountPercentageBps: number) {
  return {
    campaignName: "Test campaign",
    code: "TEST10",
    couponId: "coupon-test10",
    couponVersionId: "coupon-version-test10-v1",
    discountAmountMinor: null,
    discountPercentageBps,
    discountType: "PERCENTAGE" as const,
  };
}

function fixedRule(discountAmountMinor: number) {
  return {
    ...percentageRule(0),
    discountAmountMinor,
    discountPercentageBps: null,
    discountType: "FIXED_AMOUNT" as const,
  };
}

function money(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR",
  };
}
