import { z } from "zod";

const couponStatusSchema = z.enum(["ACTIVE", "DRAFT", "EXPIRED", "PAUSED"]);
const couponDiscountTypeSchema = z.enum(["FIXED_AMOUNT", "PERCENTAGE"]);

export const adminCouponInputSchema = z.object({
  campaignName: z.string().trim().min(1),
  code: z.string().trim().min(1),
  discountType: couponDiscountTypeSchema,
  discountValue: z.number().positive(),
  experienceIds: z.array(z.string().trim().min(1)),
  maxTotalRedemptions: z.number().int().positive().nullable(),
  name: z.string().trim().min(1),
  status: couponStatusSchema,
  validFrom: z.string().trim().min(1),
  validUntil: z.string().trim(),
});

export const adminCouponIdSchema = z.object({
  couponId: z.string().trim().min(1),
});

export const adminCouponStatusChangeSchema = z.object({
  couponId: z.string().trim().min(1),
  status: couponStatusSchema,
});

export const adminCouponUpdateSchema = z.object({
  coupon: adminCouponInputSchema,
  couponId: z.string().trim().min(1),
});

export const adminCouponDuplicateSchema = z.object({
  couponId: z.string().trim().min(1),
  newCode: z.string().trim().min(1),
});

export const adminCouponBatchSchema = adminCouponInputSchema
  .omit({
    code: true,
    name: true,
  })
  .extend({
    codePrefix: z.string().trim().min(1),
    count: z.number().int().min(1).max(100),
    namePrefix: z.string().trim().min(1),
  });

export function parseAdminCouponInput(input: unknown) {
  return adminCouponInputSchema.parse(input);
}

export function parseAdminCouponId(input: unknown) {
  return adminCouponIdSchema.parse(input);
}

export function parseAdminCouponStatusChange(input: unknown) {
  return adminCouponStatusChangeSchema.parse(input);
}

export function parseAdminCouponUpdate(input: unknown) {
  return adminCouponUpdateSchema.parse(input);
}

export function parseAdminCouponDuplicate(input: unknown) {
  return adminCouponDuplicateSchema.parse(input);
}

export function parseAdminCouponBatch(input: unknown) {
  return adminCouponBatchSchema.parse(input);
}
