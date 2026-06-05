import {
  ApplicationError,
  applicationError,
} from "@/shared/application/ApplicationError";
import { LocaleCode } from "@/shared/domain/LocaleCode";

import type {
  NotificationRuleSkipReason,
  ProcessOutboxNotificationEventCommand,
  ProcessOutboxNotificationEventResultDto,
} from "./NotificationDtos";
import { addNotificationTemplatePayloadAliases } from "./NotificationTemplatePayloadAliases";
import type {
  NotificationBookingReader,
  NotificationBookingReadModel,
} from "./ports/NotificationBookingReader";
import type { BookingAccessLinkIssuer } from "./ports/BookingAccessLinkIssuer";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationDeliveryRepository } from "./ports/NotificationDeliveryRepository";
import type { NotificationIdGenerator } from "./ports/NotificationIdGenerator";
import type { NotificationRuleRepository } from "./ports/NotificationRuleRepository";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";
import type {
  NotificationOutboxMessageReadModel,
  OutboxRepository,
} from "./ports/OutboxRepository";
import type { TemplateRenderer } from "./ports/TemplateRenderer";
import { NotificationChannel } from "../domain/NotificationChannel";
import {
  NotificationDelivery,
  type NotificationDeliveryRecipient,
  type NotificationPayload,
  type NotificationPayloadValue,
} from "../domain/NotificationDelivery";
import type { NotificationRule } from "../domain/NotificationRule";
import {
  type BookingNotificationOutboxEventType,
  NotificationType,
} from "../domain/NotificationType";

const supportedOutboxEvents = new Set<string>([
  "BookingCreated",
  "BookingUpdated",
  "BookingRescheduled",
  "BookingCancelled",
  "BookingDepositPaid",
  "BookingPaymentFailed",
  "BookingExpired",
  "BookingReminderDue",
]);

