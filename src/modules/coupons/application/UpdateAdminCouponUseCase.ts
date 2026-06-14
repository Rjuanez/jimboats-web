import { ApplicationError } from "@/shared/application/ApplicationError";

import type { AdminCouponDto, UpdateAdminCouponCommand } from "./AdminCouponDtos";
import {
  assertAdminCouponRules,
  assertAdminCouponStatus,
} from "./CouponAdminValidation";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class UpdateAdminCouponUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(command: UpdateAdminCouponCommand): Promise<AdminCouponDto> {
    assertAdminCouponStatus(command.status);
    assertAdminCouponRules(command);

    const existing = await this.coupons.findById(command.couponId);

    if (!existing) {
      throw new ApplicationError("COUPON_NOT_FOUND", "Coupon was not found.");
    }

    return this.coupons.update(command);
  }
}
