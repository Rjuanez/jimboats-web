import type {
  CouponDiscountType,
  CouponRedemptionWriteModel,
} from "../CouponDtos";

export type ActiveCouponVersionReadModel = {
  campaignName: string;
  code: string;
  couponId: string;
  couponStatus: "ACTIVE" | "DRAFT" | "EXPIRED" | "PAUSED";
  couponVersionId: string;
  currency: "EUR";
  discountAmountMinor: number | null;
  discountPercentageBps: number | null;
  discountType: CouponDiscountType;
  experienceIds: string[];
  maxTotalRedemptions: number | null;
  validFrom: Date;
  validUntil: Date | null;
  versionStatus: "ACTIVE" | "ARCHIVED" | "DRAFT";
};

export type CouponRepository = {
  countActiveRedemptions(input: {
    couponVersionId: string;
  }): Promise<number>;
  findActiveVersionByCode(
    codeNormalized: string,
  ): Promise<ActiveCouponVersionReadModel | null>;
  confirmRedemptionForBooking(input: {
    bookingId: string;
    confirmedAt: Date;
  }): Promise<void>;
  releaseRedemptionForBooking(input: {
    bookingId: string;
    releasedAt: Date;
  }): Promise<void>;
  saveReservedRedemption(input: CouponRedemptionWriteModel): Promise<void>;
};
