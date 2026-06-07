import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";
import { LocaleCode } from "@/shared/domain/LocaleCode";

import { NotificationChannel } from "../domain/NotificationChannel";
import {
  NotificationDelivery,
  type NotificationDeliverySnapshot,
  type NotificationPayload,
} from "../domain/NotificationDelivery";
import { NotificationRule } from "../domain/NotificationRule";
import { NotificationTemplate } from "../domain/NotificationTemplate";
import { NotificationType } from "../domain/NotificationType";
import { GetAdminNotificationsWorkspaceUseCase } from "./GetAdminNotificationsWorkspaceUseCase";
import { ProcessNextNotificationWorkUseCase } from "./ProcessNextNotificationWorkUseCase";
import { ProcessOutboxNotificationEventUseCase } from "./ProcessOutboxNotificationEventUseCase";
import { PreviewNotificationTemplateUseCase } from "./PreviewNotificationTemplateUseCase";
import { SendBookingNotificationUseCase } from "./SendBookingNotificationUseCase";
import { UpdateNotificationRuleUseCase } from "./UpdateNotificationRuleUseCase";
import { UpdateNotificationTemplateUseCase } from "./UpdateNotificationTemplateUseCase";
import type { NotificationAuditEntryWriteModel } from "./ports/NotificationAuditRepository";
import type { NotificationBookingReadModel } from "./ports/NotificationBookingReader";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationDeliveryRepository } from "./ports/NotificationDeliveryRepository";
import type { NotificationIdGenerator } from "./ports/NotificationIdGenerator";
import type { NotificationProvider } from "./ports/NotificationProvider";
import type { NotificationRuleRepository } from "./ports/NotificationRuleRepository";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";
import type {
  NotificationOutboxMessageReadModel,
  OutboxRepository,
} from "./ports/OutboxRepository";
import type {
  TemplateRenderer,
  TemplateRenderInput,
  TemplateRenderResult,
} from "./ports/TemplateRenderer";

