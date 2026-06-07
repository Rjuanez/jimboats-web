import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";

import { NotificationChannel } from "./NotificationChannel";
import { NotificationTemplate } from "./NotificationTemplate";
import { NotificationType } from "./NotificationType";

describe("NotificationTemplate", () => {
  it("activates a template when required published locales are available", () => {
    const activated = createTemplate({
      status: "READY",
    }).activate({
      requiredLocales: ["en"],
      updatedAt: new Date("2026-06-02T10:00:00.000Z"),
      updatedByUserId: "admin-user",
    });

    expect(activated.toSnapshot()).toMatchObject({
      allowedVariables: ["booking.reference", "customer.name"],
      channel: "EMAIL",
      requiredVariables: ["booking.reference"],
      status: "ACTIVE",
      translations: [
        {
          locale: "en",
          htmlBody:
            "<p>Hello {{ customer.name }}, your booking {{ booking.reference }} is confirmed.</p>",
          status: "PUBLISHED",
          subject: "Booking {{ booking.reference }} confirmed",
          variablesUsed: ["booking.reference", "customer.name"],
        },
      ],
    });
  });

  it("rejects content variables that are not allowed", () => {
    expect(() =>
      createTemplate({
        translations: [
          createTranslation({
            body: "Your skipper is {{ skipper.name }}.",
          }),
        ],
      }),
    ).toThrow(DomainError);
  });

  it("requires a subject for ready email translations", () => {
    expect(() =>
      createTemplate({
        translations: [
          createTranslation({
            subject: null,
          }),
        ],
      }),
    ).toThrow(DomainError);
  });

  it("requires published translations to include required variables", () => {
    expect(() =>
      createTemplate({
        translations: [
          createTranslation({
            body: "Hello {{ customer.name }}.",
            htmlBody: null,
            previewText: "Booking confirmed",
            subject: "Booking confirmed",
          }),
        ],
      }),
    ).toThrow(DomainError);
  });

  it("does not activate when a required locale is missing", () => {
    const template = createTemplate({ status: "READY" });

    expect(() =>
      template.activate({
        requiredLocales: ["en", "es"],
        updatedAt: new Date("2026-06-02T10:00:00.000Z"),
        updatedByUserId: "admin-user",
      }),
    ).toThrow(DomainError);
  });

  it("stores WhatsApp translations without subjects", () => {
    const template = createTemplate({
      channel: NotificationChannel.create("whatsapp"),
      translations: [
        createTranslation({
          subject: "Ignored subject",
        }),
      ],
    });

    expect(template.toSnapshot().translations[0].subject).toBeNull();
  });
});

function createTemplate(
  patch: Partial<Parameters<typeof NotificationTemplate.create>[0]> = {},
) {
  const now = new Date("2026-06-01T10:00:00.000Z");

  return NotificationTemplate.create({
    allowedVariables: ["booking.reference", "customer.name"],
    channel: NotificationChannel.create("email"),
    eventType: "BookingCreated",
    id: "notification-template-1",
    notificationType: NotificationType.create("BOOKING_CREATED"),
    providerTemplateId: null,
    requiredVariables: ["booking.reference"],
    status: "ACTIVE",
    translations: [createTranslation()],
    updatedAt: now,
    updatedByUserId: "admin-user",
    version: 1,
    ...patch,
  });
}

function createTranslation(
  patch: Partial<
    Parameters<typeof NotificationTemplate.create>[0]["translations"][number]
  > = {},
) {
  return {
    body:
      "Hello {{ customer.name }}, your booking {{ booking.reference }} is confirmed.",
    htmlBody:
      "<p>Hello {{ customer.name }}, your booking {{ booking.reference }} is confirmed.</p>",
    locale: LocaleCode.create("en"),
    previewText: "Booking {{ booking.reference }} confirmed",
    status: "PUBLISHED" as const,
    subject: "Booking {{ booking.reference }} confirmed",
    updatedAt: new Date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    ...patch,
  };
}
