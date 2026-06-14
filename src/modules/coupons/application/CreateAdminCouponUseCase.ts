import { ApplicationError } from "@/shared/application/ApplicationError";

import type { AdminCouponDto, CreateAdminCouponCommand } from "./AdminCouponDtos";
import {
  assertAdminCouponCode,
  assertAdminCouponRules,
  assertAdminCouponStatus,
} from "./CouponAdminValidation";
import { normalizeCouponCode } from "./CouponValidation";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class CreateAdminCouponUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(command: CreateAdminCouponCommand): Promise<AdminCouponDto> {
    assertAdminCouponCode(command.code);
    assertAdminCouponStatus(command.status);
    assertAdminCouponRules(command);

    const existing = await this.coupons.findByCodeNormalized(
      normalizeCouponCode(command.code),
    );

    if (existing) {
      throw new ApplicationError(
        "COUPON_ALREADY_EXISTS",
        "Coupon code already exists.",
      );
    }

    return this.coupons.create(command);
  }
}