describe("Notifications application use cases", () => {
  it("processes a booking outbox event into a pending email delivery", async () => {
    const bed = createTestBed();
    const useCase = bed.createProcessOutboxUseCase();

    const result = await useCase.execute({ outboxMessageId: "outbox-1" });
    const delivery = bed.deliveries.deliveries.get(
      "delivery-outbox-1-rule-email",
    );

    expect(result).toEqual({
      createdDeliveryIds: ["delivery-outbox-1-rule-email"],
      outboxMessageId: "outbox-1",
      skippedRules: [],
      status: "PUBLISHED",
    });
    expect(delivery?.toSnapshot()).toMatchObject({
      bookingId: "booking-1",
      channel: "EMAIL",
      locale: "en",
      outboxMessageId: "outbox-1",
      recipient: {
        email: "guest@example.com",
        name: "Sailor Guest",
        phone: null,
      },
      renderedBody: "Hello Sailor Guest, booking JB-2026-0001 is confirmed.",
      renderedHtmlBody: null,
      renderedSubject: "Booking JB-2026-0001 confirmed",
      status: "PENDING",
      templateId: "template-email",
      templateVersion: 1,
    });
    expect(bed.outbox.published).toEqual([
      {
        id: "outbox-1",
        publishedAt: bed.clock.fixedNow,
      },
    ]);
  });

  it("records consent skips without failing the outbox", async () => {
    const bed = createTestBed();
    const booking = createBooking();

    bed.bookings.bookings.set("booking-1", {
      ...booking,
      notificationPreferences: {
        ...booking.notificationPreferences,
        email: {
          consentStatus: "REVOKED",
          destination: "guest@example.com",
          enabled: false,
        },
      },
    });

    const result = await bed
      .createProcessOutboxUseCase()
      .execute({ outboxMessageId: "outbox-1" });

    expect(result.createdDeliveryIds).toEqual([]);
    expect(result.skippedRules).toEqual([
      {
        reason: "CONSENT_MISSING",
        ruleId: "rule-email",
      },
    ]);
    expect(bed.deliveries.deliveries.size).toBe(0);
    expect(bed.outbox.published).toHaveLength(1);
    expect(bed.outbox.failed).toHaveLength(0);
  });

  it("records missing translation skips without silently falling back", async () => {
    const bed = createTestBed();
    const booking = createBooking();

    bed.bookings.bookings.set("booking-1", {
      ...booking,
      notificationPreferences: {
        ...booking.notificationPreferences,
        preferredLocale: "es",
      },
    });

    const result = await bed
      .createProcessOutboxUseCase()
      .execute({ outboxMessageId: "outbox-1" });

    expect(result.createdDeliveryIds).toEqual([]);
    expect(result.skippedRules).toEqual([
      {
        reason: "TRANSLATION_MISSING",
        ruleId: "rule-email",
      },
    ]);
    expect(bed.deliveries.deliveries.size).toBe(0);
    expect(bed.outbox.published).toHaveLength(1);
  });

  it("processes automatic WhatsApp outbox rules with provider template data", async () => {
    const bed = createTestBed();

    bed.rules.rules.clear();
    bed.rules.rules.set(
      "rule-whatsapp",
      createRule({
        channel: NotificationChannel.create("whatsapp"),
        id: "rule-whatsapp",
        templateId: "template-whatsapp",
      }),
    );
    bed.templates.templates.set(
      "template-whatsapp",
      createTemplate({
        allowedVariables: [
          "booking_access_url",
          "booking_date",
          "booking_reference",
          "booking_time",
          "customer_name",
          "deposit_amount",
          "experience_name",
          "guest_count",
          "remaining_amount",
        ],
        channel: NotificationChannel.create("whatsapp"),
        id: "template-whatsapp",
        providerTemplateId: "template_prelude_1",
        requiredVariables: ["booking_reference"],
        translations: [
          createTranslation({
            body:
              "Hello {{ customer_name }}, booking {{ booking_reference }} for {{ experience_name }} is confirmed on {{ booking_date }} at {{ booking_time }}. Guests: {{ guest_count }}. Deposit: {{ deposit_amount }}. Remaining: {{ remaining_amount }}. {{ booking_access_url }}",
            previewText: "Booking {{ booking_reference }} confirmed",
            subject: null,
          }),
        ],
      }),
    );

    const result = await bed
      .createProcessOutboxUseCase()
      .execute({ outboxMessageId: "outbox-1" });
    const delivery = bed.deliveries.deliveries
      .get("delivery-outbox-1-rule-whatsapp")
      ?.toSnapshot();

    expect(result.createdDeliveryIds).toEqual([
      "delivery-outbox-1-rule-whatsapp",
    ]);
    expect(delivery).toMatchObject({
      channel: "WHATSAPP",
      providerTemplateId: "template_prelude_1",
      providerVariables: {
        booking_access_url: "",
        booking_date: "10/06/2026",
        booking_reference: "JB-2026-0001",
        booking_time: "10:00",
        customer_name: "Sailor Guest",
        deposit_amount: "100 EUR",
        experience_name: "Sunset Cruise",
        guest_count: "4",
        remaining_amount: "190 EUR",
      },
      renderedBody:
        "Hello Sailor Guest, booking JB-2026-0001 for Sunset Cruise is confirmed on 10/06/2026 at 10:00. Guests: 4. Deposit: 100 EUR. Remaining: 190 EUR.",
      recipient: {
        phone: "+34 600 000 000",
      },
      status: "PENDING",
    });
  });

  it("skips automatic WhatsApp rules without a provider template id", async () => {
    const bed = createTestBed();

    bed.rules.rules.clear();
    bed.rules.rules.set(
      "rule-whatsapp",
      createRule({
        channel: NotificationChannel.create("whatsapp"),
        id: "rule-whatsapp",
        templateId: "template-whatsapp",
      }),
    );
    bed.templates.templates.set(
      "template-whatsapp",
      createTemplate({
        channel: NotificationChannel.create("whatsapp"),
        id: "template-whatsapp",
        translations: [
          createTranslation({
            subject: null,
          }),
        ],
      }),
    );

    const result = await bed
      .createProcessOutboxUseCase()
      .execute({ outboxMessageId: "outbox-1" });

    expect(result.createdDeliveryIds).toEqual([]);
    expect(result.skippedRules).toEqual([
      {
        reason: "PROVIDER_TEMPLATE_MISSING",
        ruleId: "rule-whatsapp",
      },
    ]);
    expect(bed.deliveries.deliveries.size).toBe(0);
    expect(bed.outbox.published).toHaveLength(1);
  });

  it("marks processing failures in the outbox and exposes an application error", async () => {
    const bed = createTestBed();

    bed.renderer.shouldFail = true;

    const error = await captureApplicationError(() =>
      bed.createProcessOutboxUseCase().execute({ outboxMessageId: "outbox-1" }),
    );

    expect(error.code).toBe("NOTIFICATION_PROCESSING_FAILED");
    expect(bed.outbox.failed).toEqual([
      {
        failedAt: bed.clock.fixedNow,
        id: "outbox-1",
        reason: "Renderer failed.",
      },
    ]);
    expect(bed.outbox.published).toHaveLength(0);
  });

  it("updates notification rules and returns readiness warnings", async () => {
    const bed = createTestBed();
    const useCase = new UpdateNotificationRuleUseCase(
      bed.rules,
      bed.templates,
      bed.audit,
      bed.ids,
      bed.clock,
    );

    const dto = await useCase.execute({
      channel: "EMAIL",
      enabled: true,
      eventType: "BookingCreated",
      notificationType: "BOOKING_CREATED",
      recipientType: "BUYER",
      requiresConsent: true,
      ruleId: "rule-email",
      sendMode: "AUTOMATIC",
      status: "ACTIVE",
      templateId: "template-email",
      updatedByUserId: "admin-user",
    });

    expect(dto).toMatchObject({
      id: "rule-email",
      readinessWarnings: ["Missing published translations: es, ca."],
      templateId: "template-email",
      updatedByUserId: "admin-user",
    });
    expect(bed.audit.entries).toHaveLength(1);
    expect(bed.audit.entries[0]).toMatchObject({
      action: "NOTIFICATION_RULE_UPDATED",
      resourceId: "rule-email",
      resourceType: "NOTIFICATION_RULE",
    });
  });

  it("rejects duplicate active notification rules", async () => {
    const bed = createTestBed();
    const useCase = new UpdateNotificationRuleUseCase(
      bed.rules,
      bed.templates,
      bed.audit,
      bed.ids,
      bed.clock,
    );

    const error = await captureApplicationError(() =>
      useCase.execute({
        channel: "EMAIL",
        enabled: true,
        eventType: "BookingCreated",
        notificationType: "BOOKING_CREATED",
        recipientType: "BUYER",
        requiresConsent: true,
        sendMode: "AUTOMATIC",
        status: "ACTIVE",
        templateId: "template-email",
        updatedByUserId: "admin-user",
      }),
    );

    expect(error.code).toBe("NOTIFICATION_RULE_DUPLICATE");
  });

  it("updates notification templates and increments the version", async () => {
    const bed = createTestBed();
    const useCase = new UpdateNotificationTemplateUseCase(
      bed.templates,
      bed.audit,
      bed.clock,
    );

    const dto = await useCase.execute({
      allowedVariables: ["booking.reference", "customer.name"],
      channel: "EMAIL",
      eventType: "BookingCreated",
      notificationType: "BOOKING_CREATED",
      providerTemplateId: null,
      requiredVariables: ["booking.reference"],
      status: "ACTIVE",
      templateId: "template-email",
      translations: [
        {
          body:
            "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
          htmlBody: null,
          locale: "en",
          previewText: "Booking {{ booking.reference }} confirmed",
          status: "PUBLISHED",
          subject: "Booking {{ booking.reference }} confirmed",
        },
        {
          body:
            "Hola {{ customer.name }}, reserva {{ booking.reference }} confirmada.",
          htmlBody: null,
          locale: "es",
          previewText: "Reserva {{ booking.reference }} confirmada",
          status: "PUBLISHED",
          subject: "Reserva {{ booking.reference }} confirmada",
        },
      ],
      updatedByUserId: "admin-user",
    });

    expect(dto).toMatchObject({
      id: "template-email",
      missingPublishedLocales: ["ca"],
      version: 2,
    });
    expect(bed.templates.templates.get("template-email")?.toSnapshot().version).toBe(
      2,
    );
    expect(bed.audit.entries).toHaveLength(1);
    expect(bed.audit.entries[0]).toMatchObject({
      action: "NOTIFICATION_TEMPLATE_UPDATED",
      resourceId: "template-email",
      resourceType: "NOTIFICATION_TEMPLATE",
    });
  });

  it("previews draft template content with a fixture payload", async () => {
    const bed = createTestBed();
    const useCase = new PreviewNotificationTemplateUseCase(
      bed.templates,
      bed.bookings,
      bed.fixtures,
      bed.renderer,
    );

    const preview = await useCase.execute({
      draftBody:
        "Draft for {{ customer.name }} and booking {{ booking.reference }}.",
      draftHtmlBody:
        "<p>Draft for {{ customer.name }} and booking {{ booking.reference }}.</p>",
      draftPreviewText: "Draft {{ booking.reference }}",
      draftSubject: "Draft booking {{ booking.reference }}",
      fixtureKey: "booking-created",
      locale: "en",
      templateId: "template-email",
    });

    expect(preview).toEqual({
      missingVariables: [],
      renderedBody: "Draft for Fixture Guest and booking JB-FIXTURE.",
      renderedHtmlBody:
        "<p>Draft for Fixture Guest and booking JB-FIXTURE.</p>",
      renderedPreviewText: "Draft JB-FIXTURE",
      renderedSubject: "Draft booking JB-FIXTURE",
      variables: ["booking.reference", "customer.name"],
      warnings: [],
    });
  });

  it("sends email deliveries through the configured provider", async () => {
    const bed = createTestBed();
    const delivery = createDelivery();

    await bed.deliveries.save(delivery);

    const result = await bed
      .createSendBookingNotificationUseCase()
      .execute({ notificationDeliveryId: "delivery-1" });

    expect(result.status).toBe("SENT");
    expect(result.delivery).toMatchObject({
      attempts: 1,
      provider: "EMAIL_TEST",
    providerMessageId: "provider-message-1",
      status: "SENT",
    });
    expect(bed.provider.sent).toHaveLength(1);
  });

  it("records failed email provider attempts", async () => {
    const bed = createTestBed();

    await bed.deliveries.save(createDelivery());
    bed.provider.shouldFail = true;

    const error = await captureApplicationError(() =>
      bed
        .createSendBookingNotificationUseCase()
        .execute({ notificationDeliveryId: "delivery-1" }),
    );
    const failedDelivery = bed.deliveries.deliveries
      .get("delivery-1")
      ?.toSnapshot();

    expect(error.code).toBe("NOTIFICATION_PROVIDER_FAILED");
    expect(failedDelivery).toMatchObject({
      attempts: 1,
      failureReason: "Provider failed.",
      status: "FAILED",
    });
  });

  it("marks manual WhatsApp deliveries as sent without using the provider", async () => {
    const bed = createTestBed();
    const delivery = NotificationDelivery.createManualReview({
      ...baseDeliveryProps(),
      channel: NotificationChannel.create("whatsapp"),
      id: "delivery-whatsapp",
      recipient: {
        email: null,
        name: "Sailor Guest",
        phone: "+34 600 000 000",
        recipientType: "BUYER",
      },
    });

    await bed.deliveries.save(delivery);

    const result = await bed.createSendBookingNotificationUseCase().execute({
      notificationDeliveryId: "delivery-whatsapp",
      sentByUserId: "staff-user",
    });

    expect(result.delivery).toMatchObject({
      attempts: 1,
      channel: "WHATSAPP",
      provider: "MANUAL_WHATSAPP",
      providerMessageId: "staff-user",
      status: "SENT",
    });
    expect(bed.provider.sent).toHaveLength(0);
  });

  it("sends pending WhatsApp deliveries through the configured provider", async () => {
    const bed = createTestBed();
    const delivery = NotificationDelivery.createPending({
      ...baseDeliveryProps(),
      channel: NotificationChannel.create("whatsapp"),
      id: "delivery-whatsapp",
      providerTemplateId: "template_prelude_1",
      providerVariables: {
        "booking.reference": "JB-2026-0001",
      },
      recipient: {
        email: null,
        name: "Sailor Guest",
        phone: "+34 600 000 000",
        recipientType: "BUYER",
      },
    });

    await bed.deliveries.save(delivery);

    const result = await bed.createSendBookingNotificationUseCase().execute({
      notificationDeliveryId: "delivery-whatsapp",
    });

    expect(result.delivery).toMatchObject({
      attempts: 1,
      channel: "WHATSAPP",
      provider: "WHATSAPP_TEST",
      providerMessageId: "provider-message-1",
      status: "SENT",
    });
    expect(bed.provider.sent).toHaveLength(1);
  });

  it("processes the next notification worker unit of work", async () => {
    const bed = createTestBed();
    const useCase = new ProcessNextNotificationWorkUseCase(
      bed.outbox,
      bed.deliveries,
      bed.createProcessOutboxUseCase(),
      bed.provider,
      bed.clock,
    );

    const firstResult = await useCase.execute();
    const secondResult = await useCase.execute();
    const thirdResult = await useCase.execute();

    expect(firstResult).toMatchObject({
      outcome: "OUTBOX_PROCESSED",
      outboxMessageId: "outbox-1",
    });
    expect(secondResult).toMatchObject({
      notificationDeliveryId: "delivery-outbox-1-rule-email",
      outcome: "DELIVERY_SENT",
      status: "SENT",
    });
    expect(thirdResult).toEqual({
      outcome: "IDLE",
    });
  });

  it("loads the admin notifications workspace", async () => {
    const bed = createTestBed();

    await bed.deliveries.save(createDelivery());

    const workspace = await new GetAdminNotificationsWorkspaceUseCase(
      bed.rules,
      bed.templates,
      bed.deliveries,
    ).execute();

    expect(workspace.summary).toEqual({
      activeRules: 1,
      failedDeliveries: 0,
      manualReviewDeliveries: 0,
      templateWarnings: 1,
    });
    expect(workspace.eventOptions).toContainEqual({
      eventType: "BookingCreated",
      label: "Booking created",
      notificationType: "BOOKING_CREATED",
    });
    expect(workspace.templateOptions).toContainEqual(
      expect.objectContaining({
        id: "template-email",
        missingPublishedLocales: ["es", "ca"],
      }),
    );
    expect(workspace.rules[0]).toMatchObject({
      id: "rule-email",
      readinessWarnings: ["Missing published translations: es, ca."],
    });
    expect(workspace.deliveries[0]).toMatchObject({
      id: "delivery-1",
      status: "PENDING",
    });
  });
});

