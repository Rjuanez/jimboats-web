import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";

import { NotificationChannel } from "./NotificationChannel";
import { NotificationRule } from "./NotificationRule";
import { NotificationType } from "./NotificationType";

describe("NotificationRule", () => {
  it("creates an automatic buyer rule that can create pending deliveries", () => {
    const rule = createRule();

    expect(rule.canCreateDelivery()).toBe(true);
    expect(rule.deliveryStatusForRule()).toBe("PENDING");
    expect(rule.toSnapshot()).toMatchObject({
      channel: "EMAIL",
      eventType: "BookingCreated",
      notificationType: "BOOKING_CREATED",
      recipientType: "BUYER",
      requiresConsent: true,
      sendMode: "AUTOMATIC",
      status: "ACTIVE",
    });
  });

  it("marks manual review rules as manual delivery candidates", () => {
    const rule = createRule({ sendMode: "MANUAL_REVIEW" });

    expect(rule.deliveryStatusForRule()).toBe("MANUAL_REVIEW");
  });

  it("rejects enabled active rules without template", () => {
    expect(() => createRule({ templateId: null })).toThrow(DomainError);
  });

  it("requires buyer consent for launch buyer rules", () => {
    expect(() => createRule({ requiresConsent: false })).toThrow(DomainError);
  });

  it("rejects unsupported channels and notification types", () => {
    expect(() => NotificationChannel.create("fax")).toThrow(DomainError);
    expect(() => NotificationType.create("BOOKING_UNKNOWN")).toThrow(
      DomainError,
    );
    expect(() =>
      NotificationType.fromOutboxEvent("UnknownEvent" as never),
    ).toThrow(DomainError);
  });

  it("archives rules and prevents new deliveries", () => {
    const archived = createRule().archive({
      updatedAt: new Date("2026-06-02T10:00:00.000Z"),
      updatedByUserId: "admin-user",
    });

    expect(archived.canCreateDelivery()).toBe(false);
    expect(archived.toSnapshot()).toMatchObject({
      enabled: false,
      status: "ARCHIVED",
      updatedByUserId: "admin-user",
    });
    expect(() => archived.deliveryStatusForRule()).toThrow(DomainError);
  });
});

function createRule(
  patch: Partial<Parameters<typeof NotificationRule.create>[0]> = {},
) {
  const now = new Date("2026-06-01T10:00:00.000Z");

  return NotificationRule.create({
    channel: NotificationChannel.create("email"),
    createdAt: now,
    enabled: true,
    eventType: "BookingCreated",
    id: "notification-rule-1",
    localeStrategy: "BOOKING_PREFERRED_LOCALE",
    missingTranslationBehavior: "DO_NOT_SEND",
    notificationType: NotificationType.fromOutboxEvent("BookingCreated"),
    recipientType: "BUYER",
    requiresConsent: true,
    sendMode: "AUTOMATIC",
    status: "ACTIVE",
    templateId: "notification-template-1",
    updatedAt: now,
    updatedByUserId: "admin-user",
    ...patch,
  });
}