export class ProcessOutboxNotificationEventUseCase {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly bookings: NotificationBookingReader,
    private readonly rules: NotificationRuleRepository,
    private readonly templates: NotificationTemplateRepository,
    private readonly deliveries: NotificationDeliveryRepository,
    private readonly renderer: TemplateRenderer,
    private readonly ids: NotificationIdGenerator,
    private readonly clock: NotificationClock,
    private readonly bookingAccessLinks?: BookingAccessLinkIssuer,
  ) {}

  async execute(
    command: ProcessOutboxNotificationEventCommand,
  ): Promise<ProcessOutboxNotificationEventResultDto> {
    const now = this.clock.now();
    const outboxMessage = await this.outbox.findById(command.outboxMessageId);

    if (!outboxMessage) {
      throw applicationError(
        "NOTIFICATION_OUTBOX_MESSAGE_NOT_FOUND",
        "Outbox message was not found.",
      );
    }

    assertSupportedOutboxMessage(outboxMessage);

    try {
      const booking = await this.bookings.findNotificationBookingById(
        outboxMessage.aggregateId,
      );

      if (!booking) {
        throw applicationError("BOOKING_NOT_FOUND", "Booking was not found.");
      }

      const matchingRules = await this.rules.listByEventType(
        outboxMessage.eventType,
      );
      const createdDeliveryIds: string[] = [];
      const skippedRules: ProcessOutboxNotificationEventResultDto["skippedRules"] =
        [];

      for (const rule of matchingRules) {
        const skippedReason = await this.getRuleSkipReason(
          outboxMessage,
          rule,
        );

        if (skippedReason) {
          skippedRules.push({
            reason: skippedReason,
            ruleId: rule.id,
          });
          continue;
        }

        const deliveryResult = await this.createDeliveryForRule({
          booking,
          outboxMessage,
          rule,
          sentAt: now,
        });

        if (deliveryResult.skippedReason) {
          skippedRules.push({
            reason: deliveryResult.skippedReason,
            ruleId: rule.id,
          });
          continue;
        }

        await this.deliveries.save(deliveryResult.delivery);
        createdDeliveryIds.push(deliveryResult.delivery.toSnapshot().id);
      }

      await this.outbox.markPublished(outboxMessage.id, now);

      return {
        createdDeliveryIds,
        outboxMessageId: outboxMessage.id,
        skippedRules,
        status: "PUBLISHED",
      };
    } catch (error) {
      await this.outbox.markFailed(
        outboxMessage.id,
        now,
        error instanceof Error ? error.message : "Notification processing failed.",
      );

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw applicationError(
        "NOTIFICATION_PROCESSING_FAILED",
        "Notification processing failed.",
      );
    }
  }

  private async getRuleSkipReason(
    outboxMessage: NotificationOutboxMessageReadModel,
    rule: NotificationRule,
  ): Promise<NotificationRuleSkipReason | null> {
    if (!rule.canCreateDelivery()) {
      return "RULE_DISABLED";
    }

    const existingDelivery =
      await this.deliveries.findByOutboxMessageAndRule({
        outboxMessageId: outboxMessage.id,
        ruleId: rule.id,
      });

    if (existingDelivery) {
      return "ALREADY_PROCESSED";
    }

    const ruleSnapshot = rule.toSnapshot();

    if (!ruleSnapshot.templateId) {
      return "TEMPLATE_MISSING";
    }

    const template = await this.templates.findById(ruleSnapshot.templateId);

    if (!template || template.status !== "ACTIVE") {
      return "TEMPLATE_MISSING";
    }

    return null;
  }

  private async createDeliveryForRule(input: {
    booking: NotificationBookingReadModel;
    outboxMessage: NotificationOutboxMessageReadModel;
    rule: NotificationRule;
    sentAt: Date;
  }): Promise<
    | {
        delivery: NotificationDelivery;
        skippedReason: null;
      }
    | {
        delivery: null;
        skippedReason: NotificationRuleSkipReason;
      }
  > {
    const ruleSnapshot = input.rule.toSnapshot();
    const channel = NotificationChannel.create(ruleSnapshot.channel);
    const preference =
      ruleSnapshot.channel === "EMAIL"
        ? input.booking.notificationPreferences.email
        : input.booking.notificationPreferences.whatsapp;

    if (
      ruleSnapshot.requiresConsent &&
      (!preference.enabled ||
        preference.consentStatus !== "GRANTED" ||
        !preference.destination)
    ) {
      return {
        delivery: null,
        skippedReason: "CONSENT_MISSING",
      };
    }

    const template = await this.templates.findById(ruleSnapshot.templateId ?? "");

    if (!template || template.status !== "ACTIVE") {
      return {
        delivery: null,
        skippedReason: "TEMPLATE_MISSING",
      };
    }

    const locale = input.booking.notificationPreferences.preferredLocale;
    const templateSnapshot = template.toSnapshot();
    const translation = templateSnapshot.translations.find(
      (item) => item.locale === locale && item.status === "PUBLISHED",
    );

    if (!translation) {
      return {
        delivery: null,
        skippedReason: "TRANSLATION_MISSING",
      };
    }

    const bookingAccessUrl = await this.issueBookingAccessUrl({
      booking: input.booking,
      issuedAt: input.sentAt,
      locale,
    });
    const payload = createRenderPayload(
      input.booking.templatePayload,
      {
        eventType: input.outboxMessage.eventType,
        outboxMessageId: input.outboxMessage.id,
      },
      bookingAccessUrl,
    );
    const rendered = await this.renderer.render({
      allowedVariables: templateSnapshot.allowedVariables,
      body: translation.body,
      payload,
      previewText: translation.previewText,
      subject: translation.subject,
    });
    const deliveryStatus = input.rule.deliveryStatusForRule();
    const providerTemplateId =
      ruleSnapshot.channel === "WHATSAPP"
        ? templateSnapshot.providerTemplateId
        : null;

    if (
      ruleSnapshot.channel === "WHATSAPP" &&
      deliveryStatus === "PENDING" &&
      !providerTemplateId
    ) {
      return {
        delivery: null,
        skippedReason: "PROVIDER_TEMPLATE_MISSING",
      };
    }

    const deliveryInput = {
      bookingId: input.booking.id,
      channel,
      createdAt: input.sentAt,
      eventType: input.outboxMessage.eventType,
      id: this.ids.newNotificationDeliveryId({
        outboxMessageId: input.outboxMessage.id,
        ruleId: input.rule.id,
      }),
      locale: LocaleCode.create(locale),
      notificationType: NotificationType.create(ruleSnapshot.notificationType),
      outboxMessageId: input.outboxMessage.id,
      payload,
      providerTemplateId,
      providerVariables:
        ruleSnapshot.channel === "WHATSAPP"
          ? createProviderVariables(payload, rendered.variables)
          : {},
      recipient: createRecipient({
        channel: ruleSnapshot.channel,
        customerName: input.booking.customerName,
        destination: preference.destination,
      }),
      renderedBody: rendered.renderedBody,
      renderedSubject: rendered.renderedSubject,
      ruleId: input.rule.id,
      sendAfter: null,
      templateId: templateSnapshot.id,
      templateVersion: templateSnapshot.version,
      updatedAt: input.sentAt,
    };

    return {
      delivery:
        deliveryStatus === "MANUAL_REVIEW"
          ? NotificationDelivery.createManualReview(deliveryInput)
          : NotificationDelivery.createPending(deliveryInput),
      skippedReason: null,
    };
  }

  private async issueBookingAccessUrl(input: {
    booking: NotificationBookingReadModel;
    issuedAt: Date;
    locale: string;
  }) {
    if (!this.bookingAccessLinks) {
      return "";
    }

    const issued = await this.bookingAccessLinks.execute({
      bookingId: input.booking.id,
      issuedAt: input.issuedAt,
      locale: input.locale,
      reference: input.booking.reference,
    });

    return issued.url;
  }
}