function createTestBed() {
  const clock = new FakeClock();
  const rules = new FakeNotificationRuleRepository();
  const templates = new FakeNotificationTemplateRepository();
  const deliveries = new FakeNotificationDeliveryRepository();
  const outbox = new FakeOutboxRepository();
  const bookings = new FakeNotificationBookingReader();
  const renderer = new FakeTemplateRenderer();
  const ids = new FakeNotificationIdGenerator();
  const audit = new FakeNotificationAuditRepository();
  const provider = new FakeNotificationProvider();
  const fixtures = new FakeNotificationPreviewFixtureProvider();

  rules.rules.set("rule-email", createRule());
  templates.templates.set("template-email", createTemplate());
  outbox.messages.set("outbox-1", createOutboxMessage());
  bookings.bookings.set("booking-1", createBooking());
  fixtures.fixtures.set("booking-created", {
    booking: {
      reference: "JB-FIXTURE",
    },
    customer: {
      name: "Fixture Guest",
    },
  });

  return {
    audit,
    bookings,
    clock,
    createProcessOutboxUseCase: () =>
      new ProcessOutboxNotificationEventUseCase(
        outbox,
        bookings,
        rules,
        templates,
        deliveries,
        renderer,
        ids,
        clock,
      ),
    createSendBookingNotificationUseCase: () =>
      new SendBookingNotificationUseCase(deliveries, provider, clock),
    deliveries,
    fixtures,
    ids,
    outbox,
    provider,
    renderer,
    rules,
    templates,
  };
}

