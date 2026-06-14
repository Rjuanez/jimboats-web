import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminCouponStatus = "ACTIVE" | "DRAFT" | "EXPIRED" | "PAUSED";
export type AdminCouponDiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type AdminCouponExperienceOption = {
  id: string;
  name: string;
  status: string;
};

export type AdminCouponVersion = {
  discountType: AdminCouponDiscountType;
  discountValue: number;
  experienceIds: string[];
  id: string;
  maxTotalRedemptions: number | null;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  validFrom: string;
  validUntil: string;
  versionNumber: number;
};

export type AdminCouponRedemption = {
  bookingId: string;
  customerEmailNormalized: string;
  discountAmount: number;
  finalTotalAmount: number;
  id: string;
  reservedAt: string;
  status: "CONFIRMED" | "REFUNDED" | "RELEASED" | "RESERVED" | "VOIDED";
};

export type AdminCouponEvent = {
  actorId: string | null;
  actorType: "ADMIN" | "CUSTOMER" | "SYSTEM";
  bookingId: string | null;
  couponVersionId: string | null;
  id: string;
  label: string;
  occurredAt: string;
  redemptionId: string | null;
  type:
    | "COUPON_CONFIRMED"
    | "COUPON_CREATED"
    | "COUPON_RELEASED"
    | "COUPON_RESERVED"
    | "COUPON_VERSION_CREATED";
};

export type AdminCoupon = {
  activeVersion: AdminCouponVersion | null;
  campaignName: string;
  code: string;
  confirmedRedemptions: number;
  createdAt: string;
  displayCode: string;
  events: AdminCouponEvent[];
  id: string;
  name: string;
  redemptions: AdminCouponRedemption[];
  reservedRedemptions: number;
  status: AdminCouponStatus;
  totalRedemptions: number;
  updatedAt: string;
  versions: AdminCouponVersion[];
};

export type AdminCouponInput = {
  campaignName: string;
  code: string;
  discountType: AdminCouponDiscountType;
  discountValue: number;
  experienceIds: string[];
  maxTotalRedemptions: number | null;
  name: string;
  status: AdminCouponStatus;
  validFrom: string;
  validUntil: string;
};

export type AdminCouponsState = {
  coupons: AdminCoupon[];
  experiences: AdminCouponExperienceOption[];
};

export type AdminCouponsPageData = {
  navItems: AdminNavItem[];
  state: AdminCouponsState;
};

export type AdminCouponView = "create" | "detail" | "list";

export type AdminCouponActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminCouponActions = {
  changeStatus: (input: {
    couponId: string;
    status: AdminCouponStatus;
  }) => Promise<AdminCouponActionResult<{ state: AdminCouponsState }>>;
  createCoupon: (
    input: AdminCouponInput,
  ) => Promise<
    AdminCouponActionResult<{ couponId: string; state: AdminCouponsState }>
  >;
  updateCoupon: (input: {
    couponId: string;
    coupon: AdminCouponInput;
  }) => Promise<AdminCouponActionResult<{ state: AdminCouponsState }>>;
};
