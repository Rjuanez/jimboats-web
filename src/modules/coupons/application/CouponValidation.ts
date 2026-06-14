import { ApplicationError } from "@/shared/application/ApplicationError";

import type { CouponPriceContext } from "./CouponDtos";
import type { ActiveCouponVersionReadModel, CouponRepository } from "./ports/CouponRepository";

export function normalizeCouponCode(code: string) {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

export async function findValidCouponVersion(input: {
  code: string;
  context: CouponPriceContext;
  coupons: CouponRepository;
  now: Date;
}) {
  const codeNormalized = normalizeCouponCode(input.code);

  if (!codeNormalized) {
    throw new ApplicationError("COUPON_CODE_REQUIRED", "Coupon code is required.");
  }

  const coupon = await input.coupons.findActiveVersionByCode(codeNormalized);

  if (!coupon) {
    throw new ApplicationError("COUPON_NOT_FOUND", "Coupon code is not valid.");
  }

  assertCouponApplies(coupon, input.context, input.now);

  const activeRedemptions = await input.coupons.countActiveRedemptions({
    couponVersionId: coupon.couponVersionId,
  });

  if (
    coupon.maxTotalRedemptions !== null &&
    activeRedemptions >= coupon.maxTotalRedemptions
  ) {
    throw new ApplicationError(
      "COUPON_LIMIT_REACHED",
      "Coupon has reached its usage limit.",
    );
  }

  return coupon;
}

function assertCouponApplies(
  coupon: ActiveCouponVersionReadModel,
  context: CouponPriceContext,
  now: Date,
) {
  if (coupon.couponStatus !== "ACTIVE" || coupon.versionStatus !== "ACTIVE") {
    throw new ApplicationError("COUPON_INACTIVE", "Coupon is not active.");
  }

  if (coupon.currency !== context.currency) {
    throw new ApplicationError(
      "COUPON_CURRENCY_MISMATCH",
      "Coupon cannot be applied to this currency.",
    );
  }

  if (coupon.validFrom.getTime() > now.getTime()) {
    throw new ApplicationError("COUPON_NOT_STARTED", "Coupon is not active yet.");
  }

  if (coupon.validUntil && coupon.validUntil.getTime() < now.getTime()) {
    throw new ApplicationError("COUPON_EXPIRED", "Coupon has expired.");
  }

  if (
    coupon.experienceIds.length > 0 &&
    !coupon.experienceIds.includes(context.experienceId)
  ) {
    throw new ApplicationError(
      "COUPON_EXPERIENCE_NOT_ALLOWED",
      "Coupon cannot be applied to this experience.",
    );
  }
}
