import { LocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationAuditEntryWriteModel } from "@/modules/notifications/application/ports/NotificationAuditRepository";
import type { NotificationBookingReadModel } from "@/modules/notifications/application/ports/NotificationBookingReader";
import type { NotificationOutboxMessageReadModel } from "@/modules/notifications/application/ports/OutboxRepository";
import { NotificationChannel } from "@/modules/notifications/domain/NotificationChannel";
import {
  NotificationDelivery,
  type NotificationDeliveryRecipient,
  type NotificationPayload,
} from "@/modules/notifications/domain/NotificationDelivery";
import { NotificationRule } from "@/modules/notifications/domain/NotificationRule";
import type {
  NotificationRuleLocaleStrategy,
  NotificationRuleMissingTranslationBehavior,
  NotificationRuleRecipientType,
  NotificationRuleSendMode,
  NotificationRuleStatus,
} from "@/modules/notifications/domain/NotificationRule";
import { NotificationTemplate } from "@/modules/notifications/domain/NotificationTemplate";
import type {
  NotificationTemplateStatus,
  NotificationTemplateTranslationStatus,
} from "@/modules/notifications/domain/NotificationTemplate";
import { NotificationType } from "@/modules/notifications/domain/NotificationType";

import { utcDateToLocalDateString } from "@/modules/boat-calendar/application/CalendarDateTime";

export type PrismaNotificationRuleRecord = {
  channel: string;
  createdAt: Date;
  enabled: boolean;
  eventType: string;
  id: string;
  localeStrategy: string;
  missingTranslationBehavior: string;
  notificationType: string;
  recipientType: string;
  requiresConsent: boolean;
  sendMode: string;
  status: string;
  templateId: string | null;
  updatedAt: Date;
  updatedByUserId: string | null;
};

export type PrismaNotificationRuleWriteModel = {
  rule: {
    channel: ReturnType<NotificationChannel["toString"]>;
    createdAt: Date;
    enabled: boolean;
    eventType: string;
    localeStrategy: NotificationRuleLocaleStrategy;
    missingTranslationBehavior: NotificationRuleMissingTranslationBehavior;
    notificationType: ReturnType<NotificationType["toString"]>;
    recipientType: NotificationRuleRecipientType;
    requiresConsent: boolean;
    sendMode: NotificationRuleSendMode;
    status: NotificationRuleStatus;
    templateId: string | null;
    updatedAt: Date;
    updatedByUserId: string | null;
  };
  id: string;
};

export type PrismaNotificationTemplateTranslationRecord = {
  body: string;
  htmlBody: string | null;
  id: string;
  locale: string;
  previewText: string | null;
  status: string;
  subject: string | null;
  templateId: string;
  updatedAt: Date;
  updatedByUserId: string | null;
  variablesUsedJson: unknown;
};

export type PrismaNotificationTemplateRecord = {
  allowedVariablesJson: unknown;
  channel: string;
  eventType: string;
  id: string;
  notificationType: string;
  providerTemplateId: string | null;
  requiredVariablesJson: unknown;
  status: string;
  translations: PrismaNotificationTemplateTranslationRecord[];
  updatedAt: Date;
  updatedByUserId: string | null;
  version: number;
};

export type PrismaNotificationTemplateWriteModel = {
  id: string;
  template: {
    allowedVariablesJson: string[];
    channel: ReturnType<NotificationChannel["toString"]>;
    eventType: string;
    notificationType: ReturnType<NotificationType["toString"]>;
    providerTemplateId: string | null;
    requiredVariablesJson: string[];
    status: NotificationTemplateStatus;
    updatedAt: Date;
    updatedByUserId: string | null;
    version: number;
  };
  translations: Array<{
    body: string;
    htmlBody: string | null;
    id: string;
    locale: string;
    previewText: string | null;
    status: NotificationTemplateTranslationStatus;
    subject: string | null;
    updatedAt: Date;
    updatedByUserId: string | null;
    variablesUsedJson: string[];
  }>;
};

export type PrismaNotificationDeliveryRecord = {
  attempts: number;
  bookingId: string | null;
  channel: string;
  createdAt: Date;
  deliveredAt: Date | null;
  eventType: string;
  failureReason: string | null;
  id: string;
  locale: string;
  notificationType: string;
  outboxMessageId: string | null;
  payloadJson: unknown;
  provider: string | null;
  providerMessageId: string | null;
  providerTemplateId: string | null;
  providerVariablesJson: unknown;
  recipientEmail: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientType: string;
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedSubject: string | null;
  ruleId: string | null;
  sendAfter: Date | null;
  sentAt: Date | null;
  status: string;
  templateId: string | null;
  templateVersion: number | null;
  updatedAt: Date;
};