function assertSupportedOutboxMessage(
  outboxMessage: NotificationOutboxMessageReadModel,
) {
  if (
    outboxMessage.aggregateType !== "BOOKING" ||
    !supportedOutboxEvents.has(outboxMessage.eventType)
  ) {
    throw applicationError(
      "NOTIFICATION_OUTBOX_EVENT_UNSUPPORTED",
      "Outbox event is not supported by notification processing.",
    );
  }

  NotificationType.fromOutboxEvent(
    outboxMessage.eventType as BookingNotificationOutboxEventType,
  );
}

function createRecipient(input: {
  channel: string;
  customerName: string | null;
  destination: string | null;
}): NotificationDeliveryRecipient {
  if (input.channel === "EMAIL") {
    return {
      email: input.destination,
      name: input.customerName,
      phone: null,
      recipientType: "BUYER",
    };
  }

  return {
    email: null,
    name: input.customerName,
    phone: input.destination,
    recipientType: "BUYER",
  };
}

function createRenderPayload(
  bookingPayload: NotificationPayload,
  outbox: { eventType: string; outboxMessageId: string },
  bookingAccessUrl = "",
): NotificationPayload {
  return addNotificationTemplatePayloadAliases({
    ...bookingPayload,
    booking: notificationPayloadRecordWithAccessUrl(
      bookingPayload.booking,
      bookingAccessUrl,
    ),
    outbox,
  });
}

function notificationPayloadRecordWithAccessUrl(
  booking: NotificationPayloadValue | undefined,
  bookingAccessUrl: string,
): NotificationPayloadValue {
  if (!isRecord(booking)) {
    return {
      accessUrl: bookingAccessUrl,
    };
  }

  return {
    ...booking,
    accessUrl: bookingAccessUrl,
  };
}

function createProviderVariables(
  payload: NotificationPayload,
  variables: string[],
) {
  const providerVariables: Record<string, string> = {};

  for (const variable of variables) {
    const value = resolvePayloadPath(payload, variable);

    if (value === undefined || value === null) {
      providerVariables[variable] = "";
      continue;
    }

    providerVariables[variable] =
      typeof value === "object" ? JSON.stringify(value) : String(value);
  }

  return providerVariables;
}

function resolvePayloadPath(payload: NotificationPayload, path: string) {
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
