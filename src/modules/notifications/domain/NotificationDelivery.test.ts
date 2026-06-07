import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";

import { NotificationChannel } from "./NotificationChannel";
import { NotificationDelivery } from "./NotificationDelivery";
import { NotificationType } from "./NotificationType";

describe("NotificationDelivery", () => {
  it("creates a pending rendered email delivery", () => {
    const delivery = createDelivery();

    expect(delivery.toSnapshot()).toMatchObject({
      attempts: 0,
      bookingId: "booking-1",
      channel: "EMAIL",
      locale: "en",
      notificationType: "BOOKING_CREATED",
      recipient: {
        email: "guest@example.com",
        name: "Guest",
        phone: null,
        recipientType: "BUYER",
      },
      renderedSubject: "Booking confirmed",
      renderedHtmlBody: "<p>Your booking is confirmed.</p>",
      status: "PENDING",
    });
  });

  it("creates manual review WhatsApp deliveries", () => {
    const delivery = NotificationDelivery.createManualReview({
      ...baseDeliveryProps(),
      channel: NotificationChannel.create("whatsapp"),
      recipient: {
        email: null,
        name: "Guest",
        phone: "+34 600 000 000",
        recipientType: "BUYER",
      },
      renderedSubject: "Ignored subject",
    });

    expect(delivery.toSnapshot()).toMatchObject({
      channel: "WHATSAPP",
      recipient: {
        email: null,
        phone: "+34 600 000 000",
      },
      renderedSubject: null,
      status: "MANUAL_REVIEW",
    });
  });

  it("rejects booking notifications without booking id", () => {
    expect(() => createDelivery({ bookingId: null })).toThrow(DomainError);
  });

  it("marks pending deliveries as sent and delivered", () => {
    const sentAt = new Date("2026-06-01T10:05:00.000Z");
    const deliveredAt = new Date("2026-06-01T10:06:00.000Z");
    const delivered = createDelivery()
      .markSent({
        provider: "email-provider",
        providerMessageId: "provider-message-1",
        sentAt,
      })
      .markDelivered({ deliveredAt });

    expect(delivered.toSnapshot()).toMatchObject({
      attempts: 1,
      deliveredAt: deliveredAt.toISOString(),
      provider: "email-provider",
      providerMessageId: "provider-message-1",
      sentAt: sentAt.toISOString(),
      status: "DELIVERED",
    });
  });

  it("records failed attempts", () => {
    const failedAt = new Date("2026-06-01T10:05:00.000Z");
    const failed = createDelivery().markFailed({
      failedAt,
      reason: "Provider timeout",
    });

    expect(failed.toSnapshot()).toMatchObject({
      attempts: 1,
      failureReason: "Provider timeout",
      status: "FAILED",
      updatedAt: failedAt.toISOString(),
    });
  });

  it("does not cancel sent deliveries", () => {
    const sent = createDelivery().markSent({
      provider: "email-provider",
      providerMessageId: "provider-message-1",
      sentAt: new Date("2026-06-01T10:05:00.000Z"),
    });

    expect(() =>
      sent.cancel({
        cancelledAt: new Date("2026-06-01T10:06:00.000Z"),
        reason: "Booking changed",
      }),
    ).toThrow(DomainError);
  });

  it("requires reminders to be scheduled", () => {
    expect(() =>
      createDelivery({
        notificationType: NotificationType.create("BOOKING_REMINDER"),
        sendAfter: null,
      }),
    ).toThrow(DomainError);
  });
});

function createDelivery(
  patch: Partial<Parameters<typeof NotificationDelivery.createPending>[0]> = {},
) {
  return NotificationDelivery.createPending({
    ...baseDeliveryProps(),
    ...patch,
  });
}

function baseDeliveryProps() {
  const now = new Date("2026-06-01T10:00:00.000Z");

  return {
    bookingId: "booking-1",
    channel: NotificationChannel.create("email"),
    createdAt: now,
    eventType: "BookingCreated",
    id: "notification-delivery-1",
    locale: LocaleCode.create("en"),
    notificationType: NotificationType.create("BOOKING_CREATED"),
    outboxMessageId: "outbox-message-1",
    payload: {
      booking: {
        reference: "JB-2026-0001",
      },
    },
    providerTemplateId: null,
    providerVariables: {},
    recipient: {
      email: "GUEST@example.com",
      name: " Guest ",
      phone: null,
      recipientType: "BUYER" as const,
    },
    renderedBody: "Your booking is confirmed.",
    renderedHtmlBody: "<p>Your booking is confirmed.</p>",
    renderedSubject: "Booking confirmed",
    ruleId: "notification-rule-1",
    sendAfter: null,
    templateId: "notification-template-1",
    templateVersion: 1,
    updatedAt: now,
  };
}
