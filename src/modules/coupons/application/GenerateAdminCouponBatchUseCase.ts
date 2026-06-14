import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCouponDto,
  GenerateAdminCouponBatchCommand,
} from "./AdminCouponDtos";
import {
  assertAdminCouponCode,
  assertAdminCouponRules,
  assertAdminCouponStatus,
} from "./CouponAdminValidation";
import { normalizeCouponCode } from "./CouponValidation";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class GenerateAdminCouponBatchUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(command: GenerateAdminCouponBatchCommand): Promise<AdminCouponDto[]> {
    assertAdminCouponCode(command.codePrefix);
    assertAdminCouponStatus(command.status);
    assertAdminCouponRules(command);

    if (command.count < 1 || command.count > 100) {
      throw new ApplicationError(
        "COUPON_RULE_INVALID",
        "Coupon batch size must be between 1 and 100.",
      );
    }

    const created: AdminCouponDto[] = [];

    for (let index = 1; index <= command.count; index += 1) {
      const suffix = String(index).padStart(3, "0");
      const code = `${normalizeCouponCode(command.codePrefix)}${suffix}`;
      const existing = await this.coupons.findByCodeNormalized(code);

      if (existing) {
        throw new ApplicationError(
          "COUPON_ALREADY_EXISTS",
          `Coupon code ${code} already exists.`,
        );
      }

      created.push(
        await this.coupons.create({
          ...command,
          actorId: command.actorId ?? null,
          code,
          couponId: `coupon-${code.toLowerCase()}`,
          name: `${command.namePrefix} ${suffix}`,
        }),
      );
    }

    return created;
  }
}
