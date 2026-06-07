import { describe, expect, it } from "vitest";

import { LocaleCode } from "@/shared/domain/LocaleCode";

import { NotificationChannel } from "@/modules/notifications/domain/NotificationChannel";
import { NotificationDelivery } from "@/modules/notifications/domain/NotificationDelivery";
import { NotificationRule } from "@/modules/notifications/domain/NotificationRule";
import { NotificationTemplate } from "@/modules/notifications/domain/NotificationTemplate";
import { NotificationType } from "@/modules/notifications/domain/NotificationType";

import {
  notificationAuditEntryToPrismaCreateModel,
  notificationBookingReadModelFromPrismaRecord,
  notificationDeliveryFromPrismaRecord,
  notificationDeliveryToPrismaWriteModel,
  notificationOutboxMessageFromPrismaRecord,
  notificationRuleFromPrismaRecord,
  notificationRuleToPrismaWriteModel,
  notificationTemplateFromPrismaRecord,
  notificationTemplateToPrismaWriteModel,
  type PrismaNotificationBookingRecord,
  type PrismaNotificationDeliveryRecord,
  type PrismaNotificationRuleRecord,
  type PrismaNotificationTemplateRecord,
} from "./PrismaNotificationMappers";

describe("Prisma notification mappers", () => {
  it("maps notification rules both ways", () => {
    const rule = notificationRuleFromPrismaRecord(ruleRecord());
    const writeModel = notificationRuleToPrismaWriteModel(rule);

    expect(rule.toSnapshot()).toMatchObject({
      channel: "EMAIL",
      eventType: "BookingCreated",
      id: "rule-email",
      templateId: "template-email",
    });
    expect(writeModel).toMatchObject({
      id: "rule-email",
      rule: {
        channel: "EMAIL",
        enabled: true,
        notificationType: "BOOKING_CREATED",
      },
    });
  });

  it("maps notification templates and translation variable metadata", () => {
    const template = notificationTemplateFromPrismaRecord(templateRecord());
    const writeModel = notificationTemplateToPrismaWriteModel(template);

    expect(template.toSnapshot()).toMatchObject({
      allowedVariables: ["booking.reference", "customer.name"],
      id: "template-email",
      translations: [
        {
          locale: "en",
          variablesUsed: ["booking.reference", "customer.name"],
        },
      ],
    });
    expect(writeModel.translations).toMatchObject([
      {
        id: "notification-template-translation-template-email-en",
        variablesUsedJson: ["booking.reference", "customer.name"],
      },
    ]);
  });

  it("maps notification deliveries both ways", () => {
    const delivery = notificationDeliveryFromPrismaRecord(deliveryRecord());
    const writeModel = notificationDeliveryToPrismaWriteModel(delivery);

    expect(delivery.toSnapshot()).toMatchObject({
      bookingId: "booking-1",
      channel: "EMAIL",
      id: "delivery-1",
      recipient: {
        email: "guest@example.com",
      },
      status: "PENDING",
    });
    expect(writeModel).toMatchObject({
      delivery: {
        payloadJson: {
          booking: {
            reference: "JB-2026-0001",
          },
        },
        recipientEmail: "guest@example.com",
        status: "PENDING",
      },
      id: "delivery-1",
    });
  });

  it("maps outbox messages and booking notification read models", () => {
    const outbox = notificationOutboxMessageFromPrismaRecord({
      aggregateId: "booking-1",
      aggregateType: "BOOKING",
      eventType: "BookingCreated",
      id: "outbox-1",
      payload: {
        bookingId: "booking-1",
      },
      status: "PENDING",
    });
    const booking = notificationBookingReadModelFromPrismaRecord(bookingRecord());

    expect(outbox).toMatchObject({
      aggregateType: "BOOKING",
      status: "PENDING",
    });
    expect(booking).toMatchObject({
      notificationPreferences: {
        email: {
          consentStatus: "GRANTED",
          destination: "guest@example.com",
          enabled: true,
        },
        preferredLocale: "en",
      },
      templatePayload: {
        booking: {
          reference: "JB-2026-0001",
          selectedLocalDate: "2026-06-10",
        },
        customer: {
          name: "Sailor Guest",
        },
      },
    });
  });

  it("maps booking reader defaults without granted consent", () => {
    const booking = notificationBookingReadModelFromPrismaRecord(
      bookingRecord({
        notificationPreference: null,
      }),
    );

    expect(booking.notificationPreferences).toMatchObject({
      email: {
        consentStatus: "NOT_ASKED",
        destination: "guest@example.com",
        enabled: false,
      },
      whatsapp: {
        consentStatus: "NOT_ASKED",
        destination: "+34 600 000 000",
        enabled: false,
      },
    });
  });

  it("maps notification audit entries into audit table writes", () => {
    const audit = notificationAuditEntryToPrismaCreateModel({
      action: "NOTIFICATION_RULE_UPDATED",
      actorUserId: "admin-user",
      createdAt: date("2026-06-03T10:00:00.000Z"),
      diff: {
        after: {
          enabled: true,
        },
      },
      resourceId: "rule-email",
      resourceType: "NOTIFICATION_RULE",
    });

    expect(audit).toEqual({
      action: "NOTIFICATION_RULE_UPDATED",
      actorUserId: "admin-user",
      createdAt: date("2026-06-03T10:00:00.000Z"),
      diffJson: {
        after: {
          enabled: true,
        },
      },
      reason: null,
      resourceId: "rule-email",
      resourceType: "NOTIFICATION_RULE",
    });
  });
});