function createRule(
  patch: Partial<Parameters<typeof NotificationRule.create>[0]> = {},
) {
  const now = new Date("2026-06-01T10:00:00.000Z");

  return NotificationRule.create({
    channel: NotificationChannel.create("email"),
    createdAt: now,
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
    updatedAt: now,
    updatedByUserId: "admin-user",
    ...patch,
  });
}

function createTemplate(
  patch: Partial<Parameters<typeof NotificationTemplate.create>[0]> = {},
) {
  const now = new Date("2026-06-01T10:00:00.000Z");

  return NotificationTemplate.create({
    allowedVariables: ["booking.reference", "customer.name"],
    channel: NotificationChannel.create("email"),
    eventType: "BookingCreated",
    id: "template-email",
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
      "Hello {{ customer.name }}, booking {{ booking.reference }} is confirmed.",
    htmlBody: null,
    locale: LocaleCode.create("en"),
    previewText: "Booking {{ booking.reference }} confirmed",
    status: "PUBLISHED" as const,
    subject: "Booking {{ booking.reference }} confirmed",
    updatedAt: new Date("2026-06-01T10:00:00.000Z"),
    updatedByUserId: "admin-user",
    ...patch,
  };
}

function createOutboxMessage(
  patch: Partial<NotificationOutboxMessageReadModel> = {},
): NotificationOutboxMessageReadModel {
  return {
    aggregateId: "booking-1",
    aggregateType: "BOOKING",
    eventType: "BookingCreated",
    id: "outbox-1",
    payload: {
      booking: {
        id: "booking-1",
      },
    },
    status: "PENDING",
    ...patch,
  };
}

function createBooking(
  patch: Partial<NotificationBookingReadModel> = {},
): NotificationBookingReadModel {
  return {
    customerName: "Sailor Guest",
    id: "booking-1",
    notificationPreferences: {
      email: {
        consentStatus: "GRANTED",
        destination: "GUEST@example.com",
        enabled: true,
      },
      preferredLocale: "en",
      whatsapp: {
        consentStatus: "GRANTED",
        destination: "+34 600 000 000",
        enabled: true,
      },
    },
    reference: "JB-2026-0001",
    templatePayload: {
      booking: {
        guestCount: 4,
        reference: "JB-2026-0001",
        selectedLocalDate: "2026-06-10",
        selectedStartMinutes: 600,
      },
      customer: {
        name: "Sailor Guest",
      },
      experience: {
        name: "Sunset Cruise",
      },
      payment: {
        cashRemainingAmountMinor: 19_000,
        cashRemainingCurrency: "EUR",
        depositAmountMinor: 10_000,
        depositCurrency: "EUR",
      },
    },
    ...patch,
  };
}

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
      recipientType: "BUYER" as const,
    },
    renderedBody: "Hello Sailor Guest, booking JB-2026-0001 is confirmed.",
    renderedHtmlBody: null,
    renderedSubject: "Booking JB-2026-0001 confirmed",
    ruleId: "rule-email",
    sendAfter: null,
    templateId: "template-email",
    templateVersion: 1,
    updatedAt: now,
  };
}

