import { ApplicationError } from "@/shared/application/ApplicationError";

import type {
  AdminCouponDto,
  DuplicateAdminCouponCommand,
} from "./AdminCouponDtos";
import { assertAdminCouponCode } from "./CouponAdminValidation";
import { normalizeCouponCode } from "./CouponValidation";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class DuplicateAdminCouponUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(command: DuplicateAdminCouponCommand): Promise<AdminCouponDto> {
    assertAdminCouponCode(command.newCode);

    const source = await this.coupons.findById(command.couponId);

    if (!source || !source.activeVersion) {
      throw new ApplicationError("COUPON_NOT_FOUND", "Coupon was not found.");
    }

    const existing = await this.coupons.findByCodeNormalized(
      normalizeCouponCode(command.newCode),
    );

    if (existing) {
      throw new ApplicationError(
        "COUPON_ALREADY_EXISTS",
        "Coupon code already exists.",
      );
    }

    return this.coupons.create({
      actorId: command.actorId ?? null,
      campaignName: source.campaignName,
      code: command.newCode,
      couponId: command.newCouponId,
      discountAmountMinor: source.activeVersion.discountAmountMinor,
      discountPercentageBps: source.activeVersion.discountPercentageBps,
      discountType: source.activeVersion.discountType,
      experienceIds: source.activeVersion.experienceIds,
      maxTotalRedemptions: source.activeVersion.maxTotalRedemptions,
      name: `${source.name} copy`,
      now: command.now,
      status: "DRAFT",
      validFrom: new Date(source.activeVersion.validFrom),
      validUntil: source.activeVersion.validUntil
        ? new Date(source.activeVersion.validUntil)
        : null,
    });
  }
}