export type PrismaNotificationDeliveryWriteModel = {
  delivery: {
    attempts: number;
    bookingId: string | null;
    channel: ReturnType<NotificationChannel["toString"]>;
    createdAt: Date;
    deliveredAt: Date | null;
    eventType: string;
    failureReason: string | null;
    locale: string;
    notificationType: ReturnType<NotificationType["toString"]>;
    outboxMessageId: string | null;
    payloadJson: NotificationPayload;
    provider: string | null;
    providerMessageId: string | null;
    providerTemplateId: string | null;
    providerVariablesJson: Record<string, string>;
    recipientEmail: string | null;
    recipientName: string | null;
    recipientPhone: string | null;
    recipientType: NotificationDeliveryRecipient["recipientType"];
    renderedBody: string;
    renderedHtmlBody: string | null;
    renderedSubject: string | null;
    ruleId: string | null;
    sendAfter: Date | null;
    sentAt: Date | null;
    status: ReturnType<NotificationDelivery["toSnapshot"]>["status"];
    templateId: string | null;
    templateVersion: number | null;
    updatedAt: Date;
  };
  id: string;
};

export type PrismaNotificationOutboxMessageRecord = {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  id: string;
  payload: unknown;
  status: string;
};

export type PrismaBookingNotificationPreferenceRecord = {
  emailAddress: string | null;
  emailConsentStatus: string;
  emailEnabled: boolean;
  preferredLocale: string;
  whatsappConsentStatus: string;
  whatsappEnabled: boolean;
  whatsappPhone: string | null;
};

export type PrismaNotificationBookingRecord = {
  cashRemainingAmountMinor: number;
  cashRemainingCurrency: string;
  customerEmail: string;
  customerLocale: string;
  customerName: string;
  customerPhone: string | null;
  depositAmountMinor: number;
  depositCurrency: string;
  experienceId: string;
  experienceNameSnapshot: string;
  guestCount: number;
  id: string;
  notificationPreference: PrismaBookingNotificationPreferenceRecord | null;
  reference: string;
  selectedEndMinutes: number;
  selectedLocalDate: Date;
  selectedSlotKey: string | null;
  selectedStartMinutes: number;
  status: string;
  timeZone: string;
  totalAmountMinor: number;
  totalCurrency: string;
};

export type PrismaNotificationAuditEntryCreateModel = {
  action: NotificationAuditEntryWriteModel["action"];
  actorUserId: string | null;
  createdAt: Date;
  diffJson: NotificationPayload;
  reason: null;
  resourceId: string;
  resourceType: NotificationAuditEntryWriteModel["resourceType"];
};

export function notificationRuleFromPrismaRecord(
  record: PrismaNotificationRuleRecord,
) {
  return NotificationRule.create({
    channel: NotificationChannel.create(record.channel),
    createdAt: record.createdAt,
    enabled: record.enabled,
    eventType: record.eventType,
    id: record.id,
    localeStrategy: notificationRuleLocaleStrategyFromPrisma(
      record.localeStrategy,
    ),
    missingTranslationBehavior:
      notificationRuleMissingTranslationBehaviorFromPrisma(
        record.missingTranslationBehavior,
      ),
    notificationType: NotificationType.create(record.notificationType),
    recipientType: notificationRuleRecipientTypeFromPrisma(
      record.recipientType,
    ),
    requiresConsent: record.requiresConsent,
    sendMode: notificationRuleSendModeFromPrisma(record.sendMode),
    status: notificationRuleStatusFromPrisma(record.status),
    templateId: record.templateId,
    updatedAt: record.updatedAt,
    updatedByUserId: record.updatedByUserId,
  });
}

export function notificationRuleToPrismaWriteModel(
  rule: NotificationRule,
): PrismaNotificationRuleWriteModel {
  const snapshot = rule.toSnapshot();

  return {
    id: snapshot.id,
    rule: {
      channel: snapshot.channel,
      createdAt: new Date(snapshot.createdAt),
      enabled: snapshot.enabled,
      eventType: snapshot.eventType,
      localeStrategy: snapshot.localeStrategy,
      missingTranslationBehavior: snapshot.missingTranslationBehavior,
      notificationType: snapshot.notificationType,
      recipientType: snapshot.recipientType,
      requiresConsent: snapshot.requiresConsent,
      sendMode: snapshot.sendMode,
      status: snapshot.status,
      templateId: snapshot.templateId,
      updatedAt: new Date(snapshot.updatedAt),
      updatedByUserId: snapshot.updatedByUserId,
    },
  };
}

