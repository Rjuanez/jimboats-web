import { z } from "zod";

const localeSchema = z.enum(["ca", "en", "es"]);
const publicationStatusSchema = z.enum([
  "archived",
  "draft",
  "published",
  "ready",
]);
const translationStatusSchema = z.enum([
  "draft",
  "missing",
  "needs_review",
  "published",
  "ready",
]);
const slotPolicyTypeSchema = z.enum([
  "any_available",
  "fixed_slots",
  "manual_approval",
]);
const mediaStatusSchema = z.enum(["failed", "missing", "processing", "ready"]);
const localTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time format.");

export const adminCreateExperienceSchema = z.object({
  basePrice: z.number().nonnegative(),
  capacity: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  internalName: z.string().trim().min(1),
  type: z.string().trim().min(1),
});

const faqSchema = z.object({
  answer: z.string(),
  id: z.string(),
  question: z.string(),
});

const translationSchema = z.object({
  altText: z.string(),
  bring: z.string(),
  cardSummary: z.string(),
  canonical: z.string(),
  faq: z.array(faqSchema),
  geoSummary: z.string(),
  h1: z.string(),
  included: z.string(),
  indexing: z.enum(["index", "noindex"]),
  keyFacts: z.string(),
  locale: localeSchema,
  longDescription: z.string(),
  publicPageEnabled: z.boolean(),
  seoDescription: z.string(),
  seoTitle: z.string(),
  slug: z.string(),
  status: translationStatusSchema,
  title: z.string(),
  visibleTerms: z.string(),
});

const slotSchema = z.object({
  enabled: z.boolean(),
  endTime: localTimeSchema,
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  startTime: localTimeSchema,
});

const flexibleAvailabilitySchema = z.object({
  endTime: localTimeSchema,
  granularityMinutes: z.number().int().positive(),
  startTime: localTimeSchema,
});

const extraConfigSchema = z.object({
  capacityReduction: z.number().int().nonnegative(),
  enabled: z.boolean(),
  extraId: z.string().trim().min(1),
  limitPerBooking: z.number().int().nonnegative(),
  noticeHours: z.number().int().nonnegative(),
  priceOverride: z.number().nonnegative().nullable(),
});

const mediaVariantSchema = z.object({
  publicUrl: z.string(),
  width: z.number().int().positive(),
});

export const adminExperienceSchema = z.object({
  allowManualScheduling: z.boolean(),
  basePrice: z.number().nonnegative(),
  bufferMinutes: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  cancellationPolicyId: z.string().trim().min(1).nullable().optional(),
  depositAmount: z.number().nonnegative(),
  departurePort: z.string().trim().min(1),
  displayOrder: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  extras: z.array(extraConfigSchema),
  flexibleAvailability: flexibleAvailabilitySchema,
  id: z.string().trim().min(1),
  includedInternal: z.string(),
  internalName: z.string().trim().min(1),
  internalNotes: z.string(),
  maxAdvanceMonths: z.number().int().min(1).max(6),
  media: z.object({
    assetId: z.string().trim().min(1).nullable(),
    filename: z.string(),
    primaryImageUrl: z.string(),
    status: mediaStatusSchema,
    title: z.string(),
    variants: z.array(mediaVariantSchema),
  }),
  minAdvanceHours: z.number().int().nonnegative(),
  slotPolicyType: slotPolicyTypeSchema,
  slots: z.array(slotSchema),
  status: publicationStatusSchema,
  translations: z.record(localeSchema, translationSchema),
  type: z.string().trim().min(1),
});

export const adminExperienceIdSchema = z.object({
  experienceId: z.string().trim().min(1),
});

export function parseAdminCreateExperience(input: unknown) {
  return adminCreateExperienceSchema.parse(input);
}

export function parseAdminExperience(input: unknown) {
  return adminExperienceSchema.parse(input);
}

export function parseAdminExperienceId(input: unknown) {
  return adminExperienceIdSchema.parse(input);
}