class FakeNotificationRuleRepository implements NotificationRuleRepository {
  readonly rules = new Map<string, NotificationRule>();

  async findActiveByIdentity(
    identity: Parameters<NotificationRuleRepository["findActiveByIdentity"]>[0],
  ) {
    return (
      [...this.rules.values()].find((rule) => {
        const snapshot = rule.toSnapshot();

        return (
          snapshot.status === "ACTIVE" &&
          snapshot.channel === identity.channel &&
          snapshot.eventType === identity.eventType &&
          snapshot.recipientType === identity.recipientType
        );
      }) ?? null
    );
  }

  async findById(id: string) {
    return this.rules.get(id) ?? null;
  }

  async list() {
    return [...this.rules.values()];
  }

  async listByEventType(eventType: string) {
    return [...this.rules.values()].filter(
      (rule) => rule.toSnapshot().eventType === eventType,
    );
  }

  async save(rule: NotificationRule) {
    this.rules.set(rule.id, rule);
  }
}

class FakeNotificationTemplateRepository
  implements NotificationTemplateRepository
{
  readonly templates = new Map<string, NotificationTemplate>();

  async findById(id: string) {
    return this.templates.get(id) ?? null;
  }

  async list() {
    return [...this.templates.values()];
  }

  async save(template: NotificationTemplate) {
    this.templates.set(template.id, template);
  }
}