export function notificationTemplateFromPrismaRecord(
  record: PrismaNotificationTemplateRecord,
) {
  return NotificationTemplate.create({
    allowedVariables: stringArrayFromJson(record.allowedVariablesJson),
    channel: NotificationChannel.create(record.channel),
    eventType: record.eventType,
    id: record.id,
    notificationType: NotificationType.create(record.notificationType),
    providerTemplateId: record.providerTemplateId,
    requiredVariables: stringArrayFromJson(record.requiredVariablesJson),
    status: notificationTemplateStatusFromPrisma(record.status),
    translations: record.translations.map((translation) => ({
      body: translation.body,
      htmlBody: translation.htmlBody,
      locale: LocaleCode.create(translation.locale),
      previewText: translation.previewText,
      status: notificationTemplateTranslationStatusFromPrisma(
        translation.status,
      ),
      subject: translation.subject,
      updatedAt: translation.updatedAt,
      updatedByUserId: translation.updatedByUserId,
    })),
    updatedAt: record.updatedAt,
    updatedByUserId: record.updatedByUserId,
    version: record.version,
  });
}

export function notificationTemplateToPrismaWriteModel(
  template: NotificationTemplate,
): PrismaNotificationTemplateWriteModel {
  const snapshot = template.toSnapshot();

  return {
    id: snapshot.id,
    template: {
      allowedVariablesJson: [...snapshot.allowedVariables],
      channel: snapshot.channel,
      eventType: snapshot.eventType,
      notificationType: snapshot.notificationType,
      providerTemplateId: snapshot.providerTemplateId,
      requiredVariablesJson: [...snapshot.requiredVariables],
      status: snapshot.status,
      updatedAt: new Date(snapshot.updatedAt),
      updatedByUserId: snapshot.updatedByUserId,
      version: snapshot.version,
    },
    translations: snapshot.translations.map((translation) => ({
      body: translation.body,
      htmlBody: translation.htmlBody,
      id: notificationTemplateTranslationId(snapshot.id, translation.locale),
      locale: translation.locale,
      previewText: translation.previewText,
      status: translation.status,
      subject: translation.subject,
      updatedAt: new Date(translation.updatedAt),
      updatedByUserId: translation.updatedByUserId,
      variablesUsedJson: [...translation.variablesUsed],
    })),
  };
}

export function notificationDeliveryFromPrismaRecord(
  record: PrismaNotificationDeliveryRecord,
) {
  return NotificationDelivery.create({
    attempts: record.attempts,
    bookingId: record.bookingId,
    channel: NotificationChannel.create(record.channel),
    createdAt: record.createdAt,
    deliveredAt: record.deliveredAt,
    eventType: record.eventType,
    failureReason: record.failureReason,
    id: record.id,
    locale: LocaleCode.create(record.locale),
    notificationType: NotificationType.create(record.notificationType),
    outboxMessageId: record.outboxMessageId,
    payload: notificationPayloadFromJson(record.payloadJson),
    provider: record.provider,
    providerMessageId: record.providerMessageId,
    providerTemplateId: record.providerTemplateId,
    providerVariables: stringRecordFromJson(record.providerVariablesJson),
    recipient: {
      email: record.recipientEmail,
      name: record.recipientName,
      phone: record.recipientPhone,
      recipientType: notificationDeliveryRecipientTypeFromPrisma(
        record.recipientType,
      ),
    },
    renderedBody: record.renderedBody,
    renderedHtmlBody: record.renderedHtmlBody,
    renderedSubject: record.renderedSubject,
    ruleId: record.ruleId,
    sendAfter: record.sendAfter,
    sentAt: record.sentAt,
    status: notificationDeliveryStatusFromPrisma(record.status),
    templateId: record.templateId,
    templateVersion: record.templateVersion,
    updatedAt: record.updatedAt,
  });
}

