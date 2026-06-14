import type { CouponDiscountType } from "./CouponDtos";

export type AdminCouponStatus = "ACTIVE" | "DRAFT" | "EXPIRED" | "PAUSED";

export type AdminCouponExperienceOptionDto = {
  id: string;
  name: string;
  status: string;
};

export type AdminCouponVersionDto = {
  currency: "EUR";
  discountAmountMinor: number | null;
  discountPercentageBps: number | null;
  discountType: CouponDiscountType;
  experienceIds: string[];
  id: string;
  maxTotalRedemptions: number | null;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  validFrom: string;
  validUntil: string | null;
  versionNumber: number;
};

export type AdminCouponRedemptionDto = {
  bookingId: string;
  confirmedAt: string | null;
  customerEmailNormalized: string;
  discountAmountMinor: number;
  finalCashRemainingAmountMinor: number;
  finalDepositAmountMinor: number;
  finalTotalAmountMinor: number;
  id: string;
  originalCashRemainingAmountMinor: number;
  originalDepositAmountMinor: number;
  originalTotalAmountMinor: number;
  releasedAt: string | null;
  reservedAt: string;
  status: "CONFIRMED" | "REFUNDED" | "RELEASED" | "RESERVED" | "VOIDED";
};

export type AdminCouponEventDto = {
  actorId: string | null;
  actorType: "ADMIN" | "CUSTOMER" | "SYSTEM";
  bookingId: string | null;
  couponVersionId: string | null;
  id: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  redemptionId: string | null;
  type:
    | "COUPON_CONFIRMED"
    | "COUPON_CREATED"
    | "COUPON_RELEASED"
    | "COUPON_RESERVED"
    | "COUPON_VERSION_CREATED";
};

export type AdminCouponDto = {
  activeVersion: AdminCouponVersionDto | null;
  campaignName: string;
  code: string;
  confirmedRedemptions: number;
  createdAt: string;
  displayCode: string;
  events: AdminCouponEventDto[];
  id: string;
  name: string;
  redemptions: AdminCouponRedemptionDto[];
  reservedRedemptions: number;
  status: AdminCouponStatus;
  totalRedemptions: number;
  updatedAt: string;
  versions: AdminCouponVersionDto[];
};

export type AdminCouponsWorkspaceDto = {
  coupons: AdminCouponDto[];
  experiences: AdminCouponExperienceOptionDto[];
};

export type AdminCouponRulesCommand = {
  discountAmountMinor?: number | null;
  discountPercentageBps?: number | null;
  discountType: CouponDiscountType;
  experienceIds: string[];
  maxTotalRedemptions?: number | null;
  validFrom: Date;
  validUntil?: Date | null;
};

export type CreateAdminCouponCommand = AdminCouponRulesCommand & {
  actorId?: string | null;
  campaignName: string;
  code: string;
  couponId: string;
  name: string;
  now: Date;
  status: AdminCouponStatus;
};

export type UpdateAdminCouponCommand = AdminCouponRulesCommand & {
  actorId?: string | null;
  campaignName: string;
  couponId: string;
  name: string;
  now: Date;
  status: AdminCouponStatus;
};

export type ChangeAdminCouponStatusCommand = {
  actorId?: string | null;
  couponId: string;
  now: Date;
  status: AdminCouponStatus;
};

export type DuplicateAdminCouponCommand = {
  actorId?: string | null;
  couponId: string;
  newCode: string;
  newCouponId: string;
  now: Date;
};

export type GenerateAdminCouponBatchCommand = AdminCouponRulesCommand & {
  actorId?: string | null;
  campaignName: string;
  codePrefix: string;
  count: number;
  namePrefix: string;
  now: Date;
  status: AdminCouponStatus;
};
