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
  confirmedAt: string;
  customerEmailNormalized: string;
  discountAmount: number;
  finalCashRemainingAmount: number;
  finalDepositAmount: number;
  finalTotalAmount: number;
  id: string;
  originalCashRemainingAmount: number;
  originalDepositAmount: number;
  originalTotalAmount: number;
  releasedAt: string;
  reservedAt: string;
  reservedDateKey: string;
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

export type AdminCouponMetrics = {
  activeCoupons: number;
  averageDiscount: number;
  confirmedRevenueAfterDiscount: number;
  confirmedRedemptions: number;
  conversionRate: number;
  discountAmount: number;
  releasedRedemptions: number;
  reservedRedemptions: number;
  totalCoupons: number;
  totalRedemptions: number;
};

export type AdminCouponUsagePoint = {
  confirmed: number;
  date: string;
  discountAmount: number;
  released: number;
  reserved: number;
};

export type AdminCouponCampaignSummary = {
  campaignName: string;
  confirmedRedemptions: number;
  couponCount: number;
  discountAmount: number;
  totalRedemptions: number;
};

export type AdminCouponRankingItem = {
  code: string;
  confirmedRedemptions: number;
  discountAmount: number;
  id: string;
  revenueAfterDiscount: number;
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

export type AdminCouponBatchInput = Omit<AdminCouponInput, "code" | "name"> & {
  codePrefix: string;
  count: number;
  namePrefix: string;
};

export type AdminCouponsState = {
  campaigns: AdminCouponCampaignSummary[];
  coupons: AdminCoupon[];
  experiences: AdminCouponExperienceOption[];
  metrics: AdminCouponMetrics;
  ranking: AdminCouponRankingItem[];
  usage: AdminCouponUsagePoint[];
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
  duplicateCoupon: (input: {
    couponId: string;
    newCode: string;
  }) => Promise<
    AdminCouponActionResult<{ couponId: string; state: AdminCouponsState }>
  >;
  exportCsv: () => Promise<AdminCouponActionResult<{ csv: string }>>;
  generateBatch: (
    input: AdminCouponBatchInput,
  ) => Promise<AdminCouponActionResult<{ state: AdminCouponsState }>>;
  updateCoupon: (input: {
    couponId: string;
    coupon: AdminCouponInput;
  }) => Promise<AdminCouponActionResult<{ state: AdminCouponsState }>>;
};