export function notificationDeliveryToPrismaWriteModel(
  delivery: NotificationDelivery,
): PrismaNotificationDeliveryWriteModel {
  const snapshot = delivery.toSnapshot();

  return {
    delivery: {
      attempts: snapshot.attempts,
      bookingId: snapshot.bookingId,
      channel: snapshot.channel,
      createdAt: new Date(snapshot.createdAt),
      deliveredAt: snapshot.deliveredAt
        ? new Date(snapshot.deliveredAt)
        : null,
      eventType: snapshot.eventType,
      failureReason: snapshot.failureReason,
      locale: snapshot.locale,
      notificationType: snapshot.notificationType,
      outboxMessageId: snapshot.outboxMessageId,
      payloadJson: snapshot.payload,
      provider: snapshot.provider,
      providerMessageId: snapshot.providerMessageId,
      providerTemplateId: snapshot.providerTemplateId,
      providerVariablesJson: snapshot.providerVariables,
      recipientEmail: snapshot.recipient.email,
      recipientName: snapshot.recipient.name,
      recipientPhone: snapshot.recipient.phone,
      recipientType: snapshot.recipient.recipientType,
      renderedBody: snapshot.renderedBody,
      renderedHtmlBody: snapshot.renderedHtmlBody,
      renderedSubject: snapshot.renderedSubject,
      ruleId: snapshot.ruleId,
      sendAfter: snapshot.sendAfter ? new Date(snapshot.sendAfter) : null,
      sentAt: snapshot.sentAt ? new Date(snapshot.sentAt) : null,
      status: snapshot.status,
      templateId: snapshot.templateId,
      templateVersion: snapshot.templateVersion,
      updatedAt: new Date(snapshot.updatedAt),
    },
    id: snapshot.id,
  };
}

export function notificationOutboxMessageFromPrismaRecord(
  record: PrismaNotificationOutboxMessageRecord,
): NotificationOutboxMessageReadModel {
  if (record.aggregateType !== "BOOKING") {
    throw new Error("Unsupported persisted notification outbox aggregate.");
  }

  return {
    aggregateId: record.aggregateId,
    aggregateType: "BOOKING",
    eventType: record.eventType,
    id: record.id,
    payload: notificationPayloadFromJson(record.payload),
    status: notificationOutboxMessageStatusFromPrisma(record.status),
  };
}

export function notificationBookingReadModelFromPrismaRecord(
  record: PrismaNotificationBookingRecord,
): NotificationBookingReadModel {
  const preference = record.notificationPreference;
  const preferredLocale = localeFromPrisma(
    preference?.preferredLocale ?? record.customerLocale,
  );

  return {
    customerName: record.customerName,
    id: record.id,
    notificationPreferences: {
      email: preference
        ? {
            consentStatus: notificationBookingConsentStatusFromPrisma(
              preference.emailConsentStatus,
            ),
            destination: preference.emailAddress,
            enabled: preference.emailEnabled,
          }
        : {
            consentStatus: "NOT_ASKED",
            destination: record.customerEmail,
            enabled: false,
          },
      preferredLocale,
      whatsapp: preference
        ? {
            consentStatus: notificationBookingConsentStatusFromPrisma(
              preference.whatsappConsentStatus,
            ),
            destination: preference.whatsappPhone,
            enabled: preference.whatsappEnabled,
          }
        : {
            consentStatus: "NOT_ASKED",
            destination: record.customerPhone,
            enabled: false,
          },
    },
    reference: record.reference,
    templatePayload: {
      booking: {
        guestCount: record.guestCount,
        id: record.id,
        reference: record.reference,
        selectedEndMinutes: record.selectedEndMinutes,
        selectedLocalDate: utcDateToLocalDateString(record.selectedLocalDate),
        selectedSlotKey: record.selectedSlotKey,
        selectedStartMinutes: record.selectedStartMinutes,
        status: record.status,
        timeZone: record.timeZone,
      },
      customer: {
        email: record.customerEmail,
        locale: preferredLocale,
        name: record.customerName,
        phone: record.customerPhone,
      },
      experience: {
        id: record.experienceId,
        name: record.experienceNameSnapshot,
      },
      payment: {
        cashRemainingAmountMinor: record.cashRemainingAmountMinor,
        cashRemainingCurrency: record.cashRemainingCurrency,
        depositAmountMinor: record.depositAmountMinor,
        depositCurrency: record.depositCurrency,
        totalAmountMinor: record.totalAmountMinor,
        totalCurrency: record.totalCurrency,
      },
    },
  };
}

export function notificationAuditEntryToPrismaCreateModel(
  entry: NotificationAuditEntryWriteModel,
): PrismaNotificationAuditEntryCreateModel {
  return {
    action: entry.action,
    actorUserId: entry.actorUserId,
    createdAt: entry.createdAt,
    diffJson: entry.diff,
    reason: null,
    resourceId: entry.resourceId,
    resourceType: entry.resourceType,
  };
}

