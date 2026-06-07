import { domainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationType } from "./NotificationType";

export type NotificationPayloadValue =
  | boolean
  | null
  | number
  | string
  | NotificationPayloadValue[]
  | { [key: string]: NotificationPayloadValue };

export type NotificationPayload = Record<string, NotificationPayloadValue>;
export type NotificationProviderVariables = Record<string, string>;

export type NotificationDeliveryRecipientType = "BUYER";
export type NotificationDeliveryStatus =
  | "CANCELLED"
  | "DELIVERED"
  | "FAILED"
  | "MANUAL_REVIEW"
  | "PENDING"
  | "SENT";

export type NotificationDeliveryRecipient = {
  email: string | null;
  name: string | null;
  phone: string | null;
  recipientType: NotificationDeliveryRecipientType;
};

export type NotificationDeliveryProps = {
  attempts: number;
  bookingId: string | null;
  channel: NotificationChannel;
  createdAt: Date;
  deliveredAt: Date | null;
  eventType: string;
  failureReason: string | null;
  id: string;
  locale: LocaleCode;
  notificationType: NotificationType;
  outboxMessageId: string | null;
  payload: NotificationPayload;
  provider: string | null;
  providerMessageId: string | null;
  providerTemplateId: string | null;
  providerVariables: NotificationProviderVariables;
  recipient: NotificationDeliveryRecipient;
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedSubject: string | null;
  ruleId: string | null;
  sendAfter: Date | null;
  sentAt: Date | null;
  status: NotificationDeliveryStatus;
  templateId: string | null;
  templateVersion: number | null;
  updatedAt: Date;
};

export type NotificationDeliverySnapshot = {
  attempts: number;
  bookingId: string | null;
  channel: ReturnType<NotificationChannel["toString"]>;
  createdAt: string;
  deliveredAt: string | null;
  eventType: string;
  failureReason: string | null;
  id: string;
  locale: SupportedLocaleCode;
  notificationType: ReturnType<NotificationType["toString"]>;
  outboxMessageId: string | null;
  payload: NotificationPayload;
  provider: string | null;
  providerMessageId: string | null;
  providerTemplateId: string | null;
  providerVariables: NotificationProviderVariables;
  recipient: NotificationDeliveryRecipient;
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedSubject: string | null;
  ruleId: string | null;
  sendAfter: string | null;
  sentAt: string | null;
  status: NotificationDeliveryStatus;
  templateId: string | null;
  templateVersion: number | null;
  updatedAt: string;
};