class FakeNotificationDeliveryRepository
  implements NotificationDeliveryRepository
{
  readonly deliveries = new Map<string, NotificationDelivery>();

  async findById(id: string) {
    return this.deliveries.get(id) ?? null;
  }

  async findByOutboxMessageAndRule(input: {
    outboxMessageId: string;
    ruleId: string;
  }) {
    return (
      [...this.deliveries.values()].find((delivery) => {
        const snapshot = delivery.toSnapshot();

        return (
          snapshot.outboxMessageId === input.outboxMessageId &&
          snapshot.ruleId === input.ruleId
        );
      }) ?? null
    );
  }

  async findNextPendingToSend(now: Date) {
    return (
      [...this.deliveries.values()]
        .filter((delivery) => {
          const snapshot = delivery.toSnapshot();

          return (
            snapshot.status === "PENDING" &&
            (!snapshot.sendAfter || new Date(snapshot.sendAfter) <= now)
          );
        })
        .sort(
          (first, second) =>
            new Date(first.toSnapshot().createdAt).getTime() -
            new Date(second.toSnapshot().createdAt).getTime(),
        )[0] ?? null
    );
  }

  async listRecent(input: { limit?: number } = {}) {
    const limit = input.limit ?? 25;

    return [...this.deliveries.values()]
      .sort(
        (first, second) =>
          new Date(second.toSnapshot().createdAt).getTime() -
          new Date(first.toSnapshot().createdAt).getTime(),
      )
      .slice(0, limit);
  }

  async save(delivery: NotificationDelivery) {
    this.deliveries.set(delivery.toSnapshot().id, delivery);
  }
}