function notificationTemplateTranslationId(templateId: string, locale: string) {
  return `notification-template-translation-${templateId}-${locale}`;
}

function stringArrayFromJson(value: unknown) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("Unsupported persisted notification variable list.");
  }

  return value;
}

function stringRecordFromJson(value: unknown) {
  if (
    !isPlainObject(value) ||
    Object.values(value).some((item) => typeof item !== "string")
  ) {
    throw new Error("Unsupported persisted notification provider variables.");
  }

  return value as Record<string, string>;
}

function notificationPayloadFromJson(value: unknown): NotificationPayload {
  if (!isNotificationPayload(value)) {
    throw new Error("Unsupported persisted notification payload.");
  }

  return value;
}

function isNotificationPayload(value: unknown): value is NotificationPayload {
  return isPlainObject(value) && isNotificationPayloadRecord(value);
}

function isNotificationPayloadRecord(
  value: Record<string, unknown>,
): value is NotificationPayload {
  return Object.values(value).every(isNotificationPayloadValue);
}

function isNotificationPayloadValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isNotificationPayloadValue);
  }

  if (isPlainObject(value)) {
    return Object.values(value).every(isNotificationPayloadValue);
  }

  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function notificationRuleLocaleStrategyFromPrisma(
  value: string,
): NotificationRuleLocaleStrategy {
  if (value === "BOOKING_PREFERRED_LOCALE") {
    return value;
  }

  throw new Error("Unsupported persisted notification rule locale strategy.");
}

function notificationRuleMissingTranslationBehaviorFromPrisma(
  value: string,
): NotificationRuleMissingTranslationBehavior {
  if (value === "DO_NOT_SEND") {
    return value;
  }

  throw new Error(
    "Unsupported persisted notification rule missing translation behavior.",
  );
}

function notificationRuleRecipientTypeFromPrisma(
  value: string,
): NotificationRuleRecipientType {
  if (value === "BUYER") {
    return value;
  }

  throw new Error("Unsupported persisted notification rule recipient type.");
}

function notificationRuleSendModeFromPrisma(
  value: string,
): NotificationRuleSendMode {
  if (value === "AUTOMATIC" || value === "MANUAL_REVIEW") {
    return value;
  }

  throw new Error("Unsupported persisted notification rule send mode.");
}

function notificationRuleStatusFromPrisma(
  value: string,
): NotificationRuleStatus {
  if (value === "ACTIVE" || value === "ARCHIVED") {
    return value;
  }

  throw new Error("Unsupported persisted notification rule status.");
}

function notificationTemplateStatusFromPrisma(
  value: string,
): NotificationTemplateStatus {
  if (
    value === "ACTIVE" ||
    value === "ARCHIVED" ||
    value === "DRAFT" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted notification template status.");
}

function notificationTemplateTranslationStatusFromPrisma(
  value: string,
): NotificationTemplateTranslationStatus {
  if (
    value === "ARCHIVED" ||
    value === "DRAFT" ||
    value === "PUBLISHED" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error(
    "Unsupported persisted notification template translation status.",
  );
}

function notificationDeliveryRecipientTypeFromPrisma(
  value: string,
): NotificationDeliveryRecipient["recipientType"] {
  if (value === "BUYER") {
    return value;
  }

  throw new Error("Unsupported persisted notification delivery recipient type.");
}

function notificationDeliveryStatusFromPrisma(
  value: string,
): ReturnType<NotificationDelivery["toSnapshot"]>["status"] {
  if (
    value === "CANCELLED" ||
    value === "DELIVERED" ||
    value === "FAILED" ||
    value === "MANUAL_REVIEW" ||
    value === "PENDING" ||
    value === "SENT"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted notification delivery status.");
}

function notificationOutboxMessageStatusFromPrisma(
  value: string,
): NotificationOutboxMessageReadModel["status"] {
  if (value === "FAILED" || value === "PENDING" || value === "PUBLISHED") {
    return value;
  }

  throw new Error("Unsupported persisted notification outbox status.");
}

function notificationBookingConsentStatusFromPrisma(
  value: string,
): NotificationBookingReadModel["notificationPreferences"]["email"]["consentStatus"] {
  if (value === "GRANTED" || value === "NOT_ASKED" || value === "REVOKED") {
    return value;
  }

  throw new Error("Unsupported persisted notification consent status.");
}

function localeFromPrisma(value: string) {
  return LocaleCode.create(value).value;
}