const supportedStatuses = new Set<NotificationDeliveryStatus>([
  "PENDING",
  "MANUAL_REVIEW",
  "SENT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);

export class NotificationDelivery {
  private constructor(private readonly props: NotificationDeliveryProps) {}

  static create(input: NotificationDeliveryProps) {
    const id = input.id.trim();
    const eventType = input.eventType.trim();
    const bookingId = input.bookingId?.trim() || null;
    const outboxMessageId = input.outboxMessageId?.trim() || null;
    const provider = input.provider?.trim() || null;
    const providerMessageId = input.providerMessageId?.trim() || null;
    const providerTemplateId = input.providerTemplateId?.trim() || null;
    const providerVariables = normalizeProviderVariables(
      input.providerVariables,
    );
    const ruleId = input.ruleId?.trim() || null;
    const templateId = input.templateId?.trim() || null;
    const renderedSubject = normalizeOptionalText(input.renderedSubject);
    const renderedBody = normalizeBody(input.renderedBody);
    const renderedHtmlBody = normalizeHtmlBody(input.renderedHtmlBody);
    const failureReason = normalizeOptionalText(input.failureReason);
    const recipient = normalizeRecipient(input.channel, input.recipient);

    if (!id || !eventType) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery requires id and event type.",
      );
    }

    if (
      input.notificationType.requiresBooking() &&
      !bookingId
    ) {
      throw domainError(
        "NOTIFICATION_TYPE_REQUIRES_BOOKING",
        "Booking notification delivery requires a booking id.",
      );
    }

    if (input.notificationType.requiresSchedule() && !input.sendAfter) {
      throw domainError(
        "NOTIFICATION_TYPE_REQUIRES_SCHEDULE",
        "Reminder notification delivery requires a send schedule.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery status is invalid.",
      );
    }

    if (!Number.isInteger(input.attempts) || input.attempts < 0) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery attempts must be a non-negative integer.",
      );
    }

    if (
      input.templateVersion !== null &&
      (!Number.isInteger(input.templateVersion) || input.templateVersion <= 0)
    ) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery template version must be positive.",
      );
    }

    if (!renderedBody) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery rendered body is required.",
      );
    }

    if (input.channel.value === "EMAIL" && !renderedSubject) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Email notification delivery requires a rendered subject.",
      );
    }

    if (providerMessageId && !provider) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery provider message id requires a provider.",
      );
    }

    if (
      input.channel.value === "WHATSAPP" &&
      input.status === "PENDING" &&
      !providerTemplateId
    ) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Automatic WhatsApp notification delivery requires a provider template id.",
      );
    }

    assertStateDates(input);
    assertDate(input.createdAt, "Notification delivery creation date is invalid.");
    assertDate(input.updatedAt, "Notification delivery update date is invalid.");
    assertNullableDate(
      input.sendAfter,
      "Notification delivery send schedule is invalid.",
    );

    return new NotificationDelivery({
      ...input,
      bookingId,
      eventType,
      failureReason,
      id,
      outboxMessageId,
      provider,
      providerMessageId,
      providerTemplateId,
      providerVariables,
      recipient,
      renderedBody,
      renderedHtmlBody:
        input.channel.value === "EMAIL" ? renderedHtmlBody : null,
      renderedSubject: input.channel.value === "EMAIL" ? renderedSubject : null,
      ruleId,
      templateId,
    });
  }

  static createPending(
    input: Omit<
      NotificationDeliveryProps,
      | "attempts"
      | "deliveredAt"
      | "failureReason"
      | "provider"
      | "providerMessageId"
      | "sentAt"
      | "status"
    >,
  ) {
    return NotificationDelivery.create({
      ...input,
      attempts: 0,
      deliveredAt: null,
      failureReason: null,
      provider: null,
      providerMessageId: null,
      providerTemplateId: input.providerTemplateId,
      providerVariables: input.providerVariables,
      sentAt: null,
      status: "PENDING",
    });
  }

  static createManualReview(
    input: Omit<
      NotificationDeliveryProps,
      | "attempts"
      | "deliveredAt"
      | "failureReason"
      | "provider"
      | "providerMessageId"
      | "sentAt"
      | "status"
    >,
  ) {
    return NotificationDelivery.create({
      ...input,
      attempts: 0,
      deliveredAt: null,
      failureReason: null,
      provider: null,
      providerMessageId: null,
      providerTemplateId: input.providerTemplateId,
      providerVariables: input.providerVariables,
      sentAt: null,
      status: "MANUAL_REVIEW",
    });
  }

  get status() {
    return this.props.status;
  }

  markSent(input: {
    provider: string;
    providerMessageId: string | null;
    sentAt: Date;
  }) {
    assertCanAttemptSend(this.props.status);

    const provider = normalizeText(input.provider);

    if (!provider) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Sent notification delivery requires a provider.",
      );
    }

    return NotificationDelivery.create({
      ...this.props,
      attempts: this.props.attempts + 1,
      deliveredAt: null,
      failureReason: null,
      provider,
      providerMessageId: input.providerMessageId,
      sentAt: input.sentAt,
      status: "SENT",
      updatedAt: input.sentAt,
    });
  }

  markDelivered(input: { deliveredAt: Date }) {
    if (this.props.status !== "SENT") {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID_TRANSITION",
        "Only sent notifications can be marked delivered.",
      );
    }

    return NotificationDelivery.create({
      ...this.props,
      deliveredAt: input.deliveredAt,
      status: "DELIVERED",
      updatedAt: input.deliveredAt,
    });
  }

  markFailed(input: { failedAt: Date; reason: string }) {
    assertCanAttemptSend(this.props.status);

    const reason = normalizeText(input.reason);

    if (!reason) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Failed notification delivery requires a failure reason.",
      );
    }

    return NotificationDelivery.create({
      ...this.props,
      attempts: this.props.attempts + 1,
      failureReason: reason,
      status: "FAILED",
      updatedAt: input.failedAt,
    });
  }

  cancel(input: { cancelledAt: Date; reason: string }) {
    if (["CANCELLED", "DELIVERED", "SENT"].includes(this.props.status)) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID_TRANSITION",
        "Notification delivery can no longer be cancelled.",
      );
    }

    return NotificationDelivery.create({
      ...this.props,
      failureReason: normalizeText(input.reason),
      status: "CANCELLED",
      updatedAt: input.cancelledAt,
    });
  }

  toSnapshot(): NotificationDeliverySnapshot {
    return {
      attempts: this.props.attempts,
      bookingId: this.props.bookingId,
      channel: this.props.channel.toString(),
      createdAt: this.props.createdAt.toISOString(),
      deliveredAt: this.props.deliveredAt?.toISOString() ?? null,
      eventType: this.props.eventType,
      failureReason: this.props.failureReason,
      id: this.props.id,
      locale: this.props.locale.value,
      notificationType: this.props.notificationType.toString(),
      outboxMessageId: this.props.outboxMessageId,
      payload: clonePayload(this.props.payload),
      provider: this.props.provider,
      providerMessageId: this.props.providerMessageId,
      providerTemplateId: this.props.providerTemplateId,
      providerVariables: { ...this.props.providerVariables },
      recipient: { ...this.props.recipient },
      renderedBody: this.props.renderedBody,
      renderedHtmlBody: this.props.renderedHtmlBody,
      renderedSubject: this.props.renderedSubject,
      ruleId: this.props.ruleId,
      sendAfter: this.props.sendAfter?.toISOString() ?? null,
      sentAt: this.props.sentAt?.toISOString() ?? null,
      status: this.props.status,
      templateId: this.props.templateId,
      templateVersion: this.props.templateVersion,
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

function normalizeRecipient(
  channel: NotificationChannel,
  recipient: NotificationDeliveryRecipient,
): NotificationDeliveryRecipient {
  if (recipient.recipientType !== "BUYER") {
    throw domainError(
      "NOTIFICATION_RECIPIENT_INVALID",
      "Notification recipient type is not supported.",
    );
  }

  const name = normalizeOptionalText(recipient.name);
  const email = normalizeOptionalText(recipient.email);
  const phone = normalizeOptionalText(recipient.phone);

  if (channel.value === "EMAIL") {
    if (!email || !isValidEmail(email)) {
      throw domainError(
        "NOTIFICATION_RECIPIENT_MISSING",
        "Email notification recipient requires a valid email.",
      );
    }

    return {
      email: email.toLowerCase(),
      name,
      phone: null,
      recipientType: "BUYER",
    };
  }

  if (!phone || !isValidPhone(phone)) {
    throw domainError(
      "NOTIFICATION_RECIPIENT_MISSING",
      "WhatsApp notification recipient requires a valid phone.",
    );
  }

  return {
    email: null,
    name,
    phone,
    recipientType: "BUYER",
  };
}

function assertStateDates(input: NotificationDeliveryProps) {
  assertNullableDate(input.sentAt, "Notification delivery sent date is invalid.");
  assertNullableDate(
    input.deliveredAt,
    "Notification delivery delivered date is invalid.",
  );

  if (input.status === "SENT" && !input.sentAt) {
    throw domainError(
      "NOTIFICATION_DELIVERY_INVALID",
      "Sent notification delivery requires sent date.",
    );
  }

  if (input.status === "DELIVERED" && (!input.sentAt || !input.deliveredAt)) {
    throw domainError(
      "NOTIFICATION_DELIVERY_INVALID",
      "Delivered notification delivery requires sent and delivered dates.",
    );
  }

  if (input.status === "FAILED" && !normalizeOptionalText(input.failureReason)) {
    throw domainError(
      "NOTIFICATION_DELIVERY_INVALID",
      "Failed notification delivery requires failure reason.",
    );
  }
}

function assertCanAttemptSend(status: NotificationDeliveryStatus) {
  if (["CANCELLED", "DELIVERED"].includes(status)) {
    throw domainError(
      "NOTIFICATION_DELIVERY_INVALID_TRANSITION",
      "Notification delivery is finalized.",
    );
  }
}

function normalizeOptionalText(value: string | null) {
  const normalized = normalizeText(value ?? "");

  return normalized || null;
}

function normalizeBody(value: string) {
  return value.trim().replace(/[ \t]+/g, " ");
}

function normalizeHtmlBody(value: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function assertDate(value: Date, message: string) {
  if (Number.isNaN(value.getTime())) {
    throw domainError("NOTIFICATION_DELIVERY_INVALID", message);
  }
}

function assertNullableDate(value: Date | null, message: string) {
  if (value && Number.isNaN(value.getTime())) {
    throw domainError("NOTIFICATION_DELIVERY_INVALID", message);
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length >= 6 && /^[+]?[\d\s().-]+$/.test(value);
}

function normalizeProviderVariables(
  variables: NotificationProviderVariables,
): NotificationProviderVariables {
  const normalized: NotificationProviderVariables = {};

  for (const [key, value] of Object.entries(variables)) {
    const normalizedKey = normalizeText(key);

    if (!normalizedKey) {
      throw domainError(
        "NOTIFICATION_DELIVERY_INVALID",
        "Notification delivery provider variable name is invalid.",
      );
    }

    normalized[normalizedKey] = String(value);
  }

  return normalized;
}

function clonePayload(payload: NotificationPayload): NotificationPayload {
  return JSON.parse(JSON.stringify(payload)) as NotificationPayload;
}