class FakeOutboxRepository implements OutboxRepository {
  readonly failed: Array<{
    failedAt: Date;
    id: string;
    reason: string;
  }> = [];
  readonly messages = new Map<string, NotificationOutboxMessageReadModel>();
  readonly published: Array<{
    id: string;
    publishedAt: Date;
  }> = [];

  async findById(id: string) {
    return this.messages.get(id) ?? null;
  }

  async findNextPending() {
    return (
      [...this.messages.values()].find(
        (message) => message.status === "PENDING",
      ) ?? null
    );
  }

  async markFailed(id: string, failedAt: Date, reason: string) {
    this.failed.push({ failedAt, id, reason });
    const message = this.messages.get(id);

    if (message) {
      this.messages.set(id, {
        ...message,
        status: "FAILED",
      });
    }
  }

  async markPublished(id: string, publishedAt: Date) {
    this.published.push({ id, publishedAt });
    const message = this.messages.get(id);

    if (message) {
      this.messages.set(id, {
        ...message,
        status: "PUBLISHED",
      });
    }
  }
}

class FakeNotificationBookingReader {
  readonly bookings = new Map<string, NotificationBookingReadModel>();

  async findNotificationBookingById(bookingId: string) {
    return this.bookings.get(bookingId) ?? null;
  }
}

