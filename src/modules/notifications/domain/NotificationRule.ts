import { domainError } from "@/shared/domain/DomainError";

import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationType } from "./NotificationType";

export type NotificationRuleLocaleStrategy = "BOOKING_PREFERRED_LOCALE";
export type NotificationRuleMissingTranslationBehavior = "DO_NOT_SEND";
export type NotificationRuleRecipientType = "BUYER";
export type NotificationRuleSendMode = "AUTOMATIC" | "MANUAL_REVIEW";
export type NotificationRuleStatus = "ACTIVE" | "ARCHIVED";

export type NotificationRuleDeliveryStatus = "MANUAL_REVIEW" | "PENDING";

export type NotificationRuleProps = {
  channel: NotificationChannel;
  createdAt: Date;
  enabled: boolean;
  eventType: string;
  id: string;
  localeStrategy: NotificationRuleLocaleStrategy;
  missingTranslationBehavior: NotificationRuleMissingTranslationBehavior;
  notificationType: NotificationType;
  recipientType: NotificationRuleRecipientType;
  requiresConsent: boolean;
  sendMode: NotificationRuleSendMode;
  status: NotificationRuleStatus;
  templateId: string | null;
  updatedAt: Date;
  updatedByUserId: string | null;
};

export type NotificationRuleSnapshot = {
  channel: ReturnType<NotificationChannel["toString"]>;
  createdAt: string;
  enabled: boolean;
  eventType: string;
  id: string;
  localeStrategy: NotificationRuleLocaleStrategy;
  missingTranslationBehavior: NotificationRuleMissingTranslationBehavior;
  notificationType: ReturnType<NotificationType["toString"]>;
  recipientType: NotificationRuleRecipientType;
  requiresConsent: boolean;
  sendMode: NotificationRuleSendMode;
  status: NotificationRuleStatus;
  templateId: string | null;
  updatedAt: string;
  updatedByUserId: string | null;
};

const supportedSendModes = new Set<NotificationRuleSendMode>([
  "AUTOMATIC",
  "MANUAL_REVIEW",
]);

const supportedStatuses = new Set<NotificationRuleStatus>([
  "ACTIVE",
  "ARCHIVED",
]);

export class NotificationRule {
  private constructor(private readonly props: NotificationRuleProps) {}

  static create(input: NotificationRuleProps) {
    const id = input.id.trim();
    const eventType = input.eventType.trim();
    const templateId = input.templateId?.trim() || null;
    const updatedByUserId = input.updatedByUserId?.trim() || null;

    if (!id || !eventType) {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Notification rule requires id and event type.",
      );
    }

    if (input.recipientType !== "BUYER") {
      throw domainError(
        "NOTIFICATION_RULE_RECIPIENT_UNSUPPORTED",
        "Notification rule recipient is not supported.",
      );
    }

    if (!input.requiresConsent) {
      throw domainError(
        "NOTIFICATION_RULE_RECIPIENT_UNSUPPORTED",
        "Buyer notification rules require booking consent.",
      );
    }

    if (input.localeStrategy !== "BOOKING_PREFERRED_LOCALE") {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Buyer notification rules must use the booking preferred locale.",
      );
    }

    if (input.missingTranslationBehavior !== "DO_NOT_SEND") {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Buyer notification rules must not silently fallback translations.",
      );
    }

    if (!supportedSendModes.has(input.sendMode)) {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Notification rule send mode is invalid.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Notification rule status is invalid.",
      );
    }

    if (input.enabled && input.status === "ACTIVE" && !templateId) {
      throw domainError(
        "NOTIFICATION_RULE_TEMPLATE_MISSING",
        "Enabled notification rule requires a template.",
      );
    }

    assertDate(input.createdAt, "Notification rule creation date is invalid.");
    assertDate(input.updatedAt, "Notification rule update date is invalid.");

    return new NotificationRule({
      ...input,
      eventType,
      id,
      templateId,
      updatedByUserId,
    });
  }

  get id() {
    return this.props.id;
  }

  get templateId() {
    return this.props.templateId;
  }

  canCreateDelivery() {
    return (
      this.props.enabled &&
      this.props.status === "ACTIVE" &&
      this.props.templateId !== null
    );
  }

  deliveryStatusForRule(): NotificationRuleDeliveryStatus {
    if (!this.canCreateDelivery()) {
      throw domainError(
        "NOTIFICATION_RULE_INVALID",
        "Notification rule cannot create deliveries.",
      );
    }

    return this.props.sendMode === "MANUAL_REVIEW"
      ? "MANUAL_REVIEW"
      : "PENDING";
  }

  withConfiguration(
    patch: Partial<
      Pick<
        NotificationRuleProps,
        | "enabled"
        | "sendMode"
        | "templateId"
        | "updatedAt"
        | "updatedByUserId"
      >
    >,
  ) {
    return NotificationRule.create({
      ...this.props,
      ...patch,
    });
  }

  archive(input: { updatedAt: Date; updatedByUserId: string | null }) {
    return NotificationRule.create({
      ...this.props,
      enabled: false,
      status: "ARCHIVED",
      updatedAt: input.updatedAt,
      updatedByUserId: input.updatedByUserId,
    });
  }

  toSnapshot(): NotificationRuleSnapshot {
    return {
      channel: this.props.channel.toString(),
      createdAt: this.props.createdAt.toISOString(),
      enabled: this.props.enabled,
      eventType: this.props.eventType,
      id: this.props.id,
      localeStrategy: this.props.localeStrategy,
      missingTranslationBehavior: this.props.missingTranslationBehavior,
      notificationType: this.props.notificationType.toString(),
      recipientType: this.props.recipientType,
      requiresConsent: this.props.requiresConsent,
      sendMode: this.props.sendMode,
      status: this.props.status,
      templateId: this.props.templateId,
      updatedAt: this.props.updatedAt.toISOString(),
      updatedByUserId: this.props.updatedByUserId,
    };
  }
}

function assertDate(value: Date, message: string) {
  if (Number.isNaN(value.getTime())) {
    throw domainError("NOTIFICATION_RULE_INVALID", message);
  }
}
