import { z } from "zod";

import type {
  AdminNotificationPreviewInput,
  AdminNotificationRuleInput,
  AdminNotificationSendDeliveryInput,
  AdminNotificationTemplateInput,
} from "@/components/sections/admin-notifications/AdminNotificationTypes";

const channelSchema = z.enum(["EMAIL", "WHATSAPP"]);
const sendModeSchema = z.enum(["AUTOMATIC", "MANUAL_REVIEW"]);
const ruleStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);
const templateStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "DRAFT", "READY"]);
const translationStatusSchema = z.enum([
  "ARCHIVED",
  "DRAFT",
  "PUBLISHED",
  "READY",
]);
const localeSchema = z.enum(["en", "es", "ca"]);
const notificationTypeSchema = z.enum([
  "ADMIN_BOOKING_CREATED",
  "BOOKING_CANCELLED",
  "BOOKING_CONFIRMED_DEPOSIT_PAID",
  "BOOKING_CREATED",
  "BOOKING_EXPIRED",
  "BOOKING_PAYMENT_FAILED",
  "BOOKING_REMINDER",
  "BOOKING_RESCHEDULED",
  "BOOKING_UPDATED",
]);

const eventTypeSchema = z
  .string()
  .trim()
  .min(1, "Notification event is required.");
const idSchema = z.string().trim().min(1, "Notification id is required.");
const optionalTextSchema = z.string().trim();

const adminNotificationRuleSchema = z.object({
  channel: channelSchema,
  enabled: z.boolean(),
  eventType: eventTypeSchema,
  notificationType: notificationTypeSchema,
  requiresConsent: z.boolean(),
  ruleId: z.string().trim().optional(),
  sendMode: sendModeSchema,
  status: ruleStatusSchema,
  templateId: z.string().trim().nullable(),
});

const adminNotificationTemplateTranslationSchema = z.object({
  body: z.string(),
  htmlBody: z.string(),
  locale: localeSchema,
  previewText: optionalTextSchema,
  status: translationStatusSchema,
  subject: optionalTextSchema,
});

const adminNotificationTemplateSchema = z.object({
  allowedVariablesText: z.string(),
  channel: channelSchema,
  eventType: eventTypeSchema,
  notificationType: notificationTypeSchema,
  providerTemplateId: optionalTextSchema,
  requiredVariablesText: z.string(),
  status: templateStatusSchema,
  templateId: idSchema,
  translations: z
    .array(adminNotificationTemplateTranslationSchema)
    .min(1, "At least one translation is required."),
});

const adminNotificationPreviewSchema = z
  .object({
    bookingId: optionalTextSchema,
    draftBody: z.string(),
    draftHtmlBody: z.string(),
    draftPreviewText: optionalTextSchema,
    draftSubject: optionalTextSchema,
    fixtureKey: optionalTextSchema,
    locale: localeSchema,
    templateId: idSchema,
  })
  .refine(
    (input) => Boolean(input.bookingId || input.fixtureKey),
    "Preview requires a booking id or fixture.",
  );

const adminNotificationSendDeliverySchema = z.object({
  notificationDeliveryId: idSchema,
});

export function parseAdminNotificationRule(input: AdminNotificationRuleInput) {
  const parsed = adminNotificationRuleSchema.parse(input);

  return {
    ...parsed,
    ruleId: parsed.ruleId || undefined,
    templateId: parsed.templateId || null,
  };
}

export function parseAdminNotificationTemplate(
  input: AdminNotificationTemplateInput,
) {
  const parsed = adminNotificationTemplateSchema.parse(input);

  return {
    ...parsed,
    allowedVariables: parseVariables(parsed.allowedVariablesText),
    providerTemplateId:
      parsed.channel === "WHATSAPP" ? parsed.providerTemplateId || null : null,
    requiredVariables: parseVariables(parsed.requiredVariablesText),
    translations: parsed.translations.map((translation) => ({
      ...translation,
      htmlBody: parsed.channel === "EMAIL" ? translation.htmlBody || null : null,
      previewText: translation.previewText || null,
      subject: translation.subject || null,
    })),
  };
}

export function parseAdminNotificationPreview(
  input: AdminNotificationPreviewInput,
) {
  const parsed = adminNotificationPreviewSchema.parse(input);

  return {
    ...parsed,
    bookingId: parsed.bookingId || undefined,
    draftHtmlBody: parsed.draftHtmlBody || null,
    draftPreviewText: parsed.draftPreviewText || null,
    draftSubject: parsed.draftSubject || null,
    fixtureKey: parsed.fixtureKey || undefined,
  };
}

export function parseAdminNotificationSendDelivery(
  input: AdminNotificationSendDeliveryInput,
) {
  return adminNotificationSendDeliverySchema.parse(input);
}

function parseVariables(value: string) {
  return [
    ...new Set(
      value
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