class FakeTemplateRenderer implements TemplateRenderer {
  shouldFail = false;

  async render(input: TemplateRenderInput): Promise<TemplateRenderResult> {
    if (this.shouldFail) {
      throw new Error("Renderer failed.");
    }

    const variables = uniqueVariables([
      ...extractTemplateVariables(input.subject),
      ...extractTemplateVariables(input.previewText),
      ...extractTemplateVariables(input.body),
      ...extractTemplateVariables(input.htmlBody),
    ]).filter((variable) => input.allowedVariables.includes(variable));
    const missingVariables = variables.filter(
      (variable) => resolvePath(input.payload, variable) === undefined,
    );

    return {
      missingVariables,
      renderedBody: renderText(input.body, input.payload),
      renderedHtmlBody: input.htmlBody
        ? renderText(input.htmlBody, input.payload)
        : null,
      renderedPreviewText: input.previewText
        ? renderText(input.previewText, input.payload)
        : null,
      renderedSubject: input.subject
        ? renderText(input.subject, input.payload)
        : null,
      variables,
    };
  }
}

class FakeNotificationIdGenerator implements NotificationIdGenerator {
  newNotificationDeliveryId(input: { outboxMessageId: string; ruleId: string }) {
    return `delivery-${input.outboxMessageId}-${input.ruleId}`;
  }

  newNotificationRuleId() {
    return "notification-rule-generated";
  }
}

class FakeClock implements NotificationClock {
  readonly fixedNow = new Date("2026-06-03T10:00:00.000Z");

  now() {
    return this.fixedNow;
  }
}

class FakeNotificationAuditRepository {
  readonly entries: NotificationAuditEntryWriteModel[] = [];

  async record(entry: NotificationAuditEntryWriteModel) {
    this.entries.push(entry);
  }
}

class FakeNotificationProvider implements NotificationProvider {
  readonly sent: NotificationDeliverySnapshot[] = [];
  shouldFail = false;

  async send(delivery: NotificationDeliverySnapshot) {
    if (this.shouldFail) {
      throw new Error("Provider failed.");
    }

    this.sent.push(delivery);

    return {
      provider: `${delivery.channel}_TEST`,
      providerMessageId: "provider-message-1",
    };
  }
}

class FakeNotificationPreviewFixtureProvider {
  readonly fixtures = new Map<string, NotificationPayload>();

  async findByKey(key: string) {
    return this.fixtures.get(key) ?? null;
  }
}

async function captureApplicationError(
  action: () => Promise<unknown>,
): Promise<ApplicationError> {
  try {
    await action();
  } catch (error) {
    expect(error).toBeInstanceOf(ApplicationError);

    return error as ApplicationError;
  }

  throw new Error("Expected an application error.");
}

function extractTemplateVariables(text: string | null) {
  const variables = new Set<string>();

  if (!text) {
    return [];
  }

  for (const match of text.matchAll(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g)) {
    variables.add(match[1]);
  }

  return [...variables];
}

function renderText(text: string, payload: NotificationPayload) {
  return text.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_match, path) => {
    const value = resolvePath(payload, path);

    return value === undefined || value === null ? "" : String(value);
  });
}

function resolvePath(payload: NotificationPayload, path: string) {
  let current: unknown = payload;

  for (const segment of path.split(".")) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function uniqueVariables(variables: string[]) {
  return [...new Set(variables)];
}