export function createNotificationRule(
  patch: Partial<Parameters<typeof NotificationRule.create>[0]> = {},
) {
  return NotificationRule.create({
    channel: NotificationChannel.create("email"),
    createdAt: date("2026-06-01T10:00:00.000Z"),
    enabled: true,
    eventType: "BookingCreated",
    id: "rule-email",
    localeStrategy: "BOOKING_PREFERRED_LOCALE",
    missingTranslationBehavior: "DO_NOT_SEND",
    notificationType: NotificationType.create("BOOKING_CREATED"),
    recipientType: "BUYER",
    requiresConsent: true,
    sendMode: "AUTOMATIC",
    status: "ACTIVE",
    templateId: "template-email",
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    ...patch,
  });
}

export function createNotificationTemplate(
  patch: Partial<Parameters<typeof NotificationTemplate.create>[0]> = {},
) {
  return NotificationTemplate.create({
    allowedVariables: ["booking.reference", "customer.name"],
    channel: NotificationChannel.create("email"),
    eventType: "BookingCreated",
    id: "template-email",
    notificationType: NotificationType.create("BOOKING_CREATED"),
    providerTemplateId: null,
    requiredVariables: ["booking.reference"],
    status: "ACTIVE",
    translations: [
      {
        body:
          "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
        htmlBody:
          "<p>Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.</p>",
        locale: LocaleCode.create("en"),
        previewText: "Booking {{ booking.reference }} confirmed",
        status: "PUBLISHED",
        subject: "Booking {{ booking.reference }} confirmed",
        updatedAt: date("2026-06-01T10:00:00.000Z"),
        updatedByUserId: "admin-user",
      },
    ],
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    version: 1,
    ...patch,
  });
}

export function createNotificationDelivery(
  patch: Partial<Parameters<typeof NotificationDelivery.createPending>[0]> = {},
) {
  return NotificationDelivery.createPending({
    bookingId: "booking-1",
    channel: NotificationChannel.create("email"),
    createdAt: date("2026-06-01T10:00:00.000Z"),
    eventType: "BookingCreated",
    id: "delivery-1",
    locale: LocaleCode.create("en"),
    notificationType: NotificationType.create("BOOKING_CREATED"),
    outboxMessageId: "outbox-1",
    payload: {
      booking: {
        reference: "JB-2026-0001",
      },
      customer: {
        name: "Sailor Guest",
      },
    },
    providerTemplateId: null,
    providerVariables: {},
    recipient: {
      email: "guest@example.com",
      name: "Sailor Guest",
      phone: null,
      recipientType: "BUYER",
    },
    renderedBody: "Hello Sailor Guest, booking JB-2026-0001 is confirmed.",
    renderedHtmlBody:
      "<p>Hello Sailor Guest, booking JB-2026-0001 is confirmed.</p>",
    renderedSubject: "Booking JB-2026-0001 confirmed",
    ruleId: "rule-email",
    sendAfter: null,
    templateId: "template-email",
    templateVersion: 1,
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    ...patch,
  });
}

