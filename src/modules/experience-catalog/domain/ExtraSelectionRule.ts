import { domainError } from "@/shared/domain/DomainError";
import type { Money } from "@/shared/domain/Money";

export type ExtraSelectionRuleSnapshot = {
  capacityReduction: number;
  enabled: boolean;
  extraId: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverride: ReturnType<Money["toSnapshot"]> | null;
};

export type ExtraSelectionRuleProps = {
  capacityReduction?: number;
  enabled: boolean;
  extraId: string;
  limitPerBooking: number;
  noticeMinutes: number;
  priceOverride?: Money | null;
};

export class ExtraSelectionRule {
  private constructor(
    readonly enabled: boolean,
    readonly extraId: string,
    readonly limitPerBooking: number,
    readonly noticeMinutes: number,
    readonly priceOverride: Money | null,
    readonly capacityReduction: number,
  ) {}

  static create(input: ExtraSelectionRuleProps) {
    const extraId = input.extraId.trim();
    const capacityReduction = input.capacityReduction ?? 0;

    if (!extraId) {
      throw domainError("EXTRA_ID_MISSING", "Extra id is required.");
    }

    if (!Number.isInteger(input.limitPerBooking) || input.limitPerBooking < 0) {
      throw domainError(
        "EXTRA_QUANTITY_NOT_ALLOWED",
        "Extra quantity limit must be a non-negative integer.",
      );
    }

    if (!Number.isInteger(input.noticeMinutes) || input.noticeMinutes < 0) {
      throw domainError(
        "EXTRA_MINIMUM_NOTICE_INVALID",
        "Extra notice minutes must be a non-negative integer.",
      );
    }

    if (!Number.isInteger(capacityReduction) || capacityReduction < 0) {
      throw domainError(
        "EXTRA_CAPACITY_REDUCTION_INVALID",
        "Extra capacity reduction must be a non-negative integer.",
      );
    }

    return new ExtraSelectionRule(
      input.enabled,
      extraId,
      input.limitPerBooking,
      input.noticeMinutes,
      input.priceOverride ?? null,
      capacityReduction,
    );
  }

  allowsQuantity(quantity: number) {
    return (
      Number.isInteger(quantity) &&
      quantity >= 0 &&
      quantity <= this.limitPerBooking
    );
  }

  toSnapshot(): ExtraSelectionRuleSnapshot {
    return {
      capacityReduction: this.capacityReduction,
      enabled: this.enabled,
      extraId: this.extraId,
      limitPerBooking: this.limitPerBooking,
      noticeMinutes: this.noticeMinutes,
      priceOverride: this.priceOverride?.toSnapshot() ?? null,
    };
  }
}
