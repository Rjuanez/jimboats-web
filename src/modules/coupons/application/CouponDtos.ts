import type { MoneySnapshot } from "@/shared/domain/Money";

export type CouponDiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type CouponDiscountSnapshot = {
  appliedAt: string;
  campaignName: string;
  code: string;
  couponId: string;
  couponVersionId: string;
  discountAmount: MoneySnapshot;
  discountType: CouponDiscountType;
  discountValue: number;
};

export type CouponPriceContext = {
  currency: "EUR";
  depositAmountMinor: number;
  experienceId: string;
  subtotalAmountMinor: number;
};

export type CouponDiscountResult = {
  depositAmount: MoneySnapshot;
  discountAmount: MoneySnapshot;
  discountSnapshot: CouponDiscountSnapshot;
  remainingAmount: MoneySnapshot;
  subtotalAmount: MoneySnapshot;
  totalAmount: MoneySnapshot;
};

export type PreviewCouponDiscountCommand = CouponPriceContext & {
  code: string;
  now: Date;
};

export type ReserveCouponRedemptionCommand = PreviewCouponDiscountCommand & {
  bookingId: string;
  customerEmail: string;
  paymentRecordId: string;
};

export type ReservedCouponRedemption = CouponDiscountResult & {
  redemption: CouponRedemptionWriteModel;
};

export type CouponRedemptionWriteModel = {
  bookingId: string;
  couponId: string;
  couponSnapshot: CouponDiscountSnapshot;
  couponVersionId: string;
  customerEmailNormalized: string;
  discountAmount: MoneySnapshot;
  finalCashRemainingAmount: MoneySnapshot;
  finalDepositAmount: MoneySnapshot;
  finalTotalAmount: MoneySnapshot;
  id: string;
  originalCashRemainingAmount: MoneySnapshot;
  originalDepositAmount: MoneySnapshot;
  originalTotalAmount: MoneySnapshot;
  paymentRecordId: string;
  reservedAt: Date;
  status: "RESERVED";
};
