import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCouponRulesCommand,
  AdminCouponStatus,
} from "./AdminCouponDtos";
import { normalizeCouponCode } from "./CouponValidation";

const validStatuses: AdminCouponStatus[] = [
  "ACTIVE",
  "DRAFT",
  "EXPIRED",
  "PAUSED",
];

export function assertAdminCouponStatus(status: AdminCouponStatus) {
  if (!validStatuses.includes(status)) {
    throw new ApplicationError("COUPON_INACTIVE", "Coupon status is invalid.");
  }
}

export function assertAdminCouponRules(command: AdminCouponRulesCommand) {
  if (command.validUntil && command.validUntil.getTime() <= command.validFrom.getTime()) {
    throw new ApplicationError(
      "COUPON_EXPIRED",
      "Coupon end date must be after the start date.",
    );
  }

  if (command.discountType === "PERCENTAGE") {
    const percentage = command.discountPercentageBps ?? 0;

    if (percentage <= 0 || percentage > 10_000) {
    throw new ApplicationError(
      "COUPON_RULE_INVALID",
      "Percentage discount must be between 0.01% and 100%.",
    );
    }

    return;
  }

  const amount = command.discountAmountMinor ?? 0;

  if (amount <= 0) {
    throw new ApplicationError(
      "COUPON_RULE_INVALID",
      "Fixed discount amount must be greater than zero.",
    );
  }
}

export function assertAdminCouponCode(code: string) {
  if (!normalizeCouponCode(code)) {
    throw new ApplicationError("COUPON_CODE_REQUIRED", "Coupon code is required.");
  }
}