export function ruleRecord(
  patch: Partial<PrismaNotificationRuleRecord> = {},
): PrismaNotificationRuleRecord {
  return {
    channel: "EMAIL",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    enabled: true,
    eventType: "BookingCreated",
    id: "rule-email",
    localeStrategy: "BOOKING_PREFERRED_LOCALE",
    missingTranslationBehavior: "DO_NOT_SEND",
    notificationType: "BOOKING_CREATED",
    recipientType: "BUYER",
    requiresConsent: true,
    sendMode: "AUTOMATIC",
    status: "ACTIVE",
    templateId: "template-email",
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    ...patch,
  };
}

export function templateRecord(
  patch: Partial<PrismaNotificationTemplateRecord> = {},
): PrismaNotificationTemplateRecord {
  return {
    allowedVariablesJson: ["booking.reference", "customer.name"],
    channel: "EMAIL",
    eventType: "BookingCreated",
    id: "template-email",
    notificationType: "BOOKING_CREATED",
    providerTemplateId: null,
    requiredVariablesJson: ["booking.reference"],
    status: "ACTIVE",
    translations: [
      {
        body:
          "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
        htmlBody:
          "<p>Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.</p>",
        id: "translation-en",
        locale: "en",
        previewText: "Booking {{ booking.reference }} confirmed",
        status: "PUBLISHED",
        subject: "Booking {{ booking.reference }} confirmed",
        templateId: "template-email",
        updatedAt: date("2026-06-01T10:00:00.000Z"),
        updatedByUserId: "admin-user",
        variablesUsedJson: ["booking.reference", "customer.name"],
      },
    ],
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    version: 1,
    ...patch,
  };
}

export function deliveryRecord(
  patch: Partial<PrismaNotificationDeliveryRecord> = {},
): PrismaNotificationDeliveryRecord {
  return {
    attempts: 0,
    bookingId: "booking-1",
    channel: "EMAIL",
    createdAt: date("2026-06-01T10:00:00.000Z"),
    deliveredAt: null,
    eventType: "BookingCreated",
    failureReason: null,
    id: "delivery-1",
    locale: "en",
    notificationType: "BOOKING_CREATED",
    outboxMessageId: "outbox-1",
    payloadJson: {
      booking: {
        reference: "JB-2026-0001",
      },
    },
    provider: null,
    providerMessageId: null,
    providerTemplateId: null,
    providerVariablesJson: {},
    recipientEmail: "guest@example.com",
    recipientName: "Sailor Guest",
    recipientPhone: null,
    recipientType: "BUYER",
    renderedBody: "Hello Sailor Guest, booking JB-2026-0001 is confirmed.",
    renderedHtmlBody:
      "<p>Hello Sailor Guest, booking JB-2026-0001 is confirmed.</p>",
    renderedSubject: "Booking JB-2026-0001 confirmed",
    ruleId: "rule-email",
    sendAfter: null,
    sentAt: null,
    status: "PENDING",
    templateId: "template-email",
    templateVersion: 1,
    updatedAt: date("2026-06-01T10:00:00.000Z"),
    ...patch,
  };
}

export function bookingRecord(
  patch: Partial<PrismaNotificationBookingRecord> = {},
): PrismaNotificationBookingRecord {
  return {
    cashRemainingAmountMinor: 119_000,
    cashRemainingCurrency: "EUR",
    customerEmail: "guest@example.com",
    customerLocale: "en",
    customerName: "Sailor Guest",
    customerPhone: "+34 600 000 000",
    depositAmountMinor: 10_000,
    depositCurrency: "EUR",
    experienceId: "sunset-cruise",
    experienceNameSnapshot: "Sunset Cruise",
    guestCount: 4,
    id: "booking-1",
    notificationPreference: {
      emailAddress: "guest@example.com",
      emailConsentStatus: "GRANTED",
      emailEnabled: true,
      preferredLocale: "en",
      whatsappConsentStatus: "NOT_ASKED",
      whatsappEnabled: false,
      whatsappPhone: "+34 600 000 000",
    },
    reference: "JB-2026-0001",
    selectedEndMinutes: 14 * 60,
    selectedLocalDate: date("2026-06-10T00:00:00.000Z"),
    selectedSlotKey: "morning",
    selectedStartMinutes: 10 * 60,
    status: "CONFIRMED",
    timeZone: "Europe/Madrid",
    totalAmountMinor: 129_000,
    totalCurrency: "EUR",
    ...patch,
  };
}

function date(value: string) {
  return new Date(value);
}
