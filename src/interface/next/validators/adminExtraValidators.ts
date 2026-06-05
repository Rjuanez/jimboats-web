import { z } from "zod";

const extraStatusSchema = z.enum(["active", "archived", "draft"]);
const mediaStatusSchema = z.enum(["failed", "missing", "processing", "ready"]);

const mediaVariantSchema = z.object({
  publicUrl: z.string(),
  width: z.number().int().positive(),
});

export const adminCreateExtraSchema = z.object({
  defaultNoticeHours: z.number().int().nonnegative(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
});

export const adminExtraSchema = z.object({
  defaultNoticeHours: z.number().int().nonnegative(),
  id: z.string().trim().min(1),
  media: z.object({
    assetId: z.string().trim().min(1).nullable(),
    filename: z.string(),
    primaryImageUrl: z.string(),
    status: mediaStatusSchema,
    title: z.string(),
    variants: z.array(mediaVariantSchema),
  }),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  status: extraStatusSchema,
});

export const adminExtraIdSchema = z.object({
  extraId: z.string().trim().min(1),
});

export function parseAdminCreateExtra(input: unknown) {
  return adminCreateExtraSchema.parse(input);
}

export function parseAdminExtra(input: unknown) {
  return adminExtraSchema.parse(input);
}

export function parseAdminExtraId(input: unknown) {
  return adminExtraIdSchema.parse(input);
}
