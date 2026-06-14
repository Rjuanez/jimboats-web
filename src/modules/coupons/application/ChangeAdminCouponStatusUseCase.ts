import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCouponDto,
  ChangeAdminCouponStatusCommand,
} from "./AdminCouponDtos";
import { assertAdminCouponStatus } from "./CouponAdminValidation";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class ChangeAdminCouponStatusUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(
    command: ChangeAdminCouponStatusCommand,
  ): Promise<AdminCouponDto> {
    assertAdminCouponStatus(command.status);

    const existing = await this.coupons.findById(command.couponId);

    if (!existing) {
      throw new ApplicationError("COUPON_NOT_FOUND", "Coupon was not found.");
    }

    return this.coupons.changeStatus({
      actorId: command.actorId ?? null,
      couponId: command.couponId,
      now: command.now,
      status: command.status,
    });
  }
}
